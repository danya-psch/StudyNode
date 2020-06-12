const express = require('express');
const Course = require("../models/course");
const Task = require("../models/task");
const path = require('path');
const Check = require("../models/checkU");
const ObjectId = require("mongodb").ObjectId;
const Node = require("../models/node");
const THREE = require('three');

const router = express.Router();


// const urlencodedBodyParser = require('body-parser');
// const bodyParser = require('busboy-body-parser');
// router.use(bodyParser({ limit: '3mb' }));
// router.use(urlencodedBodyParser.urlencoded({ extended: false }));
//

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
	
	const fileObject = req.files.avatar;
	const fileBuffer = fileObject.data;
    cloudinary.v2.uploader.upload_stream({ resource_type: 'raw' },
        function (error, result) { 
			Task.insert(new Task('root', 'subject', 6, "description"))
			.then(task => {
				return Node.insert(new Node(
					new THREE.Vector3(0, 0, 0), [], [], task._id
				))
			})
			.then(node => {
				return Course.insert(
					new Course(
						req.body.name,
						result.url,
						node._id,
						[],
						req.user._id,
						req.body.description
					)
				)
			})
			.then(course => res.redirect(`${course.id}`))
			.catch(err => res.status(500).send(err.toString()));
        })
        .end(fileBuffer);
}
//

// const multer  = require('multer');
// const storage = multer.diskStorage({
// 	destination : 'data/fs/',
// 	filename : function(req, file, callback) {
// 		callback(null, file.fieldname + '-' + Date.now() + 
// 	    path.extname(file.originalname));
// 	}
// });

// const upload = multer({
// 	storage: storage
// }).single('avatar');

// router.get("/", Check.checkAdmin, (req, res) => {
// 	Course.getAll()
// 		.then((items) => {
// 			res.render("courses", {page_name : "courses", courses : items});
// 		})
// 		.catch(err => res.status(500).send(err.toString()));
// });

// router.get("/new", Check.checkAdmin, (req, res) => {
	
	// Task.getAll()
	// .then((items) => {
	// 	let tasks = [];
	// 	for (let task of items) {
	// 		tasks.push({ id : task.id.toString(), name : task.name });
	// 	}
	//	res.render("newcourse"); //{tasks : tasks }
	// })
	// .catch(err => res.status(500).send(err.toString()));
// });

// function createOrUpdateCourse(bodysubject, bodytasks) {
// 	let avaUrl = '/data/fs/nodelogoR.png';
// 	switch (bodysubject) {
// 		case "red" : { avaUrl = 'http://res.cloudinary.com/studynodecloud/image/upload/nodelogoR.png'; break; }
// 		case "green" : { avaUrl = 'http://res.cloudinary.com/studynodecloud/image/upload/nodelogoG.png'; break; }
// 		case "blue" : { avaUrl = 'http://res.cloudinary.com/studynodecloud/image/upload/nodelogoB.png'; break; }
// 	}
// 	let idOfTasks = [];
// 	if (typeof bodytasks === 'undefined') return {avaUrl : avaUrl, idOfTasks : idOfTasks};
// 	if (typeof bodytasks === 'string') return {avaUrl : avaUrl, idOfTasks : bodytasks};
	
// 	for (let id of bodytasks) {
// 		idOfTasks.push(ObjectId(id));
// 	}
// 	return {avaUrl : avaUrl, idOfTasks : idOfTasks};
	
// }

// router.post("/new", Check.checkAdmin, (req, res) => {
// 	Course.insert(
// 		new Course(
// 			req.body.name,
// 			"https://res.cloudinary.com/studynodecloud/image/upload/v1541261997/nodelogoR.png",
// 			[],
// 			req.user._id,
// 			req.body.description
// 		)
// 	)
// 		.then(course => res.redirect(`${course.id}`))
// 		.catch(err => res.status(500).send(err.toString()));

// });

// router.get("/:id/update", Check.checkAdmin, (req, res) => {
// 	Task.getAll()
// 		.then((items) => {
// 			let tasks = [];
// 			for (let task of items) {
// 				tasks.push({ id : task.id.toString(), name : task.name });
// 			}
// 			res.render("updcourse", {id : req.params.id, tasks : tasks });
// 		})
// 		.catch(err => res.status(500).send(err.toString()));
// });

// router.post("/:id/update", Check.checkAdmin, (req, res) => {
// 	upload(req, res, (err) => {
// 		if (err) {
// 			res.render('index', {msg: err});
// 		} else {
// 			const avaAndTasks = createOrUpdateCourse(req.body.subject, req.body.tasks);
// 			Course.update(req.params.id, 
// 				new Course(
// 					req.body.name,
// 					req.body.subject,
// 					avaAndTasks.avaUrl,
// 					avaAndTasks.idOfTasks
// 				)
// 			)
// 				.then(course => res.redirect(`/courses/${course.id}`))
// 				.catch(err => res.status(500).send(err.toString()));
// 		}
// 	});
// });

