const config = require('config');
const got = require('got');
const ftp = require("basic-ftp");
const fs = require("fs");
const DownloadedFileSchema = require('../model/downloadedFileSchema');
const DeleteFileSchema = require('../model/deleteFilesSchema');

exports.DownloadFiles = async function(){
    //uputiti zahtev za dobavaljnje username, korisnika ciji se fajlovi skladiste, fileName i njegov hash
    //ako fajl ne postoji u bazi pruzeti ga
    //ako postoji proveriti hash, ako se razlikuje preuzeti ga
    let url = 'http://' + config.get('LocalServer.CentralServer.address') + ':52295' + '/api/GetSharingUsersAndFilesInfo/' + config.get('LocalServer.user.username');

        try {
            const response = await got(url);
            console.log(response.body);
            //dobijena je lista sa "userHost":"stefan","filesUploaded":["fileName":"app.component.ts","hashValue":"35ec3302d1c66982db5d80cb8fed4cee"]
            var responeUsersAndFilesInfo = JSON.parse(response.body);
            if(responeUsersAndFilesInfo === undefined || responeUsersAndFilesInfo.length == 0){//{"message":"Nemate korisnika sa kojima delite"}

            }else{            
                for(user of responeUsersAndFilesInfo){
                    for(file of user.filesUploaded){
                        let isFileExist = null;
                        isFileExist = await DownloadedFileSchema.find({fileName: file.fileName});
                        if(isFileExist == null || isFileExist.length == 0){
                            //preuzeti i sacuvati
                            await downloafFileFtp(user.userHost, file.fileName, file.hashValue, false);
                        } else {
                            //uporediti hash
                            if(isFileExist[0].hashValue != file.hashValue){
                                await downloafFileFtp(user.userHost, file.fileName, file.hashValue, true);
                            }
                        }
                    }
                }
                let findForDelete = [];
                findForDelete = await DeleteFileSchema.find({});
                console.log(findForDelete);
                    var u = {
                        host: user.userHost
                    }
                    DeleteFileSchema.create(u);
            }
        }catch(error){
            console.log(error);
        }
}

async function downloafFileFtp(user, fileName, hash, update) {
    const client = new ftp.Client()
    client.ftp.verbose = false
    try {
        await client.access({
            host:  config.get('LocalServer.CentralServer.addressFTP'),
            user: user,
            password: config.get('LocalServer.user.password'),
            secure: false
        });
        let pathWithUserHost = config.get('LocalServer.user.downloadPath') + '\\' + user;
        if (!fs.existsSync(pathWithUserHost)) {
            fs.mkdirSync(pathWithUserHost);
          }
        var path = pathWithUserHost + '\\' + fileName;
        
        let isDirectory = fileName.indexOf('.');
        if(isDirectory == -1){
            await client.downloadToDir(path, fileName);
        }else{
            await client.downloadTo(path, fileName);
        }
        //UPUTITI ZAHTEV OD KOG SU KORISNIKA PREUZETI FAJLOVI, tamo sacuvati to i proveriti jesu li svi preuzeli i obrisati fajlove ako jesu
        if(update){
            await DownloadedFileSchema.findOneAndUpdate({fileName: fileName}, {
                $set: {
                    fileName: fileName, filePath: path, username: user, hashValue: hash
                }
            });
        } else {
            var newFile = {
                fileName: fileName,
                filePath: path,
                username: user,
                hashValue: hash
            }
            await DownloadedFileSchema.create(newFile);
        }
        
        client.close()
    }
    catch(err) {
        console.log(err)
    }
}