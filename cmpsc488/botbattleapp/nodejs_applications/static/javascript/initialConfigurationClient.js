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
