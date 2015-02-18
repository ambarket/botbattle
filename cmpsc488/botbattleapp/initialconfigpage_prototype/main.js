var express = require('express');
var session = require('express-session');
var https = require('https');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
var sessionStore = session({secret: 'sssh!', cookie: { maxAge: 600000}, resave: true, saveUninitialized: true });

app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({extended: true}));
app.use(sessionStore);

// Log every incomming request, then pass along for futher processing
app.use(function( req, res, next) {
    console.log('%s %s', req.method, req.url);
    next();
});

var options = {
   key: fs.readFileSync('server.key'),
   cert: fs.readFileSync('server.crt')
};

var server = https.createServer(options, app).listen(6058);

var io = require('socket.io').listen(server);

var initalconfiguration = require('/home/amb6470/git/cmpsc488/botbattleapp/initialconfigpage_prototype/initialConfiguration.js');


//runExtern(app, io);
