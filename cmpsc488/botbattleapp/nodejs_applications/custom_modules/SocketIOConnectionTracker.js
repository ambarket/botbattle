/** 
 * Use to store, retrieve, and destroy open connections (sockets) bound to the server argument. 
 * @class ConnectionTracker
 * @constructor
 * @param {Object} server The instance of https to track.
 */

//TODO Make this code less ugly. Not so sure about the underscores, only used them because of lowercase 'l's and uppercase 'I's
// Also its way too crazy looking when you nest these really long names, makes things even harder to read.

module.exports = function SocketIOConnectionTracker(socketIO) {
  var self = this;
  var paths = require("./BotBattlePaths");
  var logger = require(paths.custom_modules.Logger).newInstance('console');
  // Private member to store the sockets
  var socketInfo = {sockets: {}, client_id_To_Real_id_Map: {}, Real_id_To_Client_id_Map: {}, numberOfOpenSockets: 0};
  socketIO
  socketIO.on('connection', function(socket) {
    
    // Add a newly connected socket
    var real_id = socket.id;
    socketInfo.sockets[real_id] = socket;
    socketInfo.numberOfOpenSockets++;
    logger.log('socket', real_id, 'connection', ' there are now ', socketInfo.numberOfOpenSockets, ' open');

    // Remove the socket when it closes
    socket.on('disconnect', function() {
      socketInfo.numberOfOpenSockets--;
      logger.log('socket', real_id, 'aka (', socketInfo.Real_id_To_Client_id_Map[real_id], ') disconnect',
          ' there are now ', socketInfo.numberOfOpenSockets, ' open');
      delete socketInfo.sockets[real_id];
      socketInfo.client_id_To_Real_id_Map[socketInfo.Real_id_To_Client_id_Map[real_id]] = undefined;
      socketInfo.Real_id_To_Client_id_Map[real_id] = undefined;
    })
    .on('myId', function(client_id) {
      
      // client_id already mapped to another socket
      if(socketInfo.client_id_To_Real_id_Map[client_id]) {
        logger.log(socketInfo.sockets[socketInfo.client_id_To_Real_id_Map[client_id]]);
        //logger.log(socketInfo.client_id_To_Real_id_Map[client_id]);
        logger.log("New socket.io connection claiming to be the same as an existing one. Refusing connection.", 
            socketInfo.client_id_To_Real_id_Map[client_id], 'aka (', client_id, ')');
        socketInfo.sockets[real_id].disconnect();
      }
      else {
        socketInfo.client_id_To_Real_id_Map[client_id] = real_id;
        socketInfo.Real_id_To_Client_id_Map[real_id] = client_id;
        logger.log('socket', real_id, 'is actually ', client_id); 
        //TODO Find a more consitent way to run unit tests
        //unitTest(client_id);
      }
    });
    
  });
  
  /**
   * Emits the message over this servers socket.io to a specified client
   * @param {String} id Socket.io id of the original socket given to the client
   * @param {String} event Event to fire.
   * @param {Object} data Object to be passed.
   * @method emitToId
   */
  this.emitToId = function(id, event, data) {
    if (socketInfo.client_id_To_Real_id_Map[id]) {
      socketInfo.sockets[socketInfo.client_id_To_Real_id_Map[id]].emit(event, data);
    }
    else {
      logger.log("Attempt to emit to id " + id + " however it is not mapped to any actual socket.io instance");
    }
  };
  
  /**
   * Register a callback to process the data on the event from a specified client
   * @param {String} id Socket.io id of the original socket given to the client
   * @param {String} event Event to be processed.
   * @param {Function} callback Callback with the prototype "function(data)" 
   * @method onFromId
   */
  this.onFromId = function(id, event, callback) {
    if (socketInfo.client_id_To_Real_id_Map[id]) {
      socketInfo.sockets[socketInfo.client_id_To_Real_id_Map[id]].on(event, callback);
    }
    else {
      logger.log("Attempt to register event callback for id " + id + " however it is not mapped to any actual socket.io instance");
    }
  };
  
  function unitTest(client_id) {
    self.onFromId(client_id, 'unitTestToServer', function() {
      logger.log("received unitTestToServer from", client_id);
      setTimeout(function () {
        self.emitToId(client_id, 'unitTestToClient', null);
        logger.log("sending subsequent unitTestToClient to", client_id);
      },Math.floor(3000 + Math.random() * 3000));
    });
    self.emitToId(client_id, 'unitTestToClient', null);
    logger.log("sending first unitTestToClient to", client_id);
  }
}