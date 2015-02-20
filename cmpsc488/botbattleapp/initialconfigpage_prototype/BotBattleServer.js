/**
* Combine express, https, socket.io, and ConnectionTracker instances into one convenient structure.
* The returned object will contain an instance of https and socket.io both listening on the passed port.
* @class BotBattleServer
* @constructor 
*/
module.exports = function BotBattleServer() {
  var self = this;
  
  /**
   * An instance of express() used to route requests to this server.
   * 
   * @property expressApp
   * @type {Object}
   */
  this.expressApp = null;

  /**
   * An instance of the https module used to listen and serve requests.
   * 
   * @property httpsServer
   * @type {Object}
   */
  this.httpsServer = null;
  
  /**
   * An instance of socket.io module used for bidirectional communication with web clients.
   * 
   * @property socketIO
   * @type {Object}
   */
  this.socketIO = null;
  
  /**
   * An instance of ConnectionTracker module used to retain references to all connected clients
   *    in case they are needed at a later time.
   * 
   * @property connectionTracker
   * @type {Object}
   */
  this.connectionTracker = null;
  
  /**
   * Initialize the expressApp, httpsServer, socketIO, and connectionTracker properties 
   * and begin listening for connections on localhost:port, where port is the TCP port 
   * number passed to the constructor.
   * 
   * @method initAndStartListening
   * @param {Number} port The TCP port the webserver will listen on.
   * @return The initialized and started BotBattleServer object
   */
  this.initAndStartListening = function(port) {
    self.expressApp = require('express')();
    registerCommonMiddleware();
    registerCommonRoutes();
    
    var https = require('https');
    var fs = require('fs');
    var options = { key : fs.readFileSync('server.key'), cert : fs.readFileSync('server.crt') };
    self.httpsServer = https.createServer(options, self.expressApp).listen(port);
    
    self.socketIO = require('socket.io').listen(self.httpsServer);
    
    self.connectionTracker = new (require('./ConnectionTracker'))(self.httpsServer);
    
    return self;
  }
  
  /**
   * Destroys all open connections to the server and closes the httpsServer property.
   * 
   * @param {Function} callback A callback accepting a single argument used to pass any error that may have occurred
   *    while attempting to close the server.
   * @method shutdown
   */
  this.shutdown = function(callback) {
    // Destroy all open connections to server, but wait a little to allow any last minute 
    //  messages to get through to the client. 
    // This is necessary in order to ensure the httpsServer.close event will actually fire.
    setTimeout(function() { self.connectionTracker.closeAllConnections(); }, 2000);
    
    self.httpsServer.close(function(err) {
      self.socketIO = null;
      self.server = null;
      self.expressApp = null;
      callback(err);
    });
  }
  
  
  /**
   * Create and register instances of the following middleware to this object's expressApp property
   *    express-session - enable cookies and sessions
   *    body-parser - provides json and urlencoded http bodies
   *    multer - used to process multipart file uploads
   * 
   * @method registerCommonMiddleware
   * @private
   */
  function registerCommonMiddleware () {
    var session = require('express-session');
    var sessionStore = session({
      secret : 'sssh!',
      cookie : {
        maxAge : 600000
      },
      resave : true,
      saveUninitialized : true
    });
    self.expressApp.use(sessionStore);

    // Add body-parser
    var bodyParser = require('body-parser');
    self.expressApp.use(bodyParser.json());
    self.expressApp.use(bodyParser.urlencoded({
      extended : true
    }));
    
    // Add multer
    var multer = require('multer');
    self.expressApp.use(multer({
      dest : './uploads/',
      rename : function(fieldname, filename) {
        return filename;
      },
    }));
  }
  
  /**
   * Create and register routes that will be used by all instances of BotBattleServer to
   * the private expressApp property. 

   * @method registerCommonRoutes
   * @private
   */
  function registerCommonRoutes() {
    // Log every incoming request, then pass along for further processing
    self.expressApp.use(function(req, res, next) {
      console.log('%s %s', req.method, req.url);
      next();
    });

    var express = require('express');
    // Serve static css files
    self.expressApp.use('/static/css', express.static(__dirname + '/static/css/'));
    
    // Serve static javascript files
    self.expressApp.use('/static/javascript', express.static(__dirname + '/static/javascript/'));
  }
}

