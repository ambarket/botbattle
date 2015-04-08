var paths = require('../BotBattlePaths');
var path = require('path');

var helpers = require(paths.BotBattleApp_sub_modules.Helpers);
var fileManager = require(paths.custom_modules.FileManager).newInstance();
var logger = require(paths.custom_modules.Logger).newInstance('console');
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
	   
	registerGameResourceRoutes(server, database);
	registerTestArenaRoutes(server, database);
}


var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(BotBattleApp, EventEmitter);

module.exports = BotBattleApp;

function registerGameResourceRoutes(server, database) {
  
  server.addDynamicRoute('get', /^\/game\/(.*)\/resources/, function(req, res) {
    // To get the filePath just strip /game/ off and append to game_modules directory.
    // Split into components based on forward slash. 
    //    urlComponents[0] will always be '' because of leading forward slash
    //    urlComponents[1] will always be 'game'
    //    urlComponents[2] is the game name.
    //    urlComponents[3] is always 'resources'
    //    The rest is the path to the requested resource
    var urlComponents = req.url.split("/"); 
    
    database.queryGameModule(urlComponents[2], function(err, gameModule) {
      if (err) {
        logger.log("BotBattleApp", "Error while querying for game module with name", + urlComponents[2], err.message);
        res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
      }
      else {
        if (!gameModule) {
          logger.log("BotBattleApp", "Failed to serve resource file for game " + urlComponents[2] + " because no game module was found under that name.");
          res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
        }
        else {
          if (!gameModule.resourcesDirectory) {
            logger.log("BotBattleApp", "Failed to serve resource file for game", urlComponents[2], 
                "because no resource directory was not defined in the game module's database entry\n", gameModule);
            res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
          }
          else {
            //var resolvedFilePath = path.join(gameModule.resourcesDirectory, );
            //res.sendFile(resolvedFilePath);
            var fileName = req.url.substring(req.url.indexOf('resources/') + 10);
            res.sendFile(fileName, { root: gameModule.directories.resources }, function (err) {
              if (err) {
                logger.log("BotBattleApp", "Failed to serve request for", req.url, ", likely this file doesn't exist on the file system.", err.message);
                res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
              }
            });
          }
        }
      }
    });
  });

  server.addDynamicRoute('get', /^\/game\/(.*)\/rules$/, function(req, res) {
    // To get the filePath just strip /game/ off and append to game_modules directory.
    // Split into components based on forward slash. 
    //    urlComponents[0] will always be '' because of leading forward slash
    //    urlComponents[1] will always be 'game'
    //    urlComponents[2] is the game name.
    //    urlComponents[3] is always 'rules'
    var urlComponents = req.url.split("/"); 
    
    database.queryGameModule(urlComponents[2], function(err, gameModule) {
      if (err) {
        logger.log("BotBattleApp", "Error while querying for game module with name", + urlComponents[2], err.message);
        res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
      }
      else {
        if (!gameModule) {
          logger.log("BotBattleApp", "Failed to serve rules file for game " + urlComponents[2] + " because no game module was found under that name.");
          res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
        }
        else {
          if (!gameModule.rulesFilePath) {
            logger.log("BotBattleApp", "Failed to serve rules file for game", urlComponents[2], 
                "because its path was not defined in the game module's database entry\n", gameModule);
            res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
          }
          else {
            res.sendFile(gameModule.rulesFilePath, function (err) {
              if (err) {
                logger.log("BotBattleApp", "Failed to serve request for", req.url, ", likely this file doesn't exist on the file system.", err.message);
                res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
              }
            });
          }
        }
      }
    });
  });
  
  server.addDynamicRoute('get', /^\/game\/(.*)\/javascript$/, function(req, res) {
    // To get the filePath just strip /game/ off and append to game_modules directory.
    // Split into components based on forward slash. 
    //    urlComponents[0] will always be '' because of leading forward slash
    //    urlComponents[1] will always be 'game'
    //    urlComponents[2] is the game name.
    //    urlComponents[3] is always 'javascript'
    var urlComponents = req.url.split("/"); 
    
    database.queryGameModule(urlComponents[2], function(err, gameModule) {
      if (err) {
        logger.log("BotBattleApp", "Error while querying for game module with name", + urlComponents[2], err.message);
        res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
      }
      else {
        
        if (!gameModule) {
          logger.log("BotBattleApp", "Failed to serve javascript file for game " + urlComponents[2] + " because no game module was found under that name.");
          res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
        }
        else {
          if (!gameModule.javascriptFilePath) {
            logger.log("BotBattleApp", "Failed to serve javascript file for game", urlComponents[2], 
                "because its path was not defined in the game module's database entry\n", gameModule);
            res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
          }
          else {
            res.sendFile(gameModule.javascriptFilePath, function (err) {
              if (err) {
                logger.log("BotBattleApp", "Failed to serve request for", req.url, ", likely this file doesn't exist on the file system.", err.message);
                res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
              }
            });
          }
        }
      }
    });
  });
}


