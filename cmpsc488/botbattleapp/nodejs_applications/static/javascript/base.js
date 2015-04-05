
var flashQueue = new (function(){
  var self = this;
  var flashQueue = [];
  var imRunning = false;
  
  this.addNewMessage = function(message) {
    flashQueue.push(message);

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
      clearInterval(displayInterval);
      displayInterval = null;
    } 
    else {
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
      
      if (flashQueue.length !== 0) {
        $('.message').slideDown(function() {
          setTimeout(function() {
            processNextMessage();
          }, 500);
        });
      }
      else {
        if (!displayInterval) {
          timeDisplayed = 0;
          displayInterval = setInterval(function() {
            if (flashQueue.length === 0 ) {
              if (timeDisplayed >= 3000) {
                $('.message').slideUp(function() {
                  clearInterval(displayInterval);
                  displayInterval = null;
                  processNextMessage();
                });
              }
              else {
                timeDisplayed += 500;
              }
              console.log(timeDisplayed);
            }
            else {
              clearInterval(displayInterval);
              displayInterval = null;
              processNextMessage();
            }
          }, 1000);
        }
      }
    }
  }
})();


function flashStatusOrErrorMessage(type, message) {
  flashQueue.addNewMessage({'type' : type, 'message' : message});
}


