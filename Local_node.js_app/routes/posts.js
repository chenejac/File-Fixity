var http = require('http');
const express = require('express');
const router = express.Router();
var monitoring = require('../monitorin_files/monitoring');
const config = require('config');
const got = require('got');

var options = {
    host: 'http://localhost:52295',
    path: '/api/Values/6'
};

callback = function(response) {
  console.log(response);
    
}

var postOptions = {
  method: 'POST',
  body: {
    "name": "Marko",
    "surname": "Mijat"
  }
}

router.get('/Values/:id', (req, res) => {
    console.log(req.params);

    res.send({ message: 'Verifikovan' });
            
});

router.get('/GetMyFiles', (req, res) =>{
  var dir = config.get('LocalServer.user.myPath');
  var allFiles = monitoring.allFiles(dir);
  res.send(allFiles);
});

router.get('/GetAllUsers', (req, res) =>{
  let users = [];
  let usersLlist = []
  let url = 'http://' + config.get('LocalServer.CentralServer.address') + ':52295' + '/api/GetAllUsers';

  (async () => {
      try {
          const response = await got(url);
          users = response.body;
          var o = JSON.parse(users);
          console.log(o);
          var currentUser = config.get('LocalServer.user.username');

          listUsers = o.usersList.filter(x => x.name != currentUser);
          console.log(listUsers);

          res.send(listUsers);
          
      } catch (error) {
          console.log(error);
      }
  })();

});


router.get('/RequestForFileSharing/:username', (req, res) =>{
  let url = 'http://' + config.get('LocalServer.CentralServer.address') + ':52295' + '/api/RequestForFileSharing/' + config.get('LocalServer.user.username') + '/' + req.params.username;
  let response;

  response = (async () => {
      try {
        const response = await got(url);
        console.log(response.body);
        res.send(response.body);
      }catch(error){
        console.log(error.response.body);
      }
  })();

});

router.get('/CheckNotification', (req, res) =>{
  let url = 'http://' + config.get('LocalServer.CentralServer.address') + ':52295' + '/api/CheckNotification/' + config.get('LocalServer.user.username');
  let response;

  response = (async () => {
      try {
        const response = await got(url);
        console.log(response.body);
        res.send(response.body);
      }catch(error){
        console.log(error.response.body);
      }
  })();
});

router.get('/RespondSharingRequest/:decision/:userResponse', (req, res) =>{
  //console.log(req.params.decision + "  " + req.params.userResponse);

  let url = 'http://' + config.get('LocalServer.CentralServer.address') + ':52295' + '/api/RespondSharingRequest/' + config.get('LocalServer.user.username') + '/' + req.params.decision + '/' +  req.params.userResponse;
  let response;

  response = (async () => {
      try {
        const response = await got(url);
        console.log(response.body);
        res.send(response.body);
      }catch(error){
        console.log(error.response.body);
      }
  })();
});


module.exports = router;