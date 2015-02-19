
var initConfigServer = new BotBattleServer(6058);

var setupApp = new (require('./setupApp'))(initConfigServer.expressApp);

setupApp.on('setup_error', function(err) {
  console.log("There was an error during setup");
  console.log(err.message);
  initConfigServer.socketIO.emit('setup_error', err.message);
});

setupApp.on('progress_update', function(progress) {
  initConfigServer.socketIO.emit('progress_update', progress)
});

setupApp.on('setup_complete', function(database) {
  console.log("Setup completed successfully! heres the BotBattleDatabase");
  console.log(database);
  initConfigServer.socketIO.emit('setup_complete', null);

  // Close the server, then load a new one to serve the botBattleApp
  initConfigServer.close(function(err) {
    console.log('Server closed!');
    botBattleAppServer = new BotBattleServer(6058);
    var botBattleApp = require('./botBattleApp');
    
    botBattleApp(botBattleAppServer.expressApp, botBattleAppServer.socketIO, database);
  });
});

// Combine express instance, https server instance, and socket.io instance into
//  one convienient class.
function BotBattleServer(port) {
  var self = this;
  var express = require('express');
  var https = require('https');
  var fs = require('fs');
  
  var options = {
    key : fs.readFileSync('server.key'),
    cert : fs.readFileSync('server.crt')
  };

  
  this.expressApp = express();
  registerCommonMiddleware(self.expressApp);

  this.httpsServer = https.createServer(options, self.expressApp).listen(port);
  this.socketIO = require('socket.io').listen(self.httpsServer);
  
  //Keep track of connections to the server
  this.connectionTracker = new ConnectionTracker(self.httpsServer);
  
  this.close = function(callback) {
    // Destroy all open connections to server, but wait a little to
    // allow the io.emit('closing') above to get through to the client. This is necessary in
    // order to ensure the server.close() event will actually fire.
    setTimeout(function() { self.connectionTracker.closeAllConnections(); }, 2000);
    
    self.httpsServer.close(function(err) {
      self.socketIO = null;
      self.server = null;
      self.expressApp = null;
      callback(err);
    });
  }
}

function registerCommonMiddleware(app) {
  var express = require('express');
  var session = require('express-session');
  var sessionStore = session({
    secret : 'sssh!',
    cookie : {
      maxAge : 600000
    },
    resave : true,
    saveUninitialized : true
  });
  app.use(sessionStore);

  var bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended : true
  }));

  // Log every incomming request, then pass along for futher processing
  app.use(function(req, res, next) {
    console.log('%s %s', req.method, req.url);
    next();
  });

  app.use('/static/css', express.static(__dirname + '/static/css/'));

  /*
   * /*Configure the multer.
   */
  var multer = require('multer');
  app.use(multer({
    dest : './uploads/',
    rename : function(fieldname, filename) {
      return filename;
    },
  }));
}

/* A constructor for an object that will track all connections to the 
 * server argument. One can later get this array of connections or close
 * them all using the provided methods.
 */
function ConnectionTracker(server) {
  //Sockets is an array that has been registered to keep track of all connections
  //to the passed server. This is used later to close all of these connections
  //after successful initial configuration and before starting the botBattleApp server.
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
  
  this.getConnections = function() {
    return sockets;
  }
  
  this.closeAllConnections = function() {
    for ( var socketId in sockets) {
      console.log('socket', socketId, 'destroyed');
      sockets[socketId].destroy();
    }
  } 
}

