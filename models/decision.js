const mongoose = require("mongoose");
const THREE = require('three');
const Task = require("./task");

const DecisionSchema = new mongoose.Schema({
    node : {type: mongoose.Schema.Types.ObjectId, ref : "Node"},
    file : {type: String},
    student : {type: mongoose.Schema.Types.ObjectId, ref : "User"},
    teacher : {type: mongoose.Schema.Types.ObjectId, ref : "User"},
    date : { type : Date },
    course : {type : mongoose.Schema.Types.ObjectId, ref : "Course"}
});

const DecisionModel = mongoose.model('Decision', DecisionSchema);

class Decision {
    constructor (node, file, student, teacher, course, date) {
        this.node = node;
        this.file = file;
        this.student = student;
        this.teacher = teacher;
        this.course = course;
        this.date = date;
    }

    static getById(id) {
        return DecisionModel.findById(id).populate({ path: 'student node', populate: { path: 'task' } });
    }

    static getAll() {
        return DecisionModel.find().populate({ path: 'student node', populate: { path: 'task' } });//.sort({ created: -1});
    }

    static getMy(id) {
        return DecisionModel.find({ teacher : id}).populate({ path: 'student node', populate: { path: 'task' } });
    }

    static insert(node) {
        return new DecisionModel(node).save();
    }

    static update(id, node) {
        return DecisionModel.findByIdAndUpdate(id, node, {new: true}).exec();
    }

    static delete(id) {
        return DecisionModel.deleteOne({ _id: id }).exec();
    }
}



module.exports = Decision;