
function BotBattleApp(server) {
	var self = this;
	var paths = require('./BotBattlePaths');
	var fileManager = new (require(paths.custom_modules.FileManager));
	var db = {};
	
	// do all of this in ajax now
	/*
	server.socketIOReceiveFromAll('connection', function(socket){  
	       db[socket.id] = { 
	           sock: socket,
	           playerTurn: 1
	       }
		   console.log("\nUser connected");
		   console.log("Assigned id: " + socket.id);
		   server.socketIOEmitToAll("test");
	});
	*/
	
	server.socketIOReceiveFromAll('message', function(data){
 	   // validate 
	  console.log("revieved stdin");
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
	
	server.addDynamicRoute('post', '/testArenaUpdate', function(req, res) {
	  res.send({
	         {
                'Round1': {
                  'animations': [
                    {
                      'player': 'player1',
                      'event': 'move',
                      'data': 3 // The board position to move to (will be 0 to 24)
                    },
                    {
                      'player': 'player1',
                      'event': 'successful_attack', (Otherwise would be defended_attack)
                      'data': null  // Don't need any additional data here
                    },
                    {
                      'player': 'player2', //(And if it was defended this would be player1 moving back to where it was.
                      'event': 'move',
                      'data': 10
                    }
                  ]
                },
                'Round2': {
                  'animations': [
                    {
                      'player': 'player2',
                      'event': 'move',
                      'data': 6 // The board position to move to (will be 0 to 24)
                    }
                  ]
                },
                // ... More rounds
              }
	  })
	}); 
}

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(BotBattleApp, EventEmitter);

module.exports = BotBattleApp;