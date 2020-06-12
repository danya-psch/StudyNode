const express = require('express');
const Node = require("../models/node");
const Task = require("../models/task");
const Course = require("../models/course");
const path = require('path');
const Pointer = require('object-pointer');

const THREE = require('three');
// const Check = require("../models/checkU");
const ObjectId = require("mongodb").ObjectId;

const router = express.Router();


const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.get("/", (req, res) => {
	Node.getAll()
		.then((items) => {
			res.json(items);
		})
		.catch(err => res.status(500).send(err.toString()));
});

router.post("/new", (req, res) => {
	Task.insert(new Task('Task', 'subject', 0, '', '-'))
	.then(task => {
		return Node.insert(new Node(
			new THREE.Vector3(req.body.position.x, req.body.position.y, req.body.position.z),
			[],
			[],
			task._id
		));
	})
	.then(result => {
		res.status(201).send(result);
	})
	.catch(err => console.log(err));
});

router.post("/save", (req, res) => {
	// let nodes = req.body.nodes;
	// console.log(nodes);
	// for (let curnode of nodes) {
	// 	if (typeof curnode._id === 'number') {
	// 		let lastId = curnode._id;
	// 		Node.insert(new Node(
	// 			curnode.position,
	// 			[],
	// 			ObjectId("5c0bbfaf5fe0e81a6fef1770"),
	// 			[],
	// 			ObjectId("5c0bbfaf5fe0e81a6fef1770")
	// 		))
	// 		.then(node => {
	// 			for (let _curnode of nodes) {
	// 				if (_curnode._id === lastId) _curnode._id = node._id;
	// 				for (let i = 0; i < _curnode.childs.length; i++) {
	// 					if (_curnode.childs[i] === lastId) _curnode.childs[i] = node._id;
	// 				}
	// 				for (let i = 0; i < _curnode.parents.length; i++) {
	// 					if (_curnode.parents[i] === lastId) _curnode.parents[i] = node._id;
	// 				}
	// 			}
	// 			console.log(nodes);
	// 			console.log("///////////////////////////////////////////////////////////");
	// 		})
	// 		.catch(err => console.log(err));
	// 	}
	// }
	

	
	
		// for (let node of nodes) {
		// 	Node.update(node._id,new Node(
		// 		node.position,
		// 		node.parents,
		// 		ObjectId("5c0bbfaf5fe0e81a6fef1770"),
		// 		node.childs,
		// 		new Task(
		// 			node.task.name,
		// 			node.task.subject,
		// 			node.task.balls,
		// 			node.task.description
		// 		)
		// 	))
		// }
	
	
	res.status(200).send("!");
});

module.exports = router;


