
// Listen for notifications of the status of the initial configuration.
localStorage.debug = 'engine.socket, socket.io';
//var socket = io.connect('https://localhost:6058');
socket = null;
var myId = null;

  //socket = io.connect('http://xxx.xxx.xxx.xxx:8081', {secure:false});     
  socket = io.connect();

  socket.on('connect', function() {
    console.log('socket connected!');
    console.log(socket);
    
    // JUst store the id this script first received then tell the server about it
    if (!myId) {
      myId = socket.id;
    }
    socket.emit('myId', myId);
  })
  .on('error', function(err) {
    console.log('socket error! ' + err.message);
    console.log(socket);
  })
  .on('reconnect', function() {
    console.log('socket reconnect!');
    console.log(socket);
    // Tell server on reconnect too
    /* connect seems to always be fired after reconnect anyway so no need for this and was causing issues with dup messages
     * if (myId) {
      socket.emit('myId', myId);
    }
    else {
      console.log("how did reconnect event happen before connect???")
    }*/
  })
  .on('reconnecting', function(number) {
    console.log('socket reconnecting! attempt# ' + number);
    console.log(socket);
  })
  .on('reconnect_error', function(err) {
    console.log('socket reconnect error! ' + err.message);
    console.log(socket);
  })
  .on('disconnect', function() {
    console.log('socket disconnect!');
    console.log(socket);
  })
  .on('folderCreatedResult', function(result) {
    document.getElementById('folderCreated').innerHTML = result;
    $('#submitFolder').show();
  })
  .on('fileCreatedResult', function(result) {
    document.getElementById('fileCreated').innerHTML = result;
    $('#submitFile').show();
  })
  .on('unitTestToClient', function() {
    console.log("received unit test from server");
    // keep it going
    socket.emit('unitTestToServer', null);
  })

  
// create folder on server
$(document).ready(function(){
  $('#submitFolder').click(function(e){
      var Req = new XMLHttpRequest();
      Req.open("GET", "folderTest?path=" + document.getElementById("folderCreate").value, true);
      Req.send();
      $('#submitFolder').hide();
      document.getElementById('folderCreated').innerHTML = "Waiting on call back";
  });
});

//create file on server
$(document).ready(function(){
  $('#submitFile').click(function(e){
      var Req = new XMLHttpRequest();
      Req.open("GET", "fileTest?path=" + document.getElementById("fileCreate").value, true);
      Req.send();
      $('#submitFile').hide();
      document.getElementById('fileCreated').innerHTML = "Waiting on call back";
  });
});
