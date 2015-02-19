function SetupApp(app, io) {
    var self = this;
    
    var initialconfiguration = require('./initialConfiguration.js');
    
    initialconfiguration.on('config_complete', function(err, data) {
        self.emit('setup_complete', data)
    });
    
    initialconfiguration.on('task_done', function(err, data) {
        io.emit('task_done', data)
    });
    
    app.get('/',function(req,res){
	    res.sendFile(__dirname + '/static/initialConfiguration.html');
	});

    app.post('/processInitialConfiguration', function(req, res) {
	console.log(JSON.stringify(req.body));
	initialconfiguration.run(req.body); 
    });
    
    this.removeRoutes = function()
    {
	console.log(app.stack);
    }
}
var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(SetupApp, EventEmitter);

module.exports = SetupApp;