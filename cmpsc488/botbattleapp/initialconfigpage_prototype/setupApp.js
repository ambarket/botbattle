function SetupApp(app) {
    var self = this;
    
    var initialconfiguration = require('./initialConfiguration.js');
    
    initialconfiguration.on('config_complete', function(database) {
	// Database will be a reference to the authenticated BotBattleDatabase object
        self.emit('setup_complete', database)
    });
    
    initialconfiguration.on('config_error', function(err) {
        self.emit('setup_error', err)
    });
    
    initialconfiguration.on('progress_update', function(progress) {
        self.emit('progress_update', progress)
    });
    
    app.get('/',function(req,res){
	    res.sendFile(__dirname + '/static/initialConfiguration.html');
	});

    app.post('/processInitialConfiguration', function(req, res) {
	console.log(JSON.stringify(req.body));
	var sanitizer=require('sanitizer');
	var sanitizedSubmission = {
		databaseHost: sanitizer.sanitize(req.body.databaseHost),
		databasePort: sanitizer.sanitize(req.body.databasePort),
		databaseName: sanitizer.sanitize(req.body.databaseName),
		databaseUserName: sanitizer.sanitize(req.body.databaseUserName),
		databasePassword: sanitizer.sanitize(req.body.databasePassword),	
	}
	console.log(JSON.stringify(sanitizedSubmission));
	
	initialconfiguration.run(sanitizedSubmission); 
    });
    
}
var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(SetupApp, EventEmitter);

module.exports = SetupApp;