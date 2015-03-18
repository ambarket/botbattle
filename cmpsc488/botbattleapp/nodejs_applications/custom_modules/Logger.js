// Created this to use instead of logger.log. Idea is that this will be more complicated later and
//  will support logging to files and stuff

// A mapping of categories (can be sent as first argument to logger.log method)
//  to an array of destinations. Will be extended in the future to support files as well.
//  current supports 'console' or 'ignore'.
//  If the first argument to logger.log is not one of these categories, 'general will be applied.
var categoryDestinations = {
    general : ['console'],
    database : ['console'],
    session : ['console'],
    fileManager : ['console'],
    initialConfig : ['console'],
}
  
function Logger(destination) {
  if (destination !== 'console') {
    throw new Error("argument to Logger must be one of ['console']");
  }
  this.destination = destination;
  

  /**
   * First argument can be the category of the message. If not, the 'general' category will be applied.
   */
  this.log = function() {
    
    var message = "";
    var category = arguments[0];
    if (categoryDestinations[category]) {
      message += " " + category + ":";
    }
    else {
      message += " " + "general" + ": " + arguments[0];
    }
    
    for (var i = 1; i < arguments.length; i++) {

      if (arguments[i].toString() === '[object Object]') {
        message += " " + JSON.stringify(arguments[i]);
      }
      else {
        message += " " + arguments[i];
      }
    }
    
    if (destination === 'console') {
      console.log(message);
    }
  }
};
module.exports = Logger;
module.exports.newInstance = function(destination) {
  return new Logger(destination);
}