// TODO: if we ever go into a branch on a route that has an error we must always res.end() or send() or the client hangs
function registerTestArenaRoutes(server, database) {
  
  /**
   * Requested the test arena page is refreshed or a link is followed out
   * i.e. when the page is reloaded.
   */
  server.addDynamicRoute('get', '/deleteTestArenaInstance', function(req, res) {
    var id = req.query.id;
    res.end(); // This is only called after navigating away from the page. No point in sending anything.
    if(testArenaInstances.hasInstanceExpired(id)) {
      logger.log("BotBattleApp", helpers.getLogMessageAboutGame(id, "The record associated with " + id + 
          " has already expired, no further action needed in deleteTestArenaInstance"));
    }
    else {
      logger.log("BotBattleApp", helpers.getLogMessageAboutGame(id, "Deleting all files and references to testArenaInstance"));
      testArenaInstances.deleteTestArenaInstanceAndGameForId(id, function(err){
         if(err){
           logger.log("BotBattleApp", helpers.getLogMessageAboutGame(id, "Error in deleteTestArenaInstance " + err.message));
         }
         else{
           logger.log("BotBattleApp", helpers.getLogMessageAboutGame(id, "Successfully deleted all files and references"));
         }
      });
    }
  });
  
  /**
   * Requested the test arena page is requested
   */
  server.addDynamicRoute('get', '/', function(req, res) {
    // Grab the game module from the DB, to know which client javascript file to render into the test arena page.
    // To support multiple tournaments, this route would need to present a list of game modules to the client, then
    //  in another route, after receiving their selection you grab the game module and send them the rendered testArena.ejs
    database.queryForSystemGameModule(function(err, gameModule) {
      if (err) {
        logger.log("BotBattleApp", 
            helpers.getLogMessageAboutGame("NotCreatedYet", "Failed to load test arena because system game module couldn't be found: ", err.message));
        res.status(500).send("An unexpected error occured while loading the test arena. Please see your administrator if this problem persists.");
      }
      else {
        console.log(gameModule);
        
        var locals = helpers.copyLocalsAndDeleteMessage(req.session);
        locals.gameJavascriptUrl = "/game/" + gameModule.gameName + "/javascript";
        locals.gameRulesUrl = "/game/" + gameModule.gameName + "/rules";
        res.render(paths.static_content.views + 'pages/testArena', { 'locals' : locals});
      }
    });
  });


  server.addDynamicRoute('get', '/startGame', function(req, res) {
    var success = testArenaInstances.spawnNewGameInstance(req.query.id);
    if (success) {
      res.json({ 'event' : 'success' });
    }
    else {
      res.json({ 'event' : 'expiredID'});
    }

  });
  
  server.addDynamicRoute('get', '/sendMove', function(req, res) {
    setTimeout(function(){ 
      var event = testArenaInstances.sendMoveToGameInstanceById(req.query.id, req.query.move);
      if (event === 'success') {
        res.json({ 'event' : 'success' });
      }
      else if (event === 'noGameRunning') {
        res.json({ 'event' : 'noGameRunning' });
      }
      else if (event === 'expiredID') {
        res.json({ 'event' : 'expiredID'});
      }
      else {
        logger.log("BotBattleApp", "Invalid event in sendMove", event);
        res.send("Invalid event");
      }
    }, 2000);
  });
  
  /**
   * Requested the test arena client clicks Kill Game
   */
  // Currently the only reason this would return an error is an invalidID
  // TODO: It seems like killSpawnedGameForID still has some TODOs
  //    If anything changes there may have to change this too.
  server.addDynamicRoute('get', '/killCurrentGame', function(req, res) {
    var id = req.query.id;
    testArenaInstances.killSpawnedGameForId(id, function(err){
       if(err){
         logger.log("BotBattleApp", "Error in killCurrentGame", err.message);
         res.json({ 'event' : 'expiredID' });
       }
       else{
         res.json(
           { 'event' : 'success' });
       }
    });
  });
 
  
  server.addDynamicRoute('get', '/getLatestGameStates', function(req,res) {
    if (testArenaInstances.hasInstanceExpired(req.query.id)) {
      return res.json({ 'event' : 'expiredID' });
    }
    
    var latestGameStateArray = testArenaInstances.popAllFromGameStateQueue(req.query.id);
    if (latestGameStateArray) {
      if (testArenaInstances.isGameManagerRunning(req.query.id) || latestGameStateArray.length > 0) {
        res.json(
            { 'event' : 'success',
              'gamestates' : latestGameStateArray,
              'millisecondsUntilExpiration' : testArenaInstances.getMillisecondsBeforeInstanceExpires(req.query.id)
            });
      }
      else {
        return res.json({ 'event' : 'noStatesRemaining' });
      }
    }
    else {
      res.json({ 'event' : 'expiredID' });
    }
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


