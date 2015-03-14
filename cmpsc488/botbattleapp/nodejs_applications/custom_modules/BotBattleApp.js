
function BotBattleApp(server, database) {
	var self = this;

	var paths = require('./BotBattlePaths');
	var fileManager = new (require(paths.custom_modules.FileManager));
	
	server.addDynamicRoute('get', '/', function(req, res) {
	  var path = require('path');
	  
	  // Everytime the page is refreshed, we want a whole new session. (Original comment for the below code)
	  //   This fails because it replaces the session of all other existing tabs
	  //   with this new one. It seems the only way to keep track of multiple browser
	  //   tabs associated with separate server side data is to use our own tracking 
	  //   mechanism. There are some sources that site making cookies and or HTML5 session storage
	  //   work for this. e.g. https://sites.google.com/site/sarittechworld/track-client-windows
	  //   but I think it makes for sense for us to just implement our own way similar to what
	  //   was done in SocketIOConnectionTracker. 
	  //   The other obvious though is to just allow on connection to the server from each browser,
	  //   however to implement this you have to keep track of things yourself anyway. Below I tried complaining
	  //   if there was already a cookie set but this fails for reloading the page in a single tab.
	   req.session.regenerate(function(err) {
	     console.log(req.session.id, req.cookies['connect.sid']);
	     // res.cookie('rememberme', 'yes', { maxAge: 900000, httpOnly: true});
	      console.log(req.session);
	      req.session.views = 1234;
	      //console.log(req.sessionId);
	      //if (!req.cookies['connect.sid']) {
	        res.sendFile(path.resolve(paths.static_content.html, 'testArena.html'));
	      //}
	      //else {
	      //  res.send("Sorry you already have an open session");
	      //}
	   });
	});
	
	/**
	 * Requested by the "Play Game" Button on the test arena page
	 */
	server.addDynamicRoute('post', '/playNewGame', function(req, res) {
	  // 0) Ensure any previous Game Manager instances associated with this browser tab have been killed
	  // 1) Grab the unique id of this client from the req and verify it is valid
	  // 1.5) Move the source files of the bot(s) to the directory of this unique id.
	  // 2) Compile the bot(s)
	  // 3) Build the JSON object to send to the Game Manager
	  // 4) Spawn a new Game Manager and pass the JSON object as command line argument(s). 
	  //       We could maybe make it easier on the Game Manager side by splitting things up here
	  //       into multiple arguments instead of just sending one object
	  // 5) Somehow maintain a reference to that process object associated with the exact browser tab
	  //       that spawned it.
	  // 6) Wait for the initial game state to be sent by the Game Manager via stdout
	  // 7) Send this initial game state to the client via res.send()
	}
	
	/**
     * Requested by the "Kill Game" Button on the test arena page
     */
    server.addDynamicRoute('post', '/killGame', function(req, res) {
      // Kill any Game Manager instances associated with this browser tab
      // Send a response back that the client should use to reset its canvas 
      //    and other html and javascript stuff so that the user can request
      //    playNewGame again and it will work.
    }
	
    /**
     * Requested by the "Send Move" Button on the test arena page
     */
	server.addDynamicRoute('post', '/testArenaUpdate', function(req, res) {
	  // Here it should be asserted that this current session has 
	  
	  setTimeout(function() {
        console.log("in ajax req", req.session.id, req.cookies['connect.sid']);
        // res.cookie('rememberme', 'yes', { maxAge: 900000, httpOnly: true});
         console.log(req.session);
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
