
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
  
  var processNextMessage = function() {
    var nextMessage = flashQueue.splice(0, 1)[0];

    if (!nextMessage) {
      imRunning = false;
    } 
    else {
      if (nextMessage.type === 'status') {
        $('.message').html("<p style='color:green'>" +  nextMessage.message + "</p>");
      }
      else if (nextMessage.type === 'error') {
        $('.message').html("<p style='color:red'>" +  nextMessage.message + "</p>");
      }
      else {
        $('.message').html("<p>" +  nextMessage.message + "</p>");
      }
      
      $('.message').slideDown(function() {
        setTimeout(function() {
            $('.message').slideUp(function() {
              processNextMessage();
            });
        }, 1500);
      });
    }
  }
})();


function flashStatusOrErrorMessage(type, message) {
  flashQueue.addNewMessage({'type' : type, 'message' : message});
}


