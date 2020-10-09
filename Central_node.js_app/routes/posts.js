const express = require('express');
const router = express.Router();
var UserSchema = require('../model/userSchema');
var SharedSchema = require('../model/sharedSchema');
var sharingStatus = require('../model/sharingStatus');
var uploadSchema = require('../model/uploadSchema');
var downloadedSchema = require('../model/downloadedSchema');
const fs = require("fs");
const config = require('config');
const du = require('du');
const Path = require('path');

router.get('/Values/:id', (req, res) => {
    console.log(req.params);

    res.send({ message: 'Verifikovan' });      
});

router.post('/UploadFile', (req, res) => {
    console.log(req.params);
    console.log("POGODJEN API");
    res.send({ message: 'Uploaded' });      
});

router.get('/GetAllUsers', (req, res) =>{
    UserSchema.find({}, (err, users) => {
        if (err) {
            console.log(err);
        } else {
            //console.log(lines)
            var usersList = [];
            var o = {}
            var key = 'name';
            o[key] = [];
            users.forEach(function (entry) {
                //var strinForJson = '"' + entry.username + '"';
                var data = {
                    "name": entry.username
                 }
                 usersList.push(data);
                o[key].push(entry.username);
            });
            console.log("KORISNICI: " + JSON.stringify(o));
            console.log(req.ip)
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({usersList}));
        }
    });
  });

router.get('/GetAllUserFiles/:username', (req, res) => {
    console.log(req.socket.remoteAddress);

    const filePath = config.get('CentralServer.myPath');
    var dir = filePath + '/' + req.params.username;
    var allFiles = fs.readdirSync(dir, (err, files) =>{
        allFiles = files;
    });
    res.send(allFiles);
});


router.get('/RequestForFileSharing/:usernameWhoSendRequest/:usernameWhoResponseRequest', async (req, res) =>{
    console.log(req.params);
    console.log("sharing status" + sharingStatus.pending);

    var userShare = null;
    userShare = await SharedSchema.findOne({userHost: req.params.usernameWhoResponseRequest});

    if(userShare == null){
        var newShare = {
            userHost: req.params.usernameWhoResponseRequest,
            usersGuests: { usename: req.params.usernameWhoSendRequest, status: sharingStatus.pending }
        }

        await SharedSchema.create(newShare);
        res.send({message: 'Uspesno ste poslali zahtev za deljenje'})
    }else{
        await SharedSchema.findOneAndUpdate({userHost: req.params.usernameWhoResponseRequest}, { $push: { usersGuests: { usename: req.params.usernameWhoSendRequest, status: sharingStatus.pending}}})
            res.send({message: "Uspesno ste poslali zahtev za deljenje"});
    }
});

router.get('/CheckNotification/:username', async (req, res) =>{
    //proveriti da li za pristigli username ima zahteva sa pending stanjem
    console.log(req.params);
    var foundUser = null;
    foundUser = await SharedSchema.findOne({ userHost: req.params.username });
    if(user == null){
        res.send({message: 'Nemate zahteva za deljenje fajlova'});
    }else{
        //proveriti stause i poslati samo one sa pending
        foundUser = user;
        console.log(user);

        //TODO POSLATI SAMO NOTIFIKACIJE KOJE SU SA PENDING STATUSOM
        res.send(user);
    }

});

router.get('/RespondSharingRequest/:usernameWhoSendRequest/:decision/:userResponse', async (req, res) =>{
    var decisionForSharing = sharingStatus.accepted;
    if(req.params.decision == 0){
        decisionForSharing = sharingStatus.rejected;
    }
    console.log('++++++++++++////////////////////////++++++++++++');
    console.log(decisionForSharing);
    var findingUserRequest = null;
    findingUserRequest = await SharedSchema.findOne({userHost: req.params.usernameWhoSendRequest});

    var index = findingUserRequest.usersGuests.findIndex(x => x.usename == req.params.userResponse);
    findingUserRequest.usersGuests[index].status = decisionForSharing;
    await SharedSchema.findOneAndUpdate({userHost: req.params.usernameWhoSendRequest}, { $set: { usersGuests: findingUserRequest.usersGuests }});

    var queryStringForArray = "usersGuests." + index +".status";
    var userResponse = null;
    userResponse = await SharedSchema.findOne({userHost: req.params.userResponse});

    if(userResponse == null){
        var newShare = {
            userHost: req.params.userResponse,
            usersGuests: { usename: req.params.usernameWhoSendRequest, status: decisionForSharing }
        }

        await SharedSchema.create(newShare);
        var usernameResponesUser = req.params.usernameHost;
        res.send({message: 'Uspesno obradjen zahtev za deljenje fajlova'});
    } else {        

        await SharedSchema.findOneAndUpdate({userHost: req.params.userResponse}, { $push: { usersGuests: {usename: req.params.usernameWhoSendRequest, status: decisionForSharing}}});
        res.send({message: 'Uspesno obradjen zahtev za deljenje fajlova'});
    }
    
});

