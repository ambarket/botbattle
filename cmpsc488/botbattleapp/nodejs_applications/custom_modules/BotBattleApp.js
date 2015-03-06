
function BotBattleApp(server) {
	var self = this;
	var paths = require('./BotBattlePaths');
	var fileManager = new (require(paths.custom_modules.FileManager));
	var db = {};
	
	server.socketIOReceiveFromAll('connection', function(socket){  
	       db[socket.id] = { 
	           sock: socket,
	           playerTurn: 1
	       }
		   console.log("\nUser connected");
		   console.log("Assigned id: " + socket.id);
		   server.socketIOEmitToAll("test");
	});
	
	server.socketIOReceiveFromAll('message', function(data){
 	   // validate 
			if (db[data.id].playerTurn == 1){
				console.log(data.input);
				//db[data.id].run.stdin.write(data.input + '\n');
				//validate move and send it to the game, but for now just send it back to the client as a gameState
			}
			else 
			{
				server.socketIOEmitToId(data.id, 'wrongTurn', {'output': 'Player 2 turn'});
			}
			console.log("revieved stdin");
	   });
	
	server.addStaticFileRoute('/', 'static/html/testArena.html');

	// Serve static images files
	server.addStaticFolderRoute('/static', 'static/');	
}

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(BotBattleApp, EventEmitter);

module.exports = BotBattleApp;