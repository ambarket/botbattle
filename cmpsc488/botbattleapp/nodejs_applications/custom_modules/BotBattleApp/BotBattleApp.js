var paths = require('../BotBattlePaths');
var path = require('path');

var BotBattleAppHelpers = require(paths.BotBattleApp_sub_modules.Helpers);
var fileManager = new (require(paths.custom_modules.FileManager));
var testArenaInstances = {};


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
	
	require(paths.BotBattleApp_sub_modules.TestArenaBotUpload).registerRoutes(server, testArenaInstances);
	   
	registerTestArenaRoutes(server, database);
}


var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(BotBattleApp, EventEmitter);

module.exports = BotBattleApp;

function cleanTest_Arena_tmp() {
  var count = 0;
  var instance;
  var now = Date.now();
  setTimeout(function () {
    console.log("Cleaning");
    for(instance in testArenaInstances){
      console.log("instance", instance)
      now = Date.now();
      console.log("now", now);
      console.log("Delete at", testArenaInstances[instance].gameExpireDateTime)
      if(now > testArenaInstances[instance].gameExpireDateTime){
        // kill spawned game here too and anything created during a game
        if (testArenaInstances[id].gameProcess){
          var pid = testArenaInstances[id].gameProcess.pid;
          logger.log("End Child: " + pid);          
          testArenaInstances[id].gameProcess.stdin.end();
          testArenaInstances[id].gameProcess.kill(); 
        }
        delete testArenaInstances[instance];
        count++;
        fileManager.deleteGameInstanceDirectory(instance, function(err){
          if(err){
            console.log(err);
            // TODO: actually send an appropriate HTTP error code/message
            res.json({"error":err});
          }
        });
      }
    }
    console.log("Cleaned :", count, " instances.");
    cleanTest_Arena_tmp();
  }, 3600000); // 1 hour 3600000
}
cleanTest_Arena_tmp();


