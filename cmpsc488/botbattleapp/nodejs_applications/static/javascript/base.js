
var flashQueue = new (function(){
  var self = this;
  var flashQueue = [];
  var imRunning = false;
  
  this.addNewMessage = function(message) {
    //flashQueue.push(message);
    flashQueue = [message];
    if (!imRunning) {
      imRunning = true;
      processNextMessage();
    }
  }
  
  this.stop = function() {
    imRunning = false;
  }
  
  var displayInterval = null;
  var timeDisplayed = 0;

  var processNextMessage = function() {
    var nextMessage = flashQueue.splice(0, 1)[0];
    if (!nextMessage) {
      imRunning = false;
      var displayInterval = null;
      var timeDisplayed = 0;
    }
    else {
      console.log("nextMessage", nextMessage);
      if (nextMessage.type === 'status') {
        $('.message').html("<p style='color:green'>" +  nextMessage.message + "</p>");
      }
      else if (nextMessage.type === 'warning') {
        $('.message').html("<p style='color:#E65C00'>" +  nextMessage.message + "</p>");
      }
      else if (nextMessage.type === 'error') {
        $('.message').html("<p style='color:red'>" +  nextMessage.message + "</p>");
      }
      else {
        $('.message').html("<p>" +  nextMessage.message + "</p>");
      }
      
      timeDisplayed = 0;
      displayInterval = setInterval(function() {
        if (flashQueue.length === 0 ) {
          if (timeDisplayed >= 3000) {
            $('.message').html("");
            clearInterval(displayInterval);
            displayInterval = null;
            processNextMessage();
          }
          else {
            timeDisplayed += 1000;
          }
          console.log(timeDisplayed);
        }
        else {
          $('.message').html("");
          clearInterval(displayInterval);
          displayInterval = null;
          processNextMessage();
        }
      }, 1000);
    }
  }
})();


function flashStatusOrErrorMessage(type, message) {
  flashQueue.addNewMessage({'type' : type, 'message' : message});
}

/*  TODO: FInish this
function logMessage(type, message) {
  if (type === 'expirationWarning') {
    flashStatusOrErrorMessage('warning', message);
  }
  else {
    $('eventLog').html("");
  }
}
*/

//----------------------------------Error Handling------------------------------------
function handleExpiredID() {
  console.log("The record associated with your id has expired. Please upload new bots to continue.");
  flashStatusOrErrorMessage('error', "The record associated with your id has expired. Please upload new bots to continue.");
  TEST_ARENA.transitionPageToState('pageLoaded');
}

function handleServerError(origin, response) {
  flashStatusOrErrorMessage('error', "A server error occurred while processing your request, if this problem persists see your administrator.");

  TEST_ARENA.transitionPageToState('pageLoaded');
  console.log("Server error in", origin, "Response:", response);
}

function handleClientError(origin, err) {
  flashStatusOrErrorMessage('error', "A client error occurred while processing your request, if this problem persists see your administrator.");

  TEST_ARENA.transitionPageToState('pageLoaded');
  console.log("Client error in", origin, "Error:", err);
}

function handleNonSuccessHttpStatus(origin, status, response) {
  flashStatusOrErrorMessage('error', "HTTP Error", status, "received while processing your request, if this problem persists see your administrator.");

  TEST_ARENA.transitionPageToState('pageLoaded');
  console.log("HTTP Error", status, "in", origin, "Response:", response);
}

function handleUnexpectedResponse(origin, response) {
  flashStatusOrErrorMessage('error', "Unexpected response received while processing your request, if this problem persists see your administrator.");

  TEST_ARENA.transitionPageToState('pageLoaded');
  console.log("Unexpected response in", origin, "Response:", response);
}


