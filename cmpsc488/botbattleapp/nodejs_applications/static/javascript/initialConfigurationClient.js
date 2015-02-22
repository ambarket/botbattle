// Listen for notifications of the status of the initial configuration.
var socketIO = io.connect();
console.log(socketIO);
//Separated io.connect() from socket.on('connect', ...) and others as suggested by
//https://github.com/Automattic/socket.io/issues/430#issuecomment-7261120 
//I have a feeling this isn't the whole problem but worth a shot.
// Added just about all client side callbacks defined here
//http://socket.io/docs/client-api/
// After examining the id's in each of the socketIO's they are all the same all the way through
//  connect, reconnecting, reconnect, and connect are you sure its not fixed?
socketIO.on('connect', function() {
  console.log('socketIO connected!');
  console.log(socketIO);
})

socketIO.on('error', function(err) {
  console.log('socketIO error! ' + err.message);
  console.log(socketIO);
})
socketIO.on('reconnect', function() {
  console.log('socketIO reconnect!');
  console.log(socketIO);
})
socketIO.on('reconnecting', function(number) {
  console.log('socketIO reconnecting! attempt# ' + number);
  console.log(socketIO);
})
socketIO.on('reconnect_error', function(err) {
  console.log('socketIO reconnect error! ' + err.message);
  console.log(socketIO);
})


socketIO.on('disconnect', function() {
  console.log('socketIO disconnect!');
  console.log(socketIO);
})

socketIO.on('progress_update', function(progress) {
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
  .on('folderCreatedResult', function(result) {
    document.getElementById('folderCreated').innerHTML = result;
    $('#submitFolder').show();
  })
  .on('fileCreatedResult', function(result) {
    document.getElementById('fileCreated').innerHTML = result;
    $('#submitFile').show();
  });

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
