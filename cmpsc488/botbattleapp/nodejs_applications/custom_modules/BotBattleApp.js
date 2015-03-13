
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
	  setTimeout(function() {
	     res.send(
             {
               'turn1': {
                 'animatableEvents': [     // Each animatable_event must have an event name and data object
                    {
                      'event': 'move',
                      'data': { 
                        'objectName' : 'player2',
                        'finalPosition' : 11 
                      } 
                    },
                 ],
                 'gameData' : {
                   'player1Tiles' : [1, 3, 5, 5, 3],    // The tiles after this turn
                   'player2Tiles' : [2, 4, 3, 5, 1],
                   'turnDescription' : "Player 2 used a 3 tile to move to position 11.",  // May not be necessary but would be nice.
                 },
                 'debugData' : 
                   [
                      "An array", 
                      "of lines output by the bot", 
                      "stderr on this turn."
                   ],
               },
                'turn2': {
                  'animatableEvents': 
                    [
                       {
                         'event': 'move',
                         'data': 
                         { 
                          'object_name' : 'player1',
                          'final_position' : 10 
                         } 
                       },
                        {
                          'event': 'defend',
                          'data': 
                           { 
                            'attacker' : 'player1',
                            'defender' : 'player2',
                            'attackerFinalPosition' : 6  // After a defend the attacker should move back to their original position
                           } 
                        },
                      ],
                      'gameData' : {
                        'player1Tiles' : [1, 3, 2, 2, 3],
                        'player2Tiles' : [2, 4, 3, 5, 1],
                        'move' : "Player 1 used two 5 tile's to attack but was defended.",
                      },
                      'debugData' : 
                        [
                           "An array", 
                           "of lines output by the bot", 
                           "stderr on this turn."
                        ]
                },
              });
	  }, 2000); 

	}); 

}

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(BotBattleApp, EventEmitter);

module.exports = BotBattleApp;
