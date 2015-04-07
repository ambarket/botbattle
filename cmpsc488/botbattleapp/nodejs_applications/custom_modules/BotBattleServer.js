/**
* Combine express, https, socket.io, and ConnectionTracker instances into one convenient structure.
* The returned object will contain an instance of https and socket.io both listening on the passed port.
* @class BotBattleServer
* @constructor 
*/

module.exports = function BotBattleServer() {
  var self = this;
  var paths = require('./BotBattlePaths');
  var logger = require(paths.custom_modules.Logger).newInstance('console');
  var expressApp = null;
  var httpsServer = null;
  var socketIO = null;  
  var httpsConnectionTracker = null;
  var socketIOConnectionTracker = null;
 
  /**
   * Initialize the expressApp, httpsServer, socketIO, and connectionTracker properties 
   * and begin listening for connections on https://localhost:port, where port is the TCP port 
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
    var options = { key : fs.readFileSync(paths.https_cert.key), cert : fs.readFileSync(paths.https_cert.cert) };
    httpsServer = https.createServer(options, expressApp).listen(port);
    
    socketIO = require('socket.io').listen(httpsServer);
    
    httpsConnectionTracker = new (require(paths.custom_modules.HTTPSConnectionTracker))(httpsServer);
    socketIOConnectionTracker = new (require(paths.custom_modules.SocketIOConnectionTracker))(socketIO);
    
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
   * @param{String} folderPath Can be relative to application directory or absolute e.g. 'static/css/' or /home/xyz123/static/css/
   * @method addStaticFolderRouteRelativeToAppDirectory
   */
  this.addStaticFolderRoute = function(urlPrefix, folderPath) {
      var path = require('path');
      // Note if its an absolute path (starts with '/') then resolve will ignore the paths.app_root part
	  expressApp.use(urlPrefix, require('express').static(path.resolve(paths.app_root, folderPath)));
  };
  
  /**
   * Requests to the specified url will result in sending the client the specified file
   * found at [main_application_directory]/relativeFilePath
   * @param{String} url e.g. /login  NOTE: No trailing slash
   * @param{String} filePath Can be relative to application directory or absolute e.g. 'static/html/testArena.html' or /home/xyz123/static/html/testArena.html
   */
  this.addStaticFileRoute = function(url, filePath) {
    var path = require('path');
    // Note if its an absolute path (starts with '/') then resolve will ignore the paths.app_root part
    self.addDynamicRoute('get', url, function(req, res) {
        res.sendFile(path.resolve(paths.app_root, filePath));
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
      logger.log('httpsServer', "Failed to add dynamic route to " + method + ":" + url);
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
   * @method socketIOEmitToAll
   */
  this.socketIOEmitToAll = function(event, data) {
    socketIOConnectionTracker.emitToAll(event, data);
  };
  
  /**
   * Register a callback to process the data on the event.
   * 
   * @param {String} event Event to be processed.
   * @param {Function} callback Callback with the prototype "function(data)" 
   * @method socketIOReceiveFromAll
   */
  this.socketIOReceiveFromAll = function(event, callback) {
    socketIOConnectionTracker.onReceiveFromAll(event, callback);
  };
  
  /**
   * Emits the message over this servers socket.io to a specified client
   * @param {String} id Socket.io id of the original socket given to the client
   * @param {String} event Event to fire.
   * @param {Object} data Object to be passed.
   * @method socketIOEmitToId
   */
  this.socketIOEmitToId = function(id, event, data) {
    socketIOConnectionTracker.emitToId(id, event, data);
  };
  
  /**
   * Register a callback to process the data on the event from a specified client
   * @param {String} id Socket.io id of the original socket given to the client
   * @param {String} event Event to be processed.
   * @param {Function} callback Callback with the prototype "function(data)" 
   * @method socketIOReceiveFromId
   */
  this.socketIOReceiveFromId = function(id, event, callback) {
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
    expressApp.set('views', paths.static_content.views);
    
    // Use the ejs templating engine
    //http://robdodson.me/how-to-use-ejs-in-express/
    expressApp.set('view engine', 'ejs');  
    
    var cookieParser = require('cookie-parser');
    self.addMiddleware(cookieParser());
    
    var bodyParser = require('body-parser');
    self.addMiddleware(bodyParser.json());
    self.addMiddleware(bodyParser.urlencoded({
      extended : true
    }));
    
    // TODO: How do we clear out cookies if they never expire
    // https://www.npmjs.com/package/connect-mongo
    // Warning The default server-side session storage, MemoryStore, is purposely not designed for 
    // a production environment. It will leak memory under most conditions, does not scale past a single 
    // process, and it meant for debugging and developing.
    // The session store instance, defaults to a new MemoryStore instance.
    var shortid = require('shortid');
    var session = require('express-session');
    var sessionStore = session({
      secret : 'CXj3n"2KgOj*-4tm*Z0uD2B4X+Q^m3',
      cookie : {
        expires : false
      },
      secure: true,
      resave : false,
      saveUninitialized : false,
      rolling : true,
      genid: function(req) {
        //console.log(shortid.generate())
        return shortid.generate(); // use UUIDs for session IDs
        //return genuuid()
      },
    });
    self.addMiddleware(sessionStore);
    
    var passport = require('passport');
    self.addMiddleware(passport.initialize());
    self.addMiddleware(passport.session());
    

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
      if (req.session && !req.session.locals) {
        req.session.locals = {};
      }
      logger.log('httpsServer', req.method, req.url);
      logger.log('session', JSON.stringify(req.session));
      next();
    });

    var express = require('express');
    self.addStaticFolderRoute('/static/css', paths.static_content.css);
    self.addStaticFolderRoute('/static/javascript', paths.static_content.javascript);
    self.addStaticFolderRoute('/static/images', paths.static_content.images);
    self.addStaticFolderRoute('/static/icons', paths.static_content.icons);
    
    var path = require('path');
    // Note if its an absolute path (starts with '/') then resolve will ignore the paths.app_root part
    
    self.addDynamicRoute('get', /^\/game\/(.*)\/resources/, function(req, res) {
      // To get the filePath just strip /game/ off and append to game_modules directory.
      var resolvedFilePath = path.join(paths.local_storage.game_modules, req.url.substring(6));
      res.sendFile(resolvedFilePath);
    });
    
    self.addDynamicRoute('get', /^\/game\/(.*)\/javascript/, function(req, res) {
      // To get the filePath just strip /game/ off and append to game_modules directory.
      var resolvedFilePath = path.join(paths.local_storage.game_modules, req.url.substring(6));
      res.sendFile(resolvedFilePath);
    });
  }
}

