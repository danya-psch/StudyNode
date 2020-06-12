const mongoose = require("mongoose");

const Node = require("./node");

const GraphSchema = new mongoose.Schema({
    nodes : [{type: mongoose.Schema.Types.ObjectId, ref : "Node"}],
    name : { type: String }
    
});

const GraphModel = mongoose.model('Graph', GraphSchema);


class Graph {
    constructor (nodes, name) {
        this.nodes = nodes;
        this.name = name;
    }

    static getById(id) {
        return GraphModel.findById(id).populate('tasks');
    }

    static insert(graph) {
        return new GraphModel(graph).save();
    }

    static update(id, graph) {
        return GraphModel.findByIdAndUpdate(id, graph, {new: true}).exec();
    }

    static addNode(id, nodeId) {
        GraphModel.findById(id)
        .then(graph => {
			if (typeof graph !== 'undefined') graph.nodes.push(nodeId);
		})
		.catch(err => console.log(err));
    }

    static delete(id) {
        return CourseModel.deleteOne({ _id: id }).exec();
    }
}

module.exports = Course;