const express = require('express');
const Task = require("../models/task");
const Check = require("../models/checkU");
const path = require('path');

const router = express.Router();
const step = 1;
///
const multer  = require('multer');
const storage = multer.diskStorage({
	destination : 'data/fs/',
	filename : function(req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now() + 
	    path.extname(file.originalname));
	}
});

const upload = multer({
	storage: storage
}).single('avatar');
///

// router.set('javascript', path.join(__dirname, 'javascript'));
// router.set('view engine', 'ejs');
const urlencodedBodyParser = require('body-parser');
// const bodyParser = require('busboy-body-parser');
// router.use(bodyParser({ limit: '3mb' }));
router.use(urlencodedBodyParser.urlencoded({ extended: false }));


// const config = require('../config');
// const cloudinary = require('cloudinary');
// cloudinary.config({
//     cloud_name: config.cloudinary.cloud_name,
//     api_key: config.cloudinary.api_key,
//     api_secret: config.cloudinary.api_secret
// });

// function handleFileUpload(req, res) {
	
//     const fileObject = req.files.avatar;
// 	const fileBuffer = fileObject.data;
//     cloudinary.v2.uploader.upload_stream({ resource_type: 'raw' },
//         function (error, result) { 
//             console.log(result.url);
// 			Task.insert(
// 				new Task(
// 					req.body.name,
// 					req.body.subject,
// 					parseInt(req.body.balls),
// 					result.url,
// 					req.body.description
// 				)
// 			)
// 				.then(task => res.redirect(`${task.id}`))
// 				.catch(err => res.status(500).send(err.toString()));
//         })
//         .end(fileBuffer);
// }

function createObj(data, pageFromReq, str) {
	const start = (typeof pageFromReq !== 'undefined') ? (parseInt(pageFromReq) - 1) * step : 0;
	const finish = (start + step > data.length) ?  data.length : start + step;
	let array = [];
	const page = (typeof pageFromReq !== 'undefined') ? pageFromReq : 1;
	for (let i = start; i < finish ; i++) {
		array.push(data[i]);
	}
	return Object({page_name : "tasks", tasks : array, str : str, page : page, pages : Math.ceil(data.length / step)});
};

router.get("/", Check.checkAuth, (req, res) => {
	Task.getAll()
		.then((items) => {
			res.render("tasks", {page : 1, pages : Math.ceil(items.length / step)});
			// if (typeof req.query.text !== 'undefined') {
			// 	let array = [];
			// 	for (let task of items) {
			// 		if (task.name.toUpperCase().indexOf(req.query.text.toUpperCase()) > -1) array.push(task);
			// 	}
			// 	res.render("tasks", createObj(array, req.query.page, req.query.text));
			// } else {
			// 	res.render("tasks", createObj(items, req.query.page, ""));
			// }
		})
		.catch(err => res.status(500).send(err.toString()));
});

router.get("/new", Check.checkAdmin, (req, res) => {
	res.render("newtask", { page_name : "newtask"});
});

router.post("/new", Check.checkAdmin, (req, res) => {
	// handleFileUpload(req, res);

	///
	upload(req, res, (err) => {
		if (err) {
			res.render('index', {msg: err});
		} else {
			Task.insert(
				new Task(
					req.body.name,
					req.body.subject,
					parseInt(req.body.balls),
					"https://res.cloudinary.com/studynodecloud/image/upload/v1541775220/wplanet.png",//`/${req.file.path}`,
					req.body.description
				)
			)
				.then(task => res.redirect(`${task.id}`))
				.catch(err => res.status(500).send(err.toString()));
		}
	});
	///
});

router.get("/:id", Check.checkAuth, (req, res) => {
	Task.getById(req.params.id)
		.then(task => {
			if (typeof task === 'undefined')  res.status(404).send("task not found"); 
			else res.render("task", { task: task });
		})
		.catch(err => res.status(500).send(err.toString()));
});

router.post("/delete/:id", Check.checkAdmin, (req, res) => {
	Task.delete(req.params.id)
		.then(() => {
			res.redirect('/tasks');
		})
		.catch(err => res.status(500).send(err.toString()));
});

router.post('/', /*Check.checkAuth,*/ (req, res) => {
	Task.getAll()
	.then((items) => {
		if (typeof req.query.text !== 'undefined') {
			let array = [];
			for (let task of items) {
				if (task.name.toUpperCase().indexOf(req.query.text.toUpperCase()) > -1) array.push(task);
			}
			res.send(createObj(array, req.query.page, req.query.text));
		} else {
			res.send(createObj(items, req.query.page, ""));
		}
	})
	.catch(err => res.status(500).send(err.toString()));
});

router.post("/update/:id", Check.checkProperty, (req, res) => {
	Task.update(req.params.id, new Task(req.body.name, "subject", req.body.balls, req.body.description))
	.then(() => res.status(201).send("well done!"))
	.catch(err => ser.status(404).send(err));
});


module.exports = router;