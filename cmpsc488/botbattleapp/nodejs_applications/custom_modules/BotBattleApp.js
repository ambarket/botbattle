
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
                 'debugData' : {
                      lines : [ "An array", "of lines output by the bot", "stderr on this turn." ]
                 },
               }, 
               // Turn 2
               {
                  'animatableEvents': 
                    [
                       {
                         'event': 'move',
                         'data': 
                         { 
                          'objectName' : 'player2',
                          'finalPosition' : 11 
                         } 
                       },
                        {
                          'event': 'defend',
                          'data': 
                           { 
                            'attacker' : 'player2',
                            'defender' : 'player1',
                            //'attackerFinalPosition' : 6  // After a defend the attacker should move back to their original position
                           } 
                        },
                        {
                          'event': 'move',
                          'data': 
                           { 
                            'objectName' : 'player1',
                            'finalPosition' : 5  // After a defend the attacker should move back to their original position
                           } 
                        },
                        {
                          'event': 'move',
                          'data': 
                           { 
                            'objectName' : 'player2',
                            'finalPosition' : 18  // After a defend the attacker should move back to their original position
                           } 
                        },
                        {
                          'event': 'move',
                          'data': 
                           { 
                            'objectName' : 'player1',
                            'finalPosition' : 16  // After a defend the attacker should move back to their original position
                           } 
                        },
                        {
                          'event': 'defend',
                          'data': 
                           { 
                            'attacker' : 'player1',
                            'defender' : 'player2',
                            //'attackerFinalPosition' : 6  // After a defend the attacker should move back to their original position
                           } 
                        },
                    ],
                    'gameData' : {
                      'player1Tiles' : [1, 3, 2, 2, 3],
                      'player2Tiles' : [2, 4, 3, 5, 1],
                      'move' : "Player 1 used two 5 tile's to attack but was defended.",
                    },
                    'debugData' : {
                      lines : [ "An array", "of lines output by the bot", "stderr on this turn." ]
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
