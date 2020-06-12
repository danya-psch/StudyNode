
const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    name : { type: String },
    subject : { type: String },
    balls : { type: Number},
    description : { type: String}
});

const TaskModel = mongoose.model('Task', TaskSchema);


class Task {
    constructor (name, subject, balls, description) {
        this.name = name;
        this.subject = subject;
        this.balls = balls;
        this.description = description;
    }
    
    static getById(id) {
        return TaskModel.findById(id);
    }

    static getAll() {
        return TaskModel.find();
    }

    static insert(task) {
        return new TaskModel(task).save();
    }

    static update(id, task) {
        return TaskModel.findByIdAndUpdate(id, task, {new: true}).exec();
    }

    static delete(id) {
        return TaskModel.deleteOne({ _id: id }).exec();
    }
}

module.exports = Task;