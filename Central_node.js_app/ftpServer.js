const ftpServer = require('ftp-srv');
const FileSystem = require('ftp-srv');
const config = require('config');
const fs = require("fs");
var UserSchema = require('./model/userSchema');

exports.startFtpServer = async (host, port, user, pass) => {  
  
  const server = new ftpServer(
  {
    url: host,
    
  }); 

  server.on('login', async ({ connection, username, password }, resolve, reject) => { 
    var newUser = {
      username: username,
      password: password
    }

    if (username === newUser.username && password === newUser.password) { 
      
      // If connected, add a handler to confirm file uploads 
      connection.on('STOR', (error, fileName) => { 
        if (error) { 
          console.error(`FTP server error: could not receive file ${fileName} for upload ${error}`); 
        } 
        console.info(`FTP server: upload successfully received - ${fileName}`); 
      }); 
      //fileSystem = new ftpServer.FileSystem(connection, "C:/Users/marko/nodeJs/resolve", "/files");
      
      //resolve({fs: fileSystem}); 
      const filePath = config.get('CentralServer.myPath');
      let fullPath = filePath + '/' + username;
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath);
      }
      console.log("Korisnik na FTP: " + username);
      await checkUserInDB(username, password);
      resolve({root: filePath, cwd: username}); 
    } else { 
      reject(new Error('Unable to authenticate with FTP server: bad username or password')); 
    } 
  }); 
  
  server.on('client-error', ({ context, error }) => { 
    console.error(`FTP server error: error interfacing with client ${context} ${error} on ftp://${host}:${port} ${JSON.stringify(error)}`); 
  }); 
  
  const closeFtpServer = async () => { 
    await server.close(); 
  }; 
  
  // The types are incorrect here - listen returns a promise 
  await server.listen(); 
  
  return { 
    shutdownFunc: async () => { 
      // server.close() returns a promise - another incorrect type 
      await closeFtpServer(); 
    }, 
  }; 
};

async function checkUserInDB(username, password){
  let userExistInBase = null;
  userExistInBase = await UserSchema.findOne({ username: username });

  if(userExistInBase == null){
    var newUser = {
      username: username,
      password: password
    }
    await UserSchema.create(newUser);
  }
};
