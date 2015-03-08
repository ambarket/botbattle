
//TODO setting this here so that you can't submit until socketIO is working
//var submitButton = document.getElementById("submitButton").disabled = false;
    
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
    
    //TODO setting this here so that you can't submit until socketIO is working
    //var submitButton = document.getElementById("submitButton").disabled = false;
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
    //TODO setting this here so that you can't submit until socketIO is working
    //var submitButton = document.getElementById("submitButton").disabled = true;
  })
  .on('progress_update', function(progress) {
	  document.getElementById("progress").value = progress;
  })
  .on('status_update', function(status) {
	  var html = [];
	  html.push(document.getElementById('message').innerHTML);
	  html.push('<div>' + status + '</div>');
	  var messageElem =  document.getElementById('message');
	  messageElem.innerHTML = html.join('');
	  messageElem.scrollTop = messageElem.scrollHeight;
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
    var html = [];
    html.push(document.getElementById('message').innerHTML);
    html.push("<div class='error'>" + err + '</div>');
    var messageElem =  document.getElementById('message');
    messageElem.innerHTML = html.join('');
    messageElem.scrollTop = messageElem.scrollHeight;
    //document.getElementById('message').innerHTML = "There was an error during configuration...<br>" + err;
    
    //TODO setting this here so that you can't submit while server is still working on things.
    //var submitButton = document.getElementById("submitButton").disabled = false;
  })
  .on('unitTestToClient', function() {
    console.log("received unit test from server");
    // keep it going
    socket.emit('unitTestToServer', null);
  })

// Submit the form via an ajax request.   ////////////// password is being sent plaintext !!!!!!!!!!!
var form = document.getElementById("initConfigForm");
  var stillProcessing = false;
form.addEventListener('submit', function(ev) {
  if (!stillProcessing) {
    stillProcessing = true;
    var req = new XMLHttpRequest();
    var theForm = new FormData(form);
    req.open("POST", "processInitialConfiguration", true);
    req.send(theForm);
    
    req.onload = function(event) {
      stillProcessing = false;
      if (req.status === 200) {
        console.log("onload");
      } else {
        console.log("error onload");
      }
    };
    ev.preventDefault();
  }

}, false);

var submitButton = document.getElementById("submitButton");

submitButton.addEventListener('click', function(){
	document.getElementById("progress").value = 0;
	document.getElementById("message").innerHTML = '&nbsp';
});

