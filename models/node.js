const mongoose = require("mongoose");
const THREE = require('three');
const Task = require("./task");

const State = {
    Admin: 'Admin',
    Utilizer: 'Utilizer',
};

const NodeSchema = new mongoose.Schema({
    position : { type : Object },
    parents : [{ type: mongoose.Schema.Types.ObjectId, ref : "Parents" }],
    childs : [{ type: mongoose.Schema.Types.ObjectId, ref : "Childs" }],
    // course : {type: mongoose.Schema.Types.ObjectId, ref : "Course"},
    task : { type: mongoose.Schema.Types.ObjectId, ref : "Task" }
    // prev : {type: mongoose.Schema.Types.ObjectId, ref : "Node"},
    // next : [{type: mongoose.Schema.Types.ObjectId, ref : "Nodes"}],
    // task : { type: mongoose.Schema.Types.ObjectId, ref : "Task"}
});

const NodeModel = mongoose.model('Node', NodeSchema);

NodeSchema.pre('remove', function() {
    console.log('Removing!');
});

class Node {
    constructor (position, parents, childs, task) {
        this.position = position;
        this.parents = parents;
        // this.course = course;
        this.childs = childs;
        this.task = task;
    }

    static getById(id) {
        return NodeModel.findById(id).populate('task');
    }

    static getAll() {
        return NodeModel.find().populate('task');//.sort({ created: -1});
    }

    static insert(node) {
        return new NodeModel(node).save();
    }

    static update(id, node) {
        return NodeModel.findByIdAndUpdate(id, node, {new: true}).exec();
    }

    static delete(id) {
        return NodeModel.findById(id)
        .then(node => {
            console.log(node.task);
            return Task.delete(node.task);
        })
        .then(() => {
            return NodeModel.deleteOne({ _id: id }).exec();
        })
    }
}



module.exports = Node;