var mongoose = require("mongoose");

var downloadedFileSchema = new mongoose.Schema({
    fileName: String,
    filePath: String,
    username: String,
    hashValue: String
});

module.exports = mongoose.model("downloadedFileSchema", downloadedFileSchema);