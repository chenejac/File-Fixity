var dudir = require('du');
var fs = require('fs');
var FileSchema = require("../model/fileSchema");
const hasha = require('hasha');
var crypto = require('crypto');
const util = require('util');
const { async } = require('hasha');
const ftp = require("basic-ftp");
const config = require('config');
const du = require('du');
const got = require('got');
const { hashElement } = require('folder-hash');

exports.dirSize = function(dir){
  var sizeInMb = 0;

  dudir(dir, function(err, size){
    console.log('The size of files is:', size, 'bytes');
    sizeInMb = size / 1012;
  });

  return sizeInMb;
}

exports.isFileExist = async function(dir, files){
  //uputiti zahtev za proveru stanja na serveru, i dodavati velicine fajlova dok se ne popuni prostor, ostale preskakati

  let url = 'http://' + config.get('LocalServer.CentralServer.address') + ':52295' + '/api/CheckMemoryStatus';
  let totalSizeForSend = 0;
  let centralServerFreeSpace;
 
    try {
      for(let file of files) {
        const response = await got(url);
        //console.log('++++++Odgovor servera: ' + response.body);
        centralServerFreeSpace = JSON.parse(response.body);
        
        let sizeOfCurrentFile = await du(dir + '\\' + file)
        console.log('++++Velicina fajla' + await du(dir + '\\' + file) + '+++++ mesto na serveru: ' + centralServerFreeSpace.result);
          
          if(sizeOfCurrentFile > centralServerFreeSpace.result){
            console.log('Nema dovoljno mesta na serveru za fajl: ' + file);
          } else {
            await processingFile(file, dir);
        }
      }
    }catch(error){
      console.log(error);
    }
}

async function processingFile(file, dir){
  let fileExistInBase;
  fileExistInBase = await FileSchema.findOne({ fileName: file });
  await CheckForUpload(fileExistInBase, dir, file);
}

async function CheckForUpload(fileExistInBase, dir, file){
  if(fileExistInBase == null){
    console.log('VRATIO JE NULL IZ BAZE');
    var filePath = dir + '\\' + file;
    let sizeDir = await du(dir);
    let sizeFile = await du(filePath);
    let defineDirSize = config.get('LocalServer.user.dirSizeGb');
    let sizeInGb = (sizeFile + sizeDir) / 1000000000;
    console.log(sizeInGb);
    if(sizeInGb < defineDirSize){
      ///const fileHash = await hasha.fromFile(filePath, {algorithm: 'md5'});
      const options = {
          algo: 'sha1'
      }
      const fileHash = await hashElement(filePath, options);
      console.log(file + "hash Value: " + fileHash.hash);
      await sendFileFtp(filePath ,file, fileHash.hash, false);
    }
  //FAJL POSTOJI VEC, DA LI JE DOSLO DO PROMENE ILI NE (UPOREDITI STARU I NOVU HASH VREDNOST)
  }else{
    console.log('NIJE VRATIO JE NULL IZ BAZE, ALI JE POREDJENJE LOSE');
    var filePath = dir + '\\' + file;
    //const fileHash = await hasha.fromFile(filePath, {algorithm: 'md5'});
    const options = {
      algo: 'sha1'
    }
    const fileHash = await hashElement(filePath, options);
    if(fileExistInBase.hashValue != fileHash.hash){
      console.log('Ispis hash' + fileExistInBase.hashValue);
      console.log('Ispis hash' + fileHash.hash);
      await sendFileFtp(filePath ,file, fileHash.hash, true);
    }
  }
}
 
async function sendFileFtp(filePath, fileName, fileHash, update) {
    const client = new ftp.Client()
    client.ftp.verbose = false
    try {
        await client.access({
            host:  config.get('LocalServer.CentralServer.addressFTP'),
            user: config.get('LocalServer.user.username'),
            password: config.get('LocalServer.user.password'),
            secure: false
        })
        let isDirectory = fs.lstatSync(filePath).isDirectory();
        if(isDirectory){
          await client.uploadFromDir(filePath, fileName);
        }else{
          await client.uploadFrom(filePath, fileName);//'C:/Users/marko/files/add_paper_ANGULAR_code.txt', "add_paper_ANGULAR_code.txt")
        }
        //await client.downloadTo("README_COPY.md", "README_FTP.md")
        if(!update){

          var newFile = {
            fileName: fileName,
            filePath: filePath,
            username: config.get('LocalServer.user.username'),
            hashValue: fileHash
          }
          FileSchema.create(newFile, (err, newlyCreatedFile) => {
            if (err) {
                console.log(err);
            } else {
                console.log(newlyCreatedFile);
                //POSLATI I CENTRALNOM SERVERU USERNAME, FILENAME I HASH
                let url = 'http://' + config.get('LocalServer.CentralServer.address') + ':52295' + '/api/ReceiveFileInfo';
                //const response = await got.post(url);
                (async () => {
                  const {body} = await got.post(url, {
                      json: {
                          username: config.get('LocalServer.user.username'),
                          fileName: fileName,
                          hash: fileHash
                      },
                      responseType: 'json'
                  });
               
                  console.log(body.data);
                  //=> {hello: 'world'}
              })();
            }
          });
      }else{
        FileSchema.findOneAndUpdate({fileName: fileName}, 
          {
            $set: {                
                hashValue: fileHash
            }
        },
        (err, file) => {
            if (err) {
                console.log('Error update hash on file: ' + err);
            } else {
                console.log('File is updated: ' + file);
                //POSLATI I CENTRALNOM SERVERU USERNAME, FILENAME I HASH
                let url = 'http://' + config.get('LocalServer.CentralServer.address') + ':52295' + '/api/ReceiveFileInfo';
                //const response = await got.post(url);
                (async () => {
                  const {body} = await got.post(url, {
                      json: {
                          username: config.get('LocalServer.user.username'),
                          fileName: fileName,
                          hash: fileHash
                      }
                  });
               
                  //console.log(body.data);
                  //=> {hello: 'world'}
              })();
            }
        });
      }
    }
    catch(err) {
        console.log(err)
    }
    client.close()
}

exports.allFiles = function(dir){
  var allFiles = fs.readdirSync(dir, (err, files) =>{
    allFiles = files;
  });
  return allFiles;
}