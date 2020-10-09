const http = require('http');
const express = require('express');
var mongoose = require("mongoose");
const app = express();
var fs = require('fs');
var server = http.createServer(app);
const postsRoute = require('./routes/posts');
const config = require('config');
var cors = require('cors');
const bodyParser = require("body-parser");
var schedule = require('node-schedule');
var monitoring = require('./monitorin_files/monitoring');
const { async } = require('hasha');
const downloadFiles = require('./backup/downloadFiles');
const DeleteFileSchema = require('./model/deleteFilesSchema');
const got = require('got');

const url = 'mongodb://localhost:27017/FileFixity';
mongoose.connect(url);

var p = config.get("LocalServer.user.downloadPath");

// var rule = new schedule.RecurrenceRule();
// rule.second = 12;

//SCHEDULE
var j = schedule.scheduleJob('5 * * * * *', async function(){ //*/5 * * * *
    var dir = config.get('LocalServer.user.myPath');//'C:\\Users\\marko\\files';
    var allFiles = monitoring.allFiles(dir);
    await monitoring.isFileExist(dir, allFiles);
    
    console.log('Funkcija koja ce proveravati prosledjeni folder i raditi bekap ako je potrebno, provera i da li ima novih fajlova na serveru');
    
});

var backup = schedule.scheduleJob('*/1 * * * *', async function(){
    console.log('Provera fajlova drugih korisnika za preuzimanje sa servera');
    var result = await downloadFiles.DownloadFiles();
    var findForDelete = [];
    findForDelete = await DeleteFileSchema.find({});
    if(findForDelete.length != 0){
        for(element of findForDelete){//findForDelete.forEach(element => {
            let url = 'http://' + config.get('LocalServer.CentralServer.address') + ':52295' + '/api/DownloadedFile/' + config.get('LocalServer.user.username') + '/' + element.host;
            try {
                const response = await got(url);
            } catch (error) {
                console.log(error);
            }
        }
        await DeleteFileSchema.deleteMany({});
    }
});


app.use(bodyParser.json());
app.use(cors());
app.use('/api', postsRoute);

app.listen(52296, () => console.log('Server started on port 52296'));
