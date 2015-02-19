var express = require('express');
var session = require('express-session');
var https = require('https');
var http = require('http');
var bodyParser = require('body-parser');
var fs = require('fs');
var multer = require('multer');

var sessionStore = session({secret: 'sssh!', cookie: { maxAge: 600000}, resave: true, saveUninitialized: true });

var options = {
   key: fs.readFileSync('server.key'),
   cert: fs.readFileSync('server.crt')
};

var expressApp = express();

registerCommonMiddleware(expressApp);

var server = https.createServer(options, expressApp).listen(6058);
var socketIO = require('socket.io').listen(server);

//Maintain a hash of all connected sockets so they can be killed off
// after initial configuration has been completed and system needs to
// shift to serving the botBattleApp
var sockets = {}, nextSocketId = 0;
server.on('connection', function (socket) {
  // Add a newly connected socket
  var socketId = nextSocketId++;
  sockets[socketId] = socket;
  console.log('socket', socketId, 'opened');

  // Remove the socket when it closes
  socket.on('close', function () {
    console.log('socket', socketId, 'closed');
    delete sockets[socketId];
  });
});

var setupApp = new (require('./setupApp'))(expressApp, socketIO);

setupApp.on('setup_complete', function(err, data) {
    socketIO.emit('closing', null);
    
    /* Commenting this while working on the initconfig page*/
    // Close the server
    server.close(function () { 
	socketIO = null;
	server = null;
	expressApp = null;
	
	console.log('Server closed!'); 
	var expressApp = express();
	var server = https.createServer(options, expressApp).listen(6058);
	var socketIO = require('socket.io').listen(server);
	var botBattleApp = require('./botBattleApp');
	botBattleApp(expressApp, socketIO);
    });
    
    // Destroy all open sockets, but wait a little to allow the io.emit('closing') above to get through
    // This is necessary in order to ensure the server.close() event will actually fire.
    setTimeout(function() {
	    for (var socketId in sockets) {
	      console.log('socket', socketId, 'destroyed');
	      sockets[socketId].destroy();
	    }
    }, 2000); 
  
});


function registerCommonMiddleware(app)
{
    expressApp.use(bodyParser.json() );
    expressApp.use(bodyParser.urlencoded({extended: true}));

    // Log every incomming request, then pass along for futher processing
    expressApp.use(function( req, res, next) {
        console.log('%s %s', req.method, req.url);
        next();
    });

    expressApp.use('/static/css', express.static(__dirname + '/static/css/'));

    /*
    /*Configure the multer.*/
    expressApp.use(multer({ dest: './uploads/',
        rename: function (fieldname, filename) {
            //return filename+Date.now();
            return filename;
        },
        onFileUploadStart: function (file) {
            //db[id].sock.emit('status',  { 'output' : "Upload of " + file.originalname + " is starting ..." });
        },
        onFileUploadComplete: function (file) {
            //db[id].sock.emit('status', { 'output' : file.fieldname + ' successfully uploaded to  ' + file.path});
            done=true;
        }
    }));
}

