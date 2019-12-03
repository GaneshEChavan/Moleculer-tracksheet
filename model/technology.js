const mongoose = require("mongoose");

let Schema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    techno: {
        type: String,
        required: true
    },
    stage: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stages"
    }]
},
    {
        timestamps: true
    }
);

let Stage = new mongoose.Schema({
    stage: {
        type: String
    },
    userID: {
        type: String,
        required: true
    },
    week: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Weeks"
    }]
},
    {
        timestamps: true
    }
);

let Week = new mongoose.Schema({
    week: {
        type: String
    },
    userID: {
        type: String,
        required: true
    },
    task: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tasks"
    }]
},
    {
        timestamps: true
    }
);

let Task = new mongoose.Schema({
    task: {
        type: String
    },
    userID: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
);
let Technology = mongoose.model("Technology", Schema, "Technology");
let stage = mongoose.model("Stages",Stage,"Stages");
let week = mongoose.model("Weeks",Week,"Weeks");
let task = mongoose.model("Tasks",Task,"Tasks");

module.exports.tech = Technology
module.exports.stage = stage
module.exports.week = week
module.exports.task = task