// TODO: if we ever go into a branch on a route that has an error we must always res.end() or send() or the client hangs
function registerTestArenaRoutes(server, database) {
  var logger = require(paths.custom_modules.Logger).newInstance('console');
   
  server.addDynamicRoute('get', '/', function(req, res) {
    // TODO: Can support multiple game modules if pass a list along in future
  	var locals = BotBattleAppHelpers.copyLocalsAndDeleteMessage(req.session);
  	res.render(paths.static_content.views + 'pages/testArena', { 'locals' : locals});
  });
  
  // TODO: I'm not sure what this comment means : all oter functions that require session need to be changed because the structure is now different
  //TODO: This is called by the uploadBot button before the call to the actual upload route.
  //    Name this better to indicate that.
  server.addDynamicRoute('get', '/newTestArenaInstance', function(req, res) {
    // TODO: clean this up to samller concentrated functions.
    
    /*  this should be done on upload, but we have that only 2 routes working and multer problem thing...
     * 1. Delete folder and instance and other game stuff if id provided by client exists (should be function)
     * 2. create object in testArenaInstances as needed
     * 3. create files like before.
     * 4. create game instance?
     * 5. return the new id
     */
      var id = req.query.id;
      // if client exists in the testArenaInstance then delete it and the instance object
      cleanUp(id, function(err){
        if(err){
          logger.log("/newGame",err);
        }
       // create a new object and folder with the id
        var id = require('shortid').generate();
        var gameExpireDateTime = new Date().addHours(2);
        //var gameExpireDateTime = new Date().addSeconds(15);      
        
        var newInstance = { 
          'gameProcess' : null,
          'gameState' : null,
          'gameExpireDateTime' : gameExpireDateTime,
          'gameModule' : null,
          'bot1Path' : null,
          'bot2Path' : null
        }; 
        
        database.queryListOfGameNames(function(err, nameList){
          if(err){
            console.log("There was an error getting the Game name list ", err.message);
            // TODO: actually send an appropriate HTTP error code/message
            res.json({"error":err});
          }
          else{
            console.log(nameList);
            // The assumption is there will only be one game, but has support for multiple games in the future
            database.queryGameModule(nameList[0], function(err, gameModule){
              if(err){
                console.log('Could not get game module in BotBattleApp ' + err.message)
                // TODO: actually send an appropriate HTTP error code/message
                res.json({"error":err});
              }
              else{
                newInstance.gameModule = gameModule;
                testArenaInstances[id] = newInstance;
                fileManager.createGameInstanceDirectory(id, function(err, result){
                  if(err){
                    console.log(err);
                    // TODO: actually send an appropriate HTTP error code/message
                    res.json({"error":err});
                  }
                  else{
                    fileManager.createBotFolderInGameInstanceDirectory(id, "bot1", function(err, result){
                      if(err){
                        console.log(err);
                        // TODO: actually send an appropriate HTTP error code/message
                        res.json({"error":err});
                      }
                      else{
                        fileManager.createBotFolderInGameInstanceDirectory(id, "bot2", function(err, result){
                          if(err){
                            console.log(err);
                            // TODO: actually send an appropriate HTTP error code/message
                            res.json({"error":err});
                          }
                          console.log("results", result);
                          console.log("Current testArenaInstances\n",testArenaInstances);
                          res.json({"id" : id});
                        })
                      }
                    })
                  }
                }); 
              }
            })
          }
        })
      });   
    }); 
  
  function cleanUp(id, callback){
  //TODO: Look up why delete isn't recommended // sometimes something can be null in the delete call
    //TODO: With this and others that rely on id we should check that req.query.id exists or delete finds the value
    //      incase the user tries to change the value or it becomes corrupted.
      if (testArenaInstances[id]){
          if (testArenaInstances[id].gameProcess){
              var pid = testArenaInstances[id].gameProcess.pid;
              logger.log("End Child: " + pid);
              
              testArenaInstances[id].gameProcess.on('close', function(code) {
                delete testArenaInstances[id];
                fileManager.deleteGameInstanceDirectory(id, function(err){
                  if(err){
                    console.log(err);
                    callback("Server file manage error"); 
                  }
                })
                console.log("Child ", pid, "exited with code", code);
                console.log("After Kill testArenaInstances is:\n", testArenaInstances);
                callback(null);
              });
              
              testArenaInstances[id].gameProcess.stdin.end();
              testArenaInstances[id].gameProcess.kill(); 
          }
          else{
              logger.log("No child for id");
              delete testArenaInstances[id];
              fileManager.deleteGameInstanceDirectory(id, function(err){
                if(err){
                  console.log(err);
                  callback("Server file manage error"); 
                }
              })
              callback(null);
          }
      }
      else{
        if(id !== "defaultIdValue"){
          logger.log("cleanup","invalid id:", id);
          callback("invalid id: " + id);
        }
        else{
          callback(null);
        }
      }
  }
  /**
   * Requested the test arena page is refreshed or a link is followed out
   * i.e. when the page is reloaded.
   */
  server.addDynamicRoute('get', '/killGame', function(req, res) {
    var id = req.query.id;
    console.log("Killing ", id);
    cleanUp(id, function(err){
       if(err){
         logger.log(err);
         res.json({"error":err});
       }
       else{
         res.json({"error":"Killed"});
       }
    });
  });
  
 


  
  //1.125) Ensure two appropriate number of bots (players) are present in storage
  // 3) Build the JSON object to send to the Game Manager
  // 4) Spawn a new Game Manager and pass the JSON object as command line argument(s). 
  //       We could maybe make it easier on the Game Manager side by splitting things up here
  //       into multiple arguments instead of just sending one object
  // 5) Somehow maintain a reference to that process object associated with the exact browser tab
  //       that spawned it.
  // 5.5) Hide the play game button and unhide the Send Move button  // client side crap
  // 5.75) When user sends the move hide the Send Move button.  // client side crap
  // 6) Wait for the initial game state to be sent by the Game Manager via stdout
  // 7) Send this initial game state to the client via res.json()
  server.addDynamicRoute('post', '/startGame',
      function(req, res) {
        var path = require('path');
        var id = req.body.tabId;
        var spawn = require('child_process').spawn;
        if (testArenaInstances[id]){
            if (!testArenaInstances[id].gameProcess){
                if(testArenaInstances[id].gameModule.classFilePath){
                    var workingGamePath = path.resolve(paths.local_storage.test_arena_tmp, id);
                    var classPath = path.resolve(paths.local_storage.game_modules + "/" + testArenaInstances[id].gameModule.gameName);
                    // TODO: this is asyn and concerns me about running this based on its existance...
                    testArenaInstances[id].gameProcess  = spawn('java', ["-classpath", classPath, "GameManager"], {cwd: workingGamePath});
                    console.log('java',"-classpath", classPath, "GameManager");
                    logger.log("Spawned new game. PID: " + testArenaInstances[req.body.tabId].gameProcess.pid);
                    if(testArenaInstances[id].gameProcess){
                      testArenaInstances[id].state = "running";
                      testArenaInstances[id].gameProcess.stdout.on('data', function(data){
                        // make an array to store moves in
                        console.log('stdout', {'output': data.toString()});
                      });                      
                      testArenaInstances[id].gameProcess.stderr.on('data', function(data){
                        // make an array to store errors in
                        console.log('stderr', {'output': data.toString()});
                      });                      
                      testArenaInstances[id].gameProcess.on('close', function(code){
                        testArenaInstances[id].state = "closed";
                        console.log('status', {'output': 'program closed with code ' + code});
                      });                      
                      testArenaInstances[id].gameProcess.on('exit', function(code){
                        testArenaInstances[id].state = "exited";
                        logger.log("Exited :" + testArenaInstances[id].gameProcess.pid);
                      });
                    }
                    else{
                      console.log("Game was not spawned or there is an async problem");
                    }
                    
                }else{
                    logger.log("Can't run program.  Filepath is null.\n");
                }
            }else{
                logger.log("already running");
            }
        }else{
          logger.log("/startGame","invalid id");
        }
        res.end(); 
  });
  
  /**
   * Requested by the "Echo Test" Button on the test arena page
   */
  server.addDynamicRoute('get', '/echoTest', function(req, res) {
    var id = req.query.id;
    if(testArenaInstances[id] && testArenaInstances[id].gameProcess && testArenaInstances[id].state === "running"){
      testArenaInstances[id].gameProcess.stdin.write(req.query.echo_stdin + '\n');
    }
    else{
      res.json({'error' : "Game is not running"});
    }
  });
  
  
  /**
   * Requested by the "Send Move" Button on the test arena page
   */
  server.addDynamicRoute('post', '/testArenaUpdate', function(req, res) {
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

  }); 
  
}


