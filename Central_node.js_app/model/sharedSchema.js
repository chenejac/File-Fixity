var mongoose = require("mongoose");

var sharedSchema = new mongoose.Schema({
    userHost: String,
    usersGuests: [{ usename: String, status: String }]
});

module.exports = mongoose.model("sharedSchema", sharedSchema);