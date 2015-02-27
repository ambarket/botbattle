/**
* Combine express, https, socket.io, and ConnectionTracker instances into one convenient structure.
* The returned object will contain an instance of https and socket.io both listening on the passed port.
* @class BotBattleServer
* @constructor 
*/
module.exports = function BotBattleServer() {
  var self = this;
  var expressApp = null;
  var httpsServer = null;
  var socketIO = null;  
  var httpsConnectionTracker = null;
  var socketIOConnectionTracker = null;
  
  
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
    expressApp = require('express')();
    registerCommonMiddleware();
    registerCommonRoutes();
    
    var https = require('https');
    var fs = require('fs');
    var options = { key : fs.readFileSync('https_certificate/server.key'), cert : fs.readFileSync('https_certificate/server.crt') };
    httpsServer = https.createServer(options, expressApp).listen(port);
    
    socketIO = require('socket.io').listen(httpsServer);
    
    httpsConnectionTracker = new (require('./HTTPSConnectionTracker'))(httpsServer);
    socketIOConnectionTracker = new (require('./SocketIOConnectionTracker'))(socketIO);
    
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
    setTimeout(function() {httpsConnectionTracker.closeAllConnections(); }, 2000);
    
    httpsServer.close(function(err) {
      socketIO = null;
      self.server = null;
      expressApp = null;
      callback(err);
    });
  }
  
  /**
   * All requests prefixed with the urlPrefix will be routed to the static files
   * found in [main_application_directory]/relativeFolderPath
   * 
   * @param{String} urlPrefix e.g. /login  NOTE: No trailing slash
   * @param{String} relativeFolderPath e.g. '/static/css/' NOTE: Trailing slash necessary
   * @method addStaticRoute
   */
  this.addStaticFolderRoute = function(urlPrefix, relativeFolderPath) {
      var rootDir = __dirname.substring(0, __dirname.indexOf('/custom_modules'));
      //console.log(rootDir + relativeFolderPath);
	  expressApp.use(urlPrefix, require('express').static(rootDir  + relativeFolderPath));
  };
  
  /**
   * Requests to the specified url will result in sending the client the specified file
   * found at [main_application_directory]/relativeFilePath
   * @param{String} url e.g. /login  NOTE: No trailing slash
   * @param{String} relativeFilePath e.g. '/static/html/testArena.html'
   */
  this.addStaticFileRoute = function(url, relativeFilePath) {
    var rootDir = __dirname.substring(0, __dirname.indexOf('/custom_modules'));
    //console.log(rootDir + relativeFilePath);
    self.addDynamicRoute('get', url, function(req, res) {
        res.sendFile(rootDir + relativeFilePath);
      });
  }
  
  /**
   * Requests to the specified url and method will be processed by 
   * the specified callback or directory specified in relativePath.
   * 
   * @param {String} method Either 'get' or 'post' 
   * @param {String} url 
   * @param {Function} callback Callback with signature function(req, res)
   * @method addDynamicRoute
   */
  this.addDynamicRoute = function(method, url, callback) {
    method = method.toLowerCase(method);
    if (method === 'get' || method === 'post') {
      expressApp[method](url, callback);
    }
    else {
      console.log("Failed to add dynamic route to " + method + ":" + url);
    }
  };
  

  
  /**
   * Adds the specified middleware to the express stack.
   * 
   * @param {Function} middleware function suitable for use as express middleware.
   * @method addMiddleware
   */
  this.addMiddleware = function(middleware) {
    expressApp.use(middleware);
  };
  
  /**
   * Emits the message over this servers socket.io
   * 
   * @param {String} event Event to fire.
   * @param {Object} data Object to be passed.
   * @method emitOverSocketIO
   */
  this.emitOverSocketIO = function(event, data) {
    socketIO.emit(event, data);
  };
  
  /**
   * Register a callback to process the data on the event.
   * 
   * @param {String} event Event to be processed.
   * @param {Function} callback Callback with the prototype "function(data)" 
   * @method onReceiveSocketIO
   */
  this.onReceiveSocketIO = function(event, callback) {
    socketIO.on(event, callback);
  };
  
  /**
   * Emits the message over this servers socket.io to a specified client
   * @param {String} id Socket.io id of the original socket given to the client
   * @param {String} event Event to fire.
   * @param {Object} data Object to be passed.
   * @method emitOverSocketIO
   */
  this.emitOverSocketIOToId = function(id, event, data) {
    socketIOConnectionTracker.emitToId(id, event, data);
  };
  
  /**
   * Register a callback to process the data on the event from a specified client
   * @param {String} id Socket.io id of the original socket given to the client
   * @param {String} event Event to be processed.
   * @param {Function} callback Callback with the prototype "function(data)" 
   * @method onReceiveSocketIO
   */
  this.onReceiveSocketIOFromId = function(id, event, callback) {
    socketIOConnectionTracker.onFromId(id, event, callback);
  };
  
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
    expressApp.use(sessionStore);

    // Add body-parser
    var bodyParser = require('body-parser');
    self.addMiddleware(bodyParser.json());
    self.addMiddleware(bodyParser.urlencoded({
      extended : true
    }));
    
    // Add multer
    var multer = require('multer');
    self.addMiddleware(multer({
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
    self.addMiddleware(function(req, res, next) {
      console.log('%s %s', req.method, req.url);
      next();
    });

    var express = require('express');
    // Serve static css files
    self.addStaticFolderRoute('/static/css', '/static/css/');
    
    // Serve static javascript files
    self.addStaticFolderRoute('/static/javascript', '/static/javascript/');
  }
}

