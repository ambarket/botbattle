console.log("her");
var express = require('express');
var session = require('express-session');
//var https = require('https');
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({extended: true}));

var sessionStore = session({secret: 'sssh!', cookie: { maxAge: 600000}, resave: true, saveUninitialized: true });
app.use(sessionStore);

app.use(function( req, res, next) {
    console.log('%s %s', req.method, req.url);
    next();
});

//var myApp = require('./FunTime');
//myApp(app, express);

//var options = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
//};

//https.createServer(options, app).listen(6058);
//app.listen(6058);
var server = http.createServer(app).listen(6058);

var io = require('socket.io').listen(server);

var runExtern = require('./runExtern');
runExtern(app, io);
