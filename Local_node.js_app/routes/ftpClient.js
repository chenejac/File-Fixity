const jsftp = require("jsftp");
 
const ftp = new jsftp({
  host: "127.0.0.1",
  port: 21, // defaults to 21
  user: "marko", // defaults to "anonymous"
  pass: "mijat" // defaults to "@anonymous"
});

ftp.put(buffer, "path/to/remote/file.txt", err => {
    if (!err) {
      console.log("File transferred successfully!");
    }
  });




// exports.createFtpClient = async (host, port, username, password): Promise => { 
//   const client: FtpWithAuth = new jsftp({ 
//     host, 
//     port, 
//   });
 
//   return new Promise((resolve, reject) => { 
//     client.on('connect', () => { 
//       client.auth(username, password, (err, res) => { 
//         if (err) { 
//           quit(client); 
//           reject(err); 
//         } else { 
//           resolve({ 
//             put: (sourcePath: string, pathToPut: string) => put(client, sourcePath, pathToPut), 
//             ls: (pathToLs: string) => ls(client, pathToLs), 
//             quit: () => quit(client), 
//           }); 
//         } 
//       }); 
//     }); 
//   }); 
// }); 
 

// interface FtpClient { 
//   put: (sourcePath: string, pathToPut: string) => Promise; 
//   ls: (pathToLs: string) => Promise<LsResponse[]>; 
//   quit: () => void; 
// } 
 
// interface FtpWithAuth extends Ftp { 
//   auth: (username: string, password: string, callback: (error, response) => void) => void; 
// } 
 
// interface LsResponse { 
//   name: string; 
// } 
