
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
  .on('progress_update', function(progress) {
    $('#progress').val(progress);
  })
  .on('config_success', function(data) {
    var count = 5;
    document.getElementById('message').innerHTML = "Configuration Successful!<br>The page will reload in "
      + count + " seconds and take you to the Public Portal";
    setInterval(function() {
        count--;
        document.getElementById('message').innerHTML = "Configuration Successful!<br>The page will reload in "
            + count + " seconds and take you to the Public Portal";
        if (count === 0) {
          location.reload();
        }
      }, 1000);
  })
  .on('config_error', function(err) {
    document.getElementById('message').innerHTML = "There was an error during configuration...<br>" + err;
  })
  .on('unitTestToClient', function() {
    console.log("received unit test from server");
    // keep it going
    socket.emit('unitTestToServer', null);
  })

// Submit the form via an ajax request.
var form = document.getElementById("initConfigForm");
form.addEventListener('submit', function(ev) {
  var req = new XMLHttpRequest();
  var theForm = new FormData(form);
  req.open("POST", "processInitialConfiguration", true);
  req.send(theForm);

  req.onload = function(event) {
    if (req.status === 200) {
      console.log("onload");
    } else {
      console.log("error onload");
    }
  };
  ev.preventDefault();
}, false);