router.get('/CheckMemoryStatus', async (req, res) =>{
    var sizeInConfig = config.get('CentralServer.dirSizeGb');
    var dirPath = config.get('CentralServer.myPath');
    let sizeDir = await du(dirPath);
    var result = sizeInConfig * 1024 * 1024 * 1024 - sizeDir; //Result in bytes
    console.log('sizeInConfig: ' + sizeInConfig + ' SizeDir: ' + sizeDir + ' Resutl:' + result);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({result}));
});

router.post('/ReceiveFileInfo', async (req, res) =>{
    console.log(req.body);

    //req.body SACUVATI U SEMU ZA UPLOAD-OVANE FAJLOVE
    // {
    //     username: 'stefan',
    //     fileName: 'isa_vezbe_jovana.txt',
    //     hash: '1f944d47487889f832e46c1156b67bb0'
    // }

    var findingFileInfo = null; 
    await uploadSchema.findOne({userHost: req.body.username}, (err, fileFind) =>{
        if(err){
            console.log('////////////////////////');
            console.log(err + 'Greska prilikom cuvanja informacija fajla' + req.body);
            res.send({message: 'Greska prilikom cuvanja informacija fajla' + req.body});
        } else {
            console.log('////////////////////////');
            console.log("Pronadjene informacije fajla " + fileFind);
            findingFileInfo = fileFind;
        }
    });

    if(findingFileInfo == null){
        //Korisnik i njegovi fajlovi ne postoje na centralnom serveru
        var newFileInfo = {
            userHost: req.body.username,
            filesUploaded: { fileName: req.body.fileName, hashValue: req.body.hash }
        }

        await uploadSchema.create(newFileInfo, (err, addedFileInfo) =>{
            if(err){
                console.log('////////////////////////');
                console.log(err + " Greska pri kreiranju informacija o fajlu, u bazi");
                res.send({message: 'Greska pri cuvanju informacija o fajlu u bazi'});
            } else {
                console.log('////////////////////////');
                console.log("Informacije o fajlu su sacuvane " + addedFileInfo);
                res.send({message: 'Informacije o fajlu su sacuvane'});
            }
        });
    } else {
        //Korisnik i fajl vec postoje, samo se menja hash vrednost
        var index = findingFileInfo.filesUploaded.findIndex(x => x.fileName == req.body.fileName);
        console.log(index)
        if(index != -1){
            findingFileInfo.filesUploaded[index].hashValue = req.body.hash;
            await uploadSchema.findOneAndUpdate({userHost: req.body.username}, { $set: { filesUploaded: findingFileInfo.filesUploaded }},
                (err, fileInfoUpdated) =>{
                    if(err){
                        console.log('////////////////////////');
                        console.log(err + "Greska prilikom osvezavanja informacija o fajlu u bazi");
                        res.send({message: 'Greska prilikom osvezavanja informacija o fajlu u bazi'})
                    } else {
                        console.log('////////////////////////');
                        console.log(fileInfoUpdated + ": osvezene informacije fajla");
                        res.send({message: "Uspesno osvezene informacije o fajlu u bazi"});
                    }
                });
        } else {
            //Korisnik postoji ali nema tog fajla na centralnom serveru
            var fileInfoPush = {
                fileName: req.body.fileName,
                hashValue: req.body.hash
            }
            findingFileInfo.filesUploaded.push(fileInfoPush);
            await uploadSchema.findOneAndUpdate({userHost: req.body.username}, { $set: { filesUploaded: findingFileInfo.filesUploaded }},
                (err, fileInfoUpdated) =>{
                    if(err){
                        console.log('////////////////////////');
                        console.log(err + "Greska prilikom osvezavanja informacija o fajlu u bazi");
                        res.send({message: 'Greska prilikom osvezavanja informacija o fajlu u bazi'})
                    } else {
                        console.log('////////////////////////');
                        console.log(fileInfoUpdated + ": osvezene informacije fajla");
                        res.send({message: "Uspesno osvezene informacije o fajlu u bazi"});
                    }
                });
        }
    }
});

//Slanje informacija o fajlovima koje je trazeni korisnik postavio na server
router.get('/GetSharingUsersAndFilesInfo/:username', async (req, res) =>{
    let myShareInfo = null;
    myShareInfo = await SharedSchema.findOne({userHost: req.params.username});
    if(myShareInfo != null){
        var otherUserFiles = [];
        try{
            for(user of myShareInfo.usersGuests){
                if(user.status == sharingStatus.accepted){
                    let currentUserFiles = await uploadSchema.findOne({userHost: user.usename});
                    otherUserFiles.push(currentUserFiles);
                }
            }
            console.log(otherUserFiles);
            res.send(otherUserFiles);
        }catch(error){
            console.log(error);
        }
    }else{
        res.send({message: "Nemate korisnika sa kojima delite"});
    }
});