// router.get("/:id", Check.checkAuth, (req, res) => {
// 	Course.getById(req.params.id)
// 		.then(course => {
// 			if (typeof course === 'undefined')  res.status(404).send("course not found"); 
// 			else res.render("course", { course: course });
// 		})
// 		.catch(err => res.status(500).send(err.toString()));
// });

// router.post("/delete/:id", Check.checkAuth, (req, res) => {
// 	Course.delete(req.params.id)
// 		.then(() => {
// 			res.redirect('/courses');
// 		})
// 		.catch(err => res.status(500).send(err.toString()));
// });

///////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/", Check.checkAuth, (req, res) => {
	Course.getAll()
		.then((items) => {
			res.render("courses", { page_name : "courses", courses : items });
		})
		.catch(err => res.status(500).send(err.toString()));
});

router.get("/new", Check.checkAuth, (req, res) => {
	res.render("newcourse");
});

router.post("/new", Check.checkTeacher, (req, res) => {
	handleFileUpload(req, res);
	// Task.insert(new Task('root', 'subject', 6, "description"))
	// .then(task => {
	// 	return Node.insert(new Node(
	// 		new THREE.Vector3(0, 0, 0), [], [], task._id, `tasks/${task._id}`
	// 	))
	// })
	// .then(node => {
	// 	return Course.insert(
	// 		new Course(
	// 			req.body.name,
	// 			"https://res.cloudinary.com/studynodecloud/image/upload/v1541261997/nodelogoR.png",
	// 			node._id,
	// 			[],
	// 			req.user._id,
	// 			req.body.description
	// 		)
	// 	)
	// })
	// .then(course => res.redirect(`${course.id}`))
	// .catch(err => res.status(500).send(err.toString()));
});

router.post("/delete/:id", Check.checkProperty, Check.checkTeacher, (req, res) => {

	Course.delete(req.params.id)
		.then(() => {
			res.redirect('/courses');
		})
		.catch(err => res.status(500).send(err.toString()));
});

router.get("/:id", Check.checkTeacher, (req, res) => {
	Course.getById(req.params.id)
		.then(course => {
			if (typeof course === 'undefined')  res.status(404).send("course not found"); 
			else res.render("webgl2", { courseId : course._id, courseName : course.name });
		})
		.catch(err => res.status(500).send(err.toString()));
});

router.get("/check/:id", Check.checkAuth, (req, res) => {
	Course.getById(req.params.id)
		.then(course => {
			if (typeof course === 'undefined')  res.status(404).send("course not found"); 
			else res.render("webgl", { courseId : course._id, courseName : course.name });
		})
		.catch(err => res.status(500).send(err.toString()));
});



router.get("/graph/:id", Check.checkAuth, (req, res) => {
	Course.getById(req.params.id)
		.then(course => {
			if (typeof course === 'undefined' || typeof req.user === 'undefined' )  res.status(404).render("nAccess");
			else res.json({root : course.root, nodes : course.graph , user : req.user, teacher : course.creator});
		})
		.catch(err => res.status(500).send(err.toString()));
});

router.post("/insertNode/:id", Check.checkProperty, Check.checkTeacher, (req, res) => {
	Task.insert(new Task('task', 'subject', 4, "description"))
	.then(task => {
		return Promise.all([
			Course.getById(req.params.id),
			Node.insert(new Node(
				new THREE.Vector3(req.body.position.x, req.body.position.y, req.body.position.z), [], [], task._id
			))
		]);
	})
	.then(([curCourse, newNode]) => {
		let graph = curCourse.graph;
		graph.push(newNode);
		Course.update(
			req.params.id,
			new Course(curCourse.name, curCourse.avaUrl, req.body.root._id, graph, req.body.creator, curCourse.description)
		)
		return Node.getById(newNode._id);
	})
	.then(node => res.status(201).send(node))
	.catch(err => console.log(err));
});

router.post("/deleteNode/:id", Check.checkProperty, Check.checkTeacher, (req, res) => {
	Node.delete(req.body.id)
	.then(() => {
		return Course.getById(req.params.id);
	})
	.then(curCourse => {
		let graph = curCourse.graph;
		Course.update(
			req.params.id,
			new Course(curCourse.name, curCourse.avaUrl, req.body.root._id, graph, req.body.creator, curCourse.description)
		)
		res.status(201).send("well done!");
	})
	.catch(err => console.log(err));
});



router.post("/update", Check.checkProperty, Check.checkTeacher, (req, res) => {
	Node.update(req.body.root._id, new Node(req.body.root.position, req.body.root.parents, req.body.root.childs, req.body.root.task));
	for (let node of req.body.nodes) {
		Node.update(node._id, new Node(node.position, node.parents, node.childs, node.task));
	}
	res.status(200).send("well done!");
});

module.exports = router;