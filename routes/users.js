const express = require('express');
const User = require("../models/user");
const Decision = require("../models/decision");
const Check = require("../models/checkU");
const Telegram = require("../modules/telegram");
const Node = require("../models/node");

const router = express.Router();


const urlencodedBodyParser = require('body-parser');
const bodyParser = require('busboy-body-parser');
router.use(bodyParser({ limit: '3mb' }));
router.use(urlencodedBodyParser.urlencoded({ extended: false }));

const config = require('../config');
const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret
});

function handleFileUpload(req, res) {
	const fileObject = req.files.avaUrl;
    const fileBuffer = fileObject.data;
    const id = req.user._id;
    cloudinary.v2.uploader.upload_stream({ resource_type: 'raw' },
        function (error, result) { 
            
            User.getById(id)
            .then(user => {
                User.updateWithoutHashing(id,
                    new User
                    (
                        user.name,
                        user.lastName,
                        user.password,
                        user.courses,
                        user.role,
                        user.date,
                        (typeof req.body.telegram !== 'undefined') ? req.body.telegram : user.telegram,
                        user.telegram_chat_id,
                        result.url,
                        user.dateOfBirth,
                        (typeof req.body.facebook !== 'undefined') ? req.body.facebook : user.facebookName,
                        user.facebookId
                    )
                );

                res.status(201).send({avaUrl : result.url,
                    telegram : (typeof req.body.telegram !== 'undefined') ? req.body.telegram : user.telegram,
                    facebook : (typeof req.body.facebook !== 'undefined') ? req.body.facebook : user.facebookName
                });
            })
            .catch(err => console.log(err));
        })
        .end(fileBuffer);
}

router.get("/", Check.checkAdmin, (req, res) => {
	User.getAll()
		.then(users => res.render("users", { page_name : "users", users: users }))
		.catch(err => res.status(500).send(err.toString()));
});

router.get("/:userId", Check.checkAdmin, (req, res) => {
	const userId = req.params.userId;
	User.getById(userId)
		.then(user => {
			if (typeof user === 'undefined')  res.status(404).send("user not found"); 
			else {
				let roles = [];
				for (let key in Check.Role) {
					roles.push(key);
				}
				roles.splice(roles.indexOf(user.role), 1);
				res.render("user", { auth: user , roles : roles});
			}
		})
		.catch(err => res.status(500).send(err.toString()));
});

router.post("/change", Check.checkAdmin, (req, res) => {
	const id = req.body.id;
	User.getById(id)
	.then(user => {
        return User.updateWithoutHashing(id, new User(
            user.name,
            user.lastName,
            user.password,
            user.courses,
            req.body.role,
            user.date,
            user.telegram,
            user.telegram_chat_id,
            user.avaUrl,
            user.dateOfBirth,
            user.facebookName,
            user.facebookId
        ));
	})
	.then(result => res.status(201).send(result))
	.catch(err => console.log(err));
});

router.post("/update", Check.checkAuth, (req, res) => {
    if (typeof req.files.avaUrl !== 'undefined') {
        handleFileUpload(req, res);
    } else {
        const id = req.user._id;
        User.getById(id)
        .then(user => {
            User.updateWithoutHashing(id,
                new User
                (
                    user.name,
                    user.lastName,
                    user.password,
                    user.courses,
                    user.role,
                    user.date,
                    (typeof req.body.telegram !== 'undefined') ? req.body.telegram : user.telegram,
                    user.telegram_chat_id,
                    user.avaUrl, //(typeof req.files.avaUrl !== 'undefined') ? "https://res.cloudinary.com/studynodecloud/image/upload/v1541261997/nodelogoR.png" : user.avaUrl,
                    user.dateOfBirth,
                    (typeof req.body.facebook !== 'undefined') ? req.body.facebook : user.facebookName,
                    user.facebookId
                )
                
            );
            res.json({avaUrl : user.avaUrl,
                telegram : (typeof req.body.telegram !== 'undefined') ? req.body.telegram : user.telegram,
                facebook : (typeof req.body.facebook !== 'undefined') ? req.body.facebook : user.facebookName
            });
        })
        .catch(err => console.log(err));

    }
    
});

router.post('/addNode', (req, res) => {
    User.getById(req.body.user)
    .then(auth => {
        let courses = auth.courses;
        courses.find(course => {
            if (String(course.courseId) === String(req.body.courseId)) {
                let result = course.nodes.filter(node => node.id === req.body.node);
                if (result.length > 0) {
                    result[0].balls = req.body.balls;
                    result[0].name = req.body.nodeName;
                } else {
                    course.nodes.push({ id : req.body.node, name: req.body.nodeName, balls : req.body.balls });
                }
                Decision.delete(req.body.decision);
            }
        });
        console.log("!");
        console.log(auth.telegram_chat_id);
        console.log("!");
        Node.getById(req.body.node)
        .then(node => {
            if (typeof auth.telegram_chat_id !== 'undefimed' && auth.telegram_chat_id !== null) {
                let message = `Your decision has been verified:\n    task: ${node.task.name}\n    balls: ${req.body.balls}/${node.task.balls}`;
                Telegram.sendNotifications(auth.telegram_chat_id, message);
            }
        })
        


        User.updateWithoutHashing(auth._id, new User(
            auth.name,
            auth.lastName,
            auth.password,
            courses,
            auth.role,
            auth.date,
            auth.telegram,
            auth.telegram_chat_id,
            auth.avaUrl,
            auth.dateOfBirth,
            auth.facebookName,
            auth.facebookId
        ))
        .then(() => res.status(201).send("well done!"))
        .catch(err => ser.status(404).send(err));
    })
});

router.post('/addCourse', (req, res) => {
    User.getById(req.user._id)
    .then(auth => {
        let courses = auth.courses;

        let course = courses.find(course => {
            if (course.courseId === req.body.courseId) return course;
        });

        if (typeof course === 'undefined') {
            courses.push({ courseId: req.body.courseId, courseName: req.body.courseName, nodes: [] });
        }

        User.updateWithoutHashing(auth._id, new User(
            auth.name,
            auth.lastName,
            auth.password,
            courses,
            auth.role,
            auth.date,
            auth.telegram,
            auth.telegram_chat_id,
            auth.avaUrl,
            auth.dateOfBirth,
            auth.facebookName,
            auth.facebookId))
        .then(() => res.status(201).send("well done!"))
        .catch(err => ser.status(404).send(err));
    })
});

module.exports = router;