
function BotBattleApp(botBattleAppServer) {
	var self = this;
	var paths = require('./BotBattlePaths');
	var fileManager = new (require(paths.custom_modules.FileManager));
	
	botBattleAppServer.addStaticFileRoute('/', 'static/html/testArena.html');

	// Serve static images files
	botBattleAppServer.addStaticFolderRoute('/static', 'static/');
	
	
}

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(BotBattleApp, EventEmitter);

module.exports = BotBattleApp;