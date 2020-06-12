const mongoose = require("mongoose");

const User = require("./user");
const Node = require("./node");
const Decision = require("./decision");


const CourseSchema = new mongoose.Schema({
    name : { type: String },
    avaUrl : { type: String },
    root : { type: mongoose.Schema.Types.ObjectId, ref : "Node"},
    graph : [{ type: mongoose.Schema.Types.ObjectId, ref : "Node"}],
    creator : { type: mongoose.Schema.Types.ObjectId, ref : "User"},
    description : { type: String}
    
});

const CourseModel = mongoose.model('Course', CourseSchema);

class Course {
    constructor (name, avaUrl, root, graph, creator, description) {
        this.name = name;
        this.root = root;
        this.avaUrl = avaUrl;
        this.graph = graph;
        this.creator = creator;
        this.description = description;
    }

    static getById(id) {
        return CourseModel.findById(id).populate({ path: 'graph root', populate: { path: 'task' } }).exec();
    }

    static getAll() {
        return CourseModel.find().populate('graph root');//.sort({ created: -1});
    }

    static getMy(id) {
        return CourseModel.find({ creator : id}).populate({ path: 'graph root', populate: { path: 'task' } }).exec();
    }

    static insert(course) {
        return new CourseModel(course).save();
    }

    static update(id, course) {
        return CourseModel.findByIdAndUpdate(id, course, {new: true}).exec();
    }

    static delete(id) {
        return Promise.all([
            CourseModel.findById(id),
            User.getAll(),
            Decision.getAll()
        ])
        .then(([course, users, decisions]) => {
            Node.delete(course.root);
            for (let node of course.graph) {
                Node.delete(node);
            }
            for (let decision of decisions) {
                if (String(decision.course) === String(course._id)) Decision.delete(decision._id);
            }
            for (let user of users) {
                let courseForDelete = user.courses.find(curCourse => {
                    if (String(curCourse.courseId) === String(course._id)) return curCourse;
                });
                if (typeof courseForDelete !== 'undefined') {
                    user.courses.splice(user.courses.indexOf(courseForDelete), 1);
                    User.updateWithoutHashing(user._id, new User(
                        user.name,
                        user.lastName,
                        user.password,
                        user.courses,
                        user.role,
                        user.date,
                        user.telegram,
                        user.telegram_chat_id,
                        user.avaUrl,
                        user.dateOfBirth,
                        user.facebookName,
                        user.facebookId
                    ));
                }
            }
            return CourseModel.deleteOne({ _id: id }).exec();
        })
    }
}



module.exports = Course;