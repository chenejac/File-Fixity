var mongoose = require("mongoose");

var fileSchema = new mongoose.Schema({
    fileName: String,
    filePath: String,
    username: String,
    hashValue: String
});

module.exports = mongoose.model("fileSchema", fileSchema);