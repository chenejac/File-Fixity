var mongoose = require("mongoose");

var downloadedSchema = new mongoose.Schema({
    userHost: String,
    downloads: [{ usename: String }]
});

module.exports = mongoose.model("downloadedSchema", downloadedSchema);