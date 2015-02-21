/** 
 * Use to store, retrieve, and destroy open connections (sockets) bound to the server argument. 
 * @class ConnectionTracker
 * @constructor
 * @param {Object} server The instance of https to track.
 */
module.exports = function ConnectionTracker(server) {
  
  //TODO Use a better data structure than an array to avoid explosion 
  //        of unused space resulting from former sockets closing
  
  // Private member to store the sockets
  var sockets = {}, nextSocketId = 0;
  server.on('connection', function(socket) {
    
    // Add a newly connected socket
    var socketId = nextSocketId++;
    sockets[socketId] = socket;
    console.log('socket', socketId, 'opened');

    // Remove the socket when it closes
    socket.on('close', function() {
      console.log('socket', socketId, 'closed');
      delete sockets[socketId];
    });
  });
  
  /**
  * @method getConnections
  * @return {Array} An array containing all of the socket objects currently connected to the server
  */
  this.getConnections = function() {
    return sockets;
  }
  
  /**
   * Immediately destroy all open sockets to this server.
   * @method closeAllConnections
   * @return {void}
   */
  this.closeAllConnections = function() {
    for ( var socketId in sockets) {
      console.log('socket', socketId, 'destroyed');
      sockets[socketId].destroy();
    }
  } 
}