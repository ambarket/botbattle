/** 
 * Use to store, retrieve, and destroy open connections (sockets) bound to the server argument. 
 * @class ConnectionTracker
 * @constructor
 * @param {Object} server The instance of https to track.
 */

module.exports = function SocketIOConnectionTracker(socketIO) {
  
  // Private member to store the sockets
  var sockets = {};
  socketIO
  socketIO.on('connection', function(socket) {
    
    // Add a newly connected socket
    var socketId = socket.id;
    sockets[socketId] = socket;
    console.log('socket', socketId, 'connection');

    // Remove the socket when it closes
    socket.on('disconnect', function() {
      console.log('socket', socketId, 'disconnect');
      delete sockets[socketId];
    })
    .on('myId', function(clientId) {
      sockets[socketId].botBattleClientId = clientId;
      console.log('socket', socketId, 'is actually ', clientId);

      
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