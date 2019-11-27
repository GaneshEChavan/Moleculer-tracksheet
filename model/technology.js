const mongoose = require("mongoose");

let Schema = new mongoose.Schema({
    userID:{
        type:String,
        required:true
    },
    techno:{
        type:String,
        required:true
    }
})

let Technology = mongoose.model("Technology",Schema,"Technology")

module.exports = Technology