const express = require('express');
const Task = require("../models/task");
const Course = require("../models/course");
const User = require("../models/user");
const Check = require("../models/checkU");
const passport = require('./auth').passport;
const step = 1;

const router = express.Router();

function checkLocal(req, res, next) {
    if (!req.user) { 
        const basicAuthMiddleware = passport.authenticate('basic', { session: false });
        return basicAuthMiddleware(req, res, next); 
    }
    next();
}

function takeItemsinPage(page, items) {
	const capacity = 2;
	let array = [];
	let finish = (page + capacity > items.length) ? items.length : page + capacity ;
	for (let i = page * capacity; i < finish; i++) {
		array.push(items[i]);
	}
	return array;
}

////////////////////////////////api/course////////////////////////////////////////////////////////////////////////////////////////////////
router.get("/courses",
	checkLocal,
	(req, res) => {
		Course.getAll()
			.then(items => {
				const page = req.query.page; 
				if (typeof page !== 'undefined') {
					res.json(takeItemsinPage(page, items));
				} else res.json(takeItemsinPage(0, items));
			})
			.catch(err => res.status(500).json(err.toString()));
	});

router.get("/courses/:id",
	checkLocal,
	(req, res) => {
		Course.getById(req.params.id)
			.then(course => {
				if (typeof course === 'undefined')  res.status(404).send("course not found"); 
				else res.json(course);
			})
			.catch(err => res.status(500).json(err.toString()));
	});

router.post("/courses",
	checkLocal,
	(req, res) => {
		Course.insert(
			new Course(
				req.body.name,
				req.body.subject,
				"https://bipbap.ru/wp-content/uploads/2017/04/leto_derevo_nebo_peyzazh_dom_derevya_domik_priroda_3000x2000.jpg",
				req.body.tasks
			)
		)
			.then(course => res.status(201).json(course))
			.catch(err => res.status(500).json(err.toString()));
	});

router.put("/courses/:id",
	checkLocal,
	(req, res) => {
		Course.update(req.params.id, 
			new Course(
				req.body.name,
				req.body.subject,
				"https://bipbap.ru/wp-content/uploads/2017/04/leto_derevo_nebo_peyzazh_dom_derevya_domik_priroda_3000x2000.jpg",
				req.body.tasks
			)
		)
			.then(course => res.status(201).json(course))
			.catch(err => res.status(500).json(err.toString()));
	});

router.delete("/courses/:id",
	checkLocal,
	(req, res) => {
		Course.delete(req.params.id)
		.then(() => res.json({ message: 'Successfully deleted' }))
		.catch(err => res.status(500).json(err.toString()));
	});
////////////////////////////////api/task////////////////////////////////////////////////////////////////////////////////////////////////
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

router.get('/tasks',
	checkLocal,
	(req, res) => {
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

// router.get("/tasks",
// 	passport.authenticate('basic', { session: false }),
// 	(req, res) => {
// 		Task.getAll()
// 			.then(task => {
// 				const page = req.query.page; 
// 				if (typeof page !== 'undefined') {
// 					res.json(takeItemsinPage(page, task));
// 				} else res.json(takeItemsinPage(0, task));
// 			})
// 			.catch(err => res.status(500).json(err.toString()));
// 	});

router.get("/tasks/:id",
	checkLocal,
	(req, res) => {
		Task.getById(req.params.id)
			.then(task => {
				if (typeof task === 'undefined')  res.status(404).json("task not found"); 
				else res.json(task);
			})
			.catch(err => res.status(500).json(err.toString()));
	});

router.post("/tasks",
	checkLocal,
	(req, res) => {
		Task.insert(
			new Task(
				req.body.name,
				req.body.subject,
				parseInt(req.body.balls),
				"https://bipbap.ru/wp-content/uploads/2017/04/leto_derevo_nebo_peyzazh_dom_derevya_domik_priroda_3000x2000.jpg",
				req.body.description
			)
		)
			.then(task => res.status(201).json(task))
			.catch(err => res.status(500).json(err.toString()));
	});

router.put("/tasks/:id",
	checkLocal,
	(req, res) => {
		Task.update(req.params.id, 
			new Task(
				req.body.name,
				req.body.subject,
				parseInt(req.body.balls),
				"https://bipbap.ru/wp-content/uploads/2017/04/leto_derevo_nebo_peyzazh_dom_derevya_domik_priroda_3000x2000.jpg",
				req.body.description
			)
		)
			.then(task => res.status(201).json(task))
			.catch(err => res.status(500).json(err.toString()));
	});

router.delete("/tasks/:id",
	checkLocal,
	(req, res) => {
		Task.delete(req.params.id)
		.then(() => res.json({ message: 'Successfully deleted' }))
		.catch(err => res.status(500).json(err.toString()));
	});
////////////////////////////////api/user////////////////////////////////////////////////////////////////////////////////////////////////
router.get("/users",
	checkLocal,
	Check.checkAdmin,
	(req, res) => {
		User.getAll()
			.then(user => {
				const page = req.query.page; 
				if (typeof page !== 'undefined') {
					// const capacity = 2;
					// let array = [];
					// let finish = (page + capacity > user.length) ? user.length : page + capacity ;
					// for (let i = page * capacity; i < finish; i++) {
					// 	array.push(user[i]);
					// }
					// res.json(array);
					res.json(takeItemsinPage(page, user));
				} else res.json(takeItemsinPage(0, user));
			})
			.catch(err => res.status(500).json(err.toString()));
	});

router.get("/users/:id",
	checkLocal,
	Check.checkAdmin,
	(req, res) => {
		User.getById(req.params.id)
			.then(user => {
				if (typeof user === 'undefined')  res.status(404).json("user not found"); 
				else res.json(user);
			})
			.catch(err => res.status(500).json(err.toString()));
	});

router.post("/users",
	checkLocal,
	Check.checkAdmin,
	(req, res) => {
		User.insert(
			new User(
				req.body.name,
				req.body.lastName,
				req.body.password,
				[],
				new Date(),
				"",
				"",
				req.avaUrl,
				new Date(),
				"",
				""
			)
		)
			.then(user => res.status(201).json(user))
			.catch(err => res.status(500).json(err.toString()));
	});

router.put("/users/:id",
	checkLocal,
	Check.checkAdmin,
	(req, res) => {
		User.update(req.params.id, 
			new User(
				req.body.name,
				req.body.lastName,
				req.body.password,
				[],
				new Date(),
				"",
				"",
				req.avaUrl,
				new Date(),
				"",
				""
			)
		)
			.then(user => res.status(201).json(user))
			.catch(err => res.status(500).json(err.toString()));
	});

router.delete("/users/:id", 
	checkLocal,
	Check.checkAdmin,
	(req, res) => {
		User.delete(req.params.id)
		.then(() => res.json({ message: 'Successfully deleted' }))
		.catch(err => res.status(500).json(err.toString()));
	});
////////////////////////////////api/me////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/me',
	checkLocal,
    (req, res) => {
        res.json(req.user);
	});
	
module.exports = router;