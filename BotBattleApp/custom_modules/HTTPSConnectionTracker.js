/** 
 * Use to store, retrieve, and destroy open connections (sockets) bound to the server argument. 
 * @class ConnectionTracker
 * @constructor
 * @param {Object} server The instance of https to track.
 */
module.exports = function HTTPSConnectionTracker(server) {
  
  // https://auth0.com/blog/2014/01/15/auth-with-socket-io/
  // http://socket.io/docs/rooms-and-namespaces/
  // https://github.com/Automattic/socket.io/wiki/Authorizing
  var paths = require("./BotBattlePaths");
  var logger = require(paths.custom_modules.Logger).newInstance();
  // Private member to store the sockets
  var sockets = {}, nextSocketId = 0;
 
  server.on('connection', function(socket) {
    
    // Add a newly connected socket
    var socketId = nextSocketId++;
    sockets[socketId] = socket;
    //logger.log('socket', socketId, 'opened');

    // Remove the socket when it closes
    socket.on('close', function() {
      //logger.log('socket', socketId, 'closed');
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
      logger.log('socket', socketId, 'destroyed');
      sockets[socketId].destroy();
    }
  } 
}