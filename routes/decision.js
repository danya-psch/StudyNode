const express = require('express');
const router = express.Router();
const Decision = require("../models/decision");
const Check = require("../models/checkU");

const Telegram = require("../modules/telegram");
const User = require("../models/user");
const Node = require("../models/node");

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
	const fileObject = req.files.file;
	const fileBuffer = fileObject.data;
    cloudinary.v2.uploader.upload_stream({ resource_type: 'raw' },
        function (error, result) {
            Decision.insert(
                new Decision(
                    req.body.node,
                    result.url,
                    req.user._id,
                    req.body.teacher,
                    req.body.courseId,
                    new Date()
                )
            )
            .then(() => {
                return Promise.all([
                    User.getById(req.body.teacher),
                    User.getById(req.user._id),
                    Node.getById(req.body.node),
                ])
            })
            .then(([teacher, user, node]) => {
                console.log("!");
                console.log(teacher.telegram_chat_id);
                console.log("!");
                if (typeof teacher.telegram_chat_id !== 'undefimed' && teacher.telegram_chat_id !== null) {
                    Telegram.sendNotifications(teacher.telegram_chat_id, `User ${user.name} sent a solution to the task: ${node.task.name}`);
                }
                
                res.status(201).send("well done!");
            })
            .catch(err => res.status(500).send(err.toString()));
        })
        .end(fileBuffer);
}

router.get("/", Check.checkTeacher, (req, res) => {
    Decision.getMy(req.user._id)
    .then((items) => {
        res.render("decision", { page_name : "decision", decisions : items });
    })
    .catch(err => res.status(500).send(err.toString()));
});

router.get("/get", Check.checkTeacher, (req, res) => {
	Decision.getMy(req.user._id)
    .then((items) => {
        res.status(201).send({ decisions : items });
    })
    .catch(err => res.status(500).send(err.toString()));
});

router.post("/new", Check.checkAuth, (req, res) => {
    handleFileUpload(req, res);
	// Decision.insert(
    //     new Decision(
    //         req.body.node,
    //         "https://res.cloudinary.com/studynodecloud/image/upload/v1541261997/nodelogoR.png",
    //         req.user._id,
    //         req.body.teacher,
    //         req.body.courseId,
    //         new Date()
    //     )
    // )
    // .then(() => {
    //     return Promise.all([
    //         User.getById(req.body.teacher),
    //         User.getById(req.user._id),
    //         Node.getById(req.body.node),
    //     ])
    // })
    // .then(([teacher, user, node]) => {
    //     // if (typeof teacher.telegram_chat_id !== 'undefimed' && teacher.telegram_chat_id !== null) {
    //     //     Telegram.sendNotifications(teacher.telegram_chat_id, `User ${user.name} sent a solution to the task: ${node.task.name}`);
    //     // }
        
    //     res.status(201).send("well done!");
    // })
    // .catch(err => res.status(500).send(err.toString()));
});

module.exports = router;