
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
	         [ // Instead of named objects called turns, just use an array of objects, on our end were calling these gamestates
	           // and they will be processed in the order that they are defined in this array
	           // Each gaem state has three properties
	           //  animatableEvents : an array of animatableEvent objects
	           //  gameData : an arbitrary game specific object containing necessary information
	           //  debugData : an arbitrary game specific object containing necessary information
               {
                 'animatableEvents': [     // Each animatableEvent must have an event name and data object
                    {
                      'event': 'move',
                      'data': { 
                        'objectName' : 'player1',
                        'finalPosition' : 9 
                      } 
                    },
                 ],
                 'gameData' : {
                   'player1Tiles' : [1, 3, 5, 5, 3],    // The tiles after this turn
                   'player2Tiles' : [2, 4, 3, 5, 1],
                   'turnDescription' : "Player 2 used a 3 tile to move to position 11.",  // May not be necessary but would be nice.
                 },
                 'debugData' : { // Only used in the test arena display
                      'stderr' : [ "An array", "of lines output by the bot", "stderr on this turn." ],
                      'stdout' : [ "An array", "of lines output by the bot", "stdout on this turn." ]
                 },
               }, 
               // Turn 2
               {
                  'animatableEvents': 
                    [
                        {
                          'event': 'defendedAttack',
                          'data': 
                           { 
                            'attacker' : 'player2',
                            'defender' : 'player1',
                            'attackerStartingPosition' : 24,  // After a defend the attacker should move back to their original position
                            'attackerAttackPosition' : 11
                           } 
                        },  
                    ],
                    'gameData' : {
                      'player1Tiles' : [1, 3, 2, 2, 3],
                      'player2Tiles' : [2, 4, 3, 5, 1],
                      'turnDescription' : "Player 1 used two 5 tile's to attack but was defended.",
                    },
                    'debugData' : {
                      'stderr' : [ "An array", "of lines output by the bot", "stderr on this turn." ],
                      'stdout' : [ "An array", "of lines output by the bot", "stdout on this turn." ]
                    },
                },
                // Turn 3
                {
                  'animatableEvents': [     // Each animatableEvent must have an event name and data object
                     {
                       'event': 'move',
                       'data': { 
                         'objectName' : 'player1',
                         'finalPosition' : 0 
                       } 
                     },
                  ],
                  'gameData' : {
                    'player1Tiles' : [1, 3, 5, 5, 3],    // The tiles after this turn
                    'player2Tiles' : [2, 4, 3, 5, 1],
                    'turnDescription' : "Player 2 used a 3 tile to move to position 11.",  // May not be necessary but would be nice.
                  },
                  'debugData' : {
                    'stderr' : [ "An array", "of lines output by the bot", "stderr on this turn." ],
                    'stdout' : [ "An array", "of lines output by the bot", "stdout on this turn." ]
                  },
                }, 
              ] // End game state array
	  );
	  }, 500); 

	}); 

}

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(BotBattleApp, EventEmitter);

module.exports = BotBattleApp;
