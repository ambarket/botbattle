var paths = require('../../BotBattlePaths');
var path = require('path');

var helpers = require(paths.BotBattleApp_sub_modules.Helpers);
var fileManager = new (require(paths.custom_modules.FileManager));
var logger = require(paths.custom_modules.Logger).newInstance('console');
module.exports = new (function() {
  var testArenaInstances = {};

  // Start cleanup routine
  (function cleanTest_Arena_tmp() {
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
  })();
  
  //TODO: Needs cleaned up and nicer logging.
  this.removeGame = function(id, callback) {
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

  this.getGame = function(id) { return testArenaInstances[id] }
  this.getAllInstances  =  function() { return testArenaInstances };
  
  // Pass the gameModule object of the game to play
  this.createNewGame = function(gameModule, callback) {
    // create new gameId, create new testArenaInstance, create file structure for the instance, and finally pass the newGameId to the callback.
    var newGameId = require('shortid').generate();
    testArenaInstances[newGameId] = { 
        'gameProcess' : null,
        'gameState' : null,
        'gameExpireDateTime' : new Date().addHours(2),
        'gameModule' : gameModule,
        'bot1Path' : null,
        'bot2Path' : null
      };
    fileManager.createGameInstanceDirectory(newGameId, function(err, result){
      if(err){
        logger.log("TestArenaBotUpload", 
            helpers.getLogMessageAboutGame(newGameId, "There was an error creating directory for new instance: ", err.message));
      }
      else{
        fileManager.createBotFolderInGameInstanceDirectory(newGameId, "bot1", function(err, result){
          if(err){
            logger.log("TestArenaBotUpload", 
                helpers.getLogMessageAboutGame(newGameId, "There was an error creating directory for bot1 ", err.message));
          }
          else{
            fileManager.createBotFolderInGameInstanceDirectory(newGameId, "bot2", function(err, result){
              if(err){
                logger.log("TestArenaBotUpload", 
                    helpers.getLogMessageAboutGame(newGameId, "There was an error creating directory for bot2 "+ err.message));
              }
              logger.log("TestArenaBotUpload", 
                  helpers.getLogMessageAboutGame(newGameId, "Successfully created new testArenaInstance"));
              callback(null, newGameId);
            });
          }
        });
      }
    }); 
  }
 
})(); // Immedietly execute and create the module

