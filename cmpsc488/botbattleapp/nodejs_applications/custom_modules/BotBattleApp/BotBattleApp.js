var paths = require('../BotBattlePaths');
var path = require('path');

var BotBattleAppHelpers = require(paths.BotBattleApp_sub_modules.Helpers);
var fileManager = require(paths.custom_modules.FileManager).newInstance();

var testArenaInstances = require(paths.BotBattleApp_sub_modules.TestArenaInstances);

function BotBattleApp(server, database) {
	var self = this;
	
	Date.prototype.addHours= function(h){
	    this.setHours(this.getHours()+h);
	    return this;
	}
	
	Date.prototype.addMinutes= function(m){
      this.setMinutes(this.getMinutes()+m);
      return this;
    }
	
	Date.prototype.addSeconds= function(s){
      this.setSeconds(this.getSeconds()+s);
      return this;
    }


	require(paths.BotBattleApp_sub_modules.Login).registerRoutes(server, database);
	require(paths.BotBattleApp_sub_modules.StudentPortal).registerRoutes(server, database);
	require(paths.BotBattleApp_sub_modules.AdminPortal).registerRoutes(server, database);
	
	require(paths.BotBattleApp_sub_modules.TestArenaBotUpload).registerRoutes(server, database);
	   
	registerTestArenaRoutes(server, database);
}


var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(BotBattleApp, EventEmitter);

module.exports = BotBattleApp;




// TODO: if we ever go into a branch on a route that has an error we must always res.end() or send() or the client hangs
function registerTestArenaRoutes(server, database) {
  var logger = require(paths.custom_modules.Logger).newInstance('console');
   
  server.addDynamicRoute('get', '/', function(req, res) {
    // TODO: Can support multiple game modules if pass a list along in future
  	var locals = BotBattleAppHelpers.copyLocalsAndDeleteMessage(req.session);
  	res.render(paths.static_content.views + 'pages/testArena', { 'locals' : locals});
  });
  

  server.addDynamicRoute('get', '/startGame', function(req, res) {
    console.log(req.query.id + " in start game");
    var success = testArenaInstances.spawnNewGameInstance(req.query.id);
    if (success) {
      res.json({status: "Spawned a new game, this is when you should start listening for game states"});
    }
    else {
      res.status(500).json({error: "Failed to start the game, please contact your administrator"});
    }

  });
  
  server.addDynamicRoute('get', '/sendMove', function(req, res) {
    setTimeout(function(){ 
      var success = testArenaInstances.sendMoveToGameInstanceById(req.query.id, req.query.move);
      if (success) {
        res.json({'status' : "Sent to stdin"});
      }
      else {
        res.json({'error' : "Game is not running"});
      }
    }, 2000);
  });
  
  server.addDynamicRoute('get', '/getLatestGameStates', function(req,res) {
    var latestGameStateArray = testArenaInstances.popAllFromGameStateQueue(req.query.id);
    if (latestGameStateArray) {
      res.json({'gamestates' : latestGameStateArray});
    }
    else {
      res.status(500).json({'error' : "Cannot get gameStates due to invalid Id please refresh the page"});
    }
  });
  
  /**
   * Requested the test arena page is refreshed or a link is followed out
   * i.e. when the page is reloaded.
   */
  server.addDynamicRoute('get', '/killGame', function(req, res) {
    var id = req.query.id;
    console.log("Killing ", id);
    testArenaInstances.deleteTestArenaInstanceAndGameForId(id, function(err){
       if(err){
         logger.log(err);
         res.json({"error":err});
       }
       else{
         res.json({"error":"Killed"});
       }
    });
  });
  
  /**
   * Requested the test arena client clicks Kill Game
   */
  server.addDynamicRoute('get', '/killCurrentGame', function(req, res) {
    var id = req.query.id;
    console.log("Killing ", id);
    testArenaInstances.killSpawnedGameForId(id, function(err){
       if(err){
         logger.log(err);
         res.json({"error":err});
       }
       else{
         res.json({"status":"Killed"});
       }
    });
  });
 


  


  
  /**
   * Requested by the "Echo Test" Button on the test arena page
   */
  /*
  server.addDynamicRoute('get', '/echoTest', function(req, res) {
    var id = req.query.id;
    if(testArenaInstances.getGame(id) && testArenaInstances.getGame(id).gameProcess && testArenaInstances.getGame(id).gameState === "running"){
      setTimeout(function(){ 
        if(testArenaInstances.getGame(id) && testArenaInstances.getGame(id).gameProcess && testArenaInstances.getGame(id).gameState === "running")
          testArenaInstances.getGame(id).gameProcess.stdin.write(req.query.echo_stdin + '\n'); 
        }, 2000);
      
      res.json({'status' : "Sent to stdin"});
    }
    else{
      res.json({'error' : "Game is not running"});
    }
  });
  */
  
  

  
  /**
   * Requested by the "Send Move" Button on the test arena page
   */
 /* server.addDynamicRoute('post', '/testArenaUpdate', function(req, res) {
    // Here it should be asserted that this current session has 
    
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

  }); */
  
}


