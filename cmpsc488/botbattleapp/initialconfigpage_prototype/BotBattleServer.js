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
   * @private
   */
  var expressApp = null;

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
    expressApp = require('express')();
    registerCommonMiddleware();
    registerCommonRoutes();
    
    var https = require('https');
    var fs = require('fs');
    var options = { key : fs.readFileSync('server.key'), cert : fs.readFileSync('server.crt') };
    self.httpsServer = https.createServer(options, expressApp).listen(port);
    
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
      expressApp = null;
      callback(err);
    });
  }
  
  /**
   * Requests to the specified url will be routed to the static file 
   * or directory specified in relativePath
   * 
   * @param {String} url 
   * @param {String} relativePath 
   * @method addStaticRoute
   */
  this.addStaticRoute = function(url, relativePath) {
	  expressApp.use(url, require('express').static(__dirname + relativePath));
  }
  
  /**
   * Requests to the specified url and method will be processed by 
   * the specified callback or directory specified in relativePath.
   * 
   * @param {String} method Either 'get' or 'post' 
   * @param {String} url 
   * @param {Function} callback Callback with signature function(req, res)
   * @method addStaticRoute
   */
  this.addDynamicRoute = function(method, url, callback) {
    method = method.toLowerCase(method);
    if (method == 'get' || method == 'post') {
      expressApp[method](url, callback);
    }
    else {
      console.log("Failed to add dynamic route to " + method + ":" + url);
    }
  }
  
  /**
   * Adds the specified middleware to the express stack.
   * 
   * @param {Function} middleware function suitable for use as express middleware.
   * @method addStaticRoute
   */
  this.addMiddleware = function(middleware) {
    expressApp.use(middleware);
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
    self.addStaticRoute('/static/css', '/static/css/');
    
    // Serve static javascript files
    self.addStaticRoute('/static/javascript', '/static/javascript/');
  }
}

