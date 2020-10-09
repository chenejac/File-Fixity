var mongoose = require("mongoose");

var deleteFileSchema = new mongoose.Schema({
    host: String
});

module.exports = mongoose.model("deleteFileSchema", deleteFileSchema);