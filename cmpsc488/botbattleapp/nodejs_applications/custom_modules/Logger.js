// Created this to use instead of logger.log. Idea is that this will be more complicated later and
//  will support logging to files and stuff
function Logger(destination) {
  if (destination !== 'console') {
    throw new Error("argument to Logger must be one of ['console']");
  }
  this.destination = destination;
  this.log = function() {
    var message = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
      message += " " + arguments[i];
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
