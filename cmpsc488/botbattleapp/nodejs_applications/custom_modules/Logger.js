// Created this to use instead of console.log. Idea is that this will be more complicated later and
//  will support logging to files and stuff
function Logger(destination) {
  this.destination = destination;
  
  this.log = function(message) {
    if (destination === 'console') {
      console.log(message);
    }
  }
};
module.exports = Logger;
module.exports.newInstance = function(destination) {
  return new Logger(destination);
}
