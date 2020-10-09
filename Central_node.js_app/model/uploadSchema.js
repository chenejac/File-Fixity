var mongoose = require("mongoose");

var uploadSchema = new mongoose.Schema({
    userHost: String,
    filesUploaded: [{ fileName: String, hashValue: String }]
});

module.exports = mongoose.model("uploadSchema", uploadSchema);