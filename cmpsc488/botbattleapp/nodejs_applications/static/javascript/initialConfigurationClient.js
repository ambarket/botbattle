// Listen for notifications of the status of the initial configuration.
var socketIO = io.connect()
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