router.get('/DownloadedFile/:usernameWhoDownload/:usernameHost', async (req, res) =>{
    console.log('BRisanje ' + req.params);
    //U NOVOJ SEMI ZA PREUZETE FAJLOVE ZABELEZITI KORISNIKA KOJI JE PREUZEO U LISTI KOJU POSEDUJE KORISNIK CIJI SU FAJLOVI PREUZETI
    //UPOREDITI GORE POMENUTU LISTU SA LISTOM ISTOG KORISNIKA IZ SEME ZA DELJENJE
        //AKO SU SVI KORISNICI IZ SEME ZA DELJENJE U OVOJ LISTI OBRISATI SVE FAJLOVE KORISNIKA
    var hostUserSchema = null;
    hostUserSchema = await downloadedSchema.findOne({userHost: req.params.usernameHost});

    if(hostUserSchema == null){
        var sharingSchemaUser;
        sharingSchemaUser = await SharedSchema.findOne({userHost: req.params.usernameHost});
        console.log('SHARING SCHEMA: ' + sharingSchemaUser);
        if(sharingSchemaUser.usersGuests.length == 1){
            var userFilesForDelete;
            userFilesForDelete = await uploadSchema.findOne({userHost: req.params.usernameHost});
            for(fileForDelete of userFilesForDelete.filesUploaded){
                var filePath = config.get('CentralServer.myPath') + '/' + req.params.usernameHost + '/' + fileForDelete.fileName;
                console.log('Fajl za brisanje + ' + filePath);
                try{
                    if (fs.lstatSync(filePath).isDirectory()) {
                        deleteFolderRecursive(filePath);
                    }else{
                        fs.unlinkSync(filePath);
                    }
                }catch(err) {
                    console.log(err)
                }
            }
            await uploadSchema.deleteOne({userHost: req.params.usernameHost});
            res.send({message: "Uspesno belezenje u bazi"});
        }else{
            var newDownloaded = {
                userHost: req.params.usernameHost,
                downloads: { usename: req.params.usernameWhoDownload }
            }
            await downloadedSchema.create(newDownloaded);
            res.send({message: "Uspesno belezenje u bazi"});
        }
    }else{
        //KADA POSTOJI VISE KORISNIKA KOJI DELE
        hostUserSchema.downloads.push(req.params.usernameWhoDownload);
        //uporediti dve liste
        var sharingSchemaUser;
        sharingSchemaUser = await SharedSchema.findOne({userHost: req.params.usernameHost});
        var allUsersDownloaded = [];
        if(sharingSchemaUser != null){
            
            for(u of sharingSchemaUser.usersGuests){
                var index = hostUserSchema.downloads.findIndex(x => x.usename == u.usename);
                allUsersDownloaded.push(index);
            }
            
            let allUsersIsDownloaded = allUsersDownloaded.filter(ind => ind == -1);
            if(allUsersIsDownloaded == []){
                hostUserSchema.downloads = [];
                await downloadedSchema.findOneAndUpdate({userHost: req.params.usernameHost}, 
                {
                    $set: {
                        userHost: req.params.usernameHost, downloads: hostUserSchema.downloads
                    }
                });
                res.send({message: "Uspesno belezenje u bazi"});
            }else if(hostUserSchema.downloads.length != sharingSchemaUser.usersGuests.length){

                var dir = config.get('CentralServer.myPath') + '/' + req.params.usernameHost;
                fs.readdirSync(dir, async (err, files) =>{
                    for(fi of files){
                        var filePath = config.get('CentralServer.myPath') + '/' + req.params.usernameHost + '/' + fi;
                        try{
                            if (fs.lstatSync(filePath).isDirectory()) {
                                deleteFolderRecursive(filePath);
                            }else{
                                fs.unlinkSync(filePath);
                            }
                            await uploadSchema.deleteOne({userHost: req.params.usernameHost});
                            await downloadedSchema.deleteOne({userHost: req.params.usernameHost});
                        }catch(err) {
                            console.log(err)
                        }
                    }
                });
                res.send({message: "Uspesno belezenje u bazi"});
            }
        }
}
});

////ZAHTEV ZA VRACANJE FAJLA
router.post('/FileRepair/:username/:fileName', (req, res) =>{
    //sacuvati zahtev 

});


const deleteFolderRecursive = function(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file, index) => {
        const curPath = Path.join(path, file);
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };

module.exports = router;