const http = require('http');
const express = require('express');
const bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require('cors');
const config = require('config');

const url = 'mongodb://localhost:27017/FileFixityCentralServer';
mongoose.connect(url);

const app = express();
var server = http.createServer(app);
const postsRoute = require('./routes/posts');
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use('/api', postsRoute);

app.listen(52295, () => console.log('Server started on port 52295'));

const ftpServer = require('./ftpServer');
const { connect } = require('http2');
const host = config.get('CentralServer.ftpServerUrl');
const port = 21;
user = "petar";
pass = "mijat";

ftpServer.startFtpServer(host, port, user, pass);

async function connectMongo(){
    await mongoose.connect(url);
}