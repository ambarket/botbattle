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
      logger.log("TestArenaInstances", "Cleaning");
      for(instance in testArenaInstances){
        logger.log("TestArenaInstances", "instance", instance)
        now = Date.now();
        logger.log("TestArenaInstances", "now", now);
        logger.log("TestArenaInstances", "Delete at", testArenaInstances[instance].gameExpireDateTime)
        if(now > testArenaInstances[instance].gameExpireDateTime){
          // kill spawned game here too and anything created during a game
          if (testArenaInstances[id].gameProcess){
            var pid = testArenaInstances[id].gameProcess.pid;
            logger.log("TestArenaInstances", "End Child: " + pid);          
            testArenaInstances[id].gameProcess.stdin.end();
            testArenaInstances[id].gameProcess.kill(); 
          }
          delete testArenaInstances[instance];
          count++;
          fileManager.deleteGameInstanceDirectory(instance, function(err){
            if(err){
              logger.log("TestArenaInstances", err);
              // TODO: actually send an appropriate HTTP error code/message
              res.json({"error":err});
            }
          });
        }
      }
      logger.log("TestArenaInstances", "Cleaned :", count, " instances.");
      cleanTest_Arena_tmp();
    }, 3600000); // 1 hour 3600000
  })();
  
  
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
        'bot2Path' : null,
        'stdoutQueue' : [],
        'stderrQueue' : []
      };
    fileManager.createGameInstanceDirectory(newGameId, function(err, result){
      if(err){
        logger.log("TestArenaInstances", 
            helpers.getLogMessageAboutGame(newGameId, "There was an error creating directory for new instance: ", err.message));
      }
      else{
        fileManager.createBotFolderInGameInstanceDirectory(newGameId, "bot1", function(err, result){
          if(err){
            logger.log("TestArenaInstances", 
                helpers.getLogMessageAboutGame(newGameId, "There was an error creating directory for bot1 ", err.message));
          }
          else{
            fileManager.createBotFolderInGameInstanceDirectory(newGameId, "bot2", function(err, result){
              if(err){
                logger.log("TestArenaInstances", 
                    helpers.getLogMessageAboutGame(newGameId, "There was an error creating directory for bot2 "+ err.message));
              }
              logger.log("TestArenaInstances", 
                  helpers.getLogMessageAboutGame(newGameId, "Successfully created new testArenaInstance"));
              callback(null, newGameId);
            });
          }
        });
      }
    }); 
  }
  
  // TODO: this is asyn and concerns me about running this based on its existance...
  // TODO: So I believe the reson this is not a problem is because nod eis single threaded. Basically this spawn
  //    just throws the function on the vent queue and that function is guarenteed not to run until this current function
  //    complete. (ANd all others that have been enqueued before it).
  //    As a result this entire function becomes synchronous and we cannot claim to know wheter the process will 
  //    spawn properly or not until after this function completes. We'll handle this by setting the callbacks to
  //    set meaningful states in the testAreneInstance
  //    --Feel free to delete this after you read it.
  this.spawnNewGameInstance = function(id) {
    var spawn = require('child_process').spawn;
    if (!testArenaInstances[id]) {
      logger.log("TestArenaInstances", 
          helpers.getLogMessageAboutGame(id, "Invalid ID, cannot spawn game manager"));
      return false;
    } 
    else {
      if (testArenaInstances[id].gameProcess) {
        logger.log("TestArenaInstances", 
            helpers.getLogMessageAboutGame(id, "Game Manager already running"));
        return false;
      } 
      else {
        if (!testArenaInstances[id].gameModule.classFilePath) {
          logger.log("TestArenaInstances", 
              helpers.getLogMessageAboutGame(id, "Path to GameManager classFile is null, cannot spawn"));
          return false;
        } 
        else {
          var workingGamePath = path.resolve(paths.local_storage.test_arena_tmp, id);
          var classPath = path.resolve(paths.local_storage.game_modules + "/"
              + testArenaInstances[id].gameModule.gameName);

          testArenaInstances[id].gameProcess = spawn('java', [ "-classpath", classPath, "GameManager" ], {cwd : workingGamePath});
          testArenaInstances[id].state = "running";

          logger.log("TestArenaInstances", 
              helpers.getLogMessageAboutGame(id, "Spawned new game. PID: " + testArenaInstances[id].gameProcess.pid));

          testArenaInstances[id].gameProcess.stdout.on('data', function(data) {
            // make an array to store moves in
            testArenaInstances[id].stdoutQueue.push(data.toString());
            logger.log("TestArenaInstances", 
                helpers.getLogMessageAboutGame(id, "stdoutQueue: " + testArenaInstances[id].stdoutQueue));
          });

          testArenaInstances[id].gameProcess.stderr.on('data', function(data) {
            // make an array to store errors in
            testArenaInstances[id].stderrQueue.push(data.toString());
            logger.log("TestArenaInstances", 
                helpers.getLogMessageAboutGame(id, "stderrQueue: " + testArenaInstances[id].stderrQueue));
          });

          // Not sure we need both of these or what the difference is.
          testArenaInstances[id].gameProcess.on('close', function(code) {
            testArenaInstances[id].state = "closed";
            logger.log("TestArenaInstances", 'status', {
              'output' : 'program closed with code ' + code
            });
            logger.log("TestArenaInstances", 
                helpers.getLogMessageAboutGame(id, "PID: " + testArenaInstances[id].gameProcess.pid + " closed with code " + code));
          });

          testArenaInstances[id].gameProcess.on('exit', function(code) {
            testArenaInstances[id].state = "exited";
            logger.log("TestArenaInstances", 
                helpers.getLogMessageAboutGame(id, "PID: " + testArenaInstances[id].gameProcess.pid + " exited with code " + code));
          });

          testArenaInstances[id].gameProcess.on('error', function(err) {
            testArenaInstances[id].state = "error";
            logger.log("TestArenaInstances", 
                helpers.getLogMessageAboutGame(id, "PID: " + testArenaInstances[id].gameProcess.pid + " error " + err.message));
          });
          return true;
        }
      }
    }
  }
  
  // TODO: Needs cleaned up and nicer logging.
  this.removeGame = function(id, callback) {
    // TODO: Look up why delete isn't recommended // sometimes something can be
    // null in the delete call
      // TODO: With this and others that rely on id we should check that
      // req.query.id exists or delete finds the value
      // incase the user tries to change the value or it becomes corrupted.
        if (testArenaInstances[id]){
            if (testArenaInstances[id].gameProcess){
                var pid = testArenaInstances[id].gameProcess.pid;
                logger.log("TestArenaInstances", "End Child: " + pid);
                
                testArenaInstances[id].gameProcess.on('close', function(code) {
                  delete testArenaInstances[id];
                  fileManager.deleteGameInstanceDirectory(id, function(err){
                    if(err){
                      logger.log("TestArenaInstances", err);
                      callback("Server file manage error"); 
                    }
                  })
                  logger.log("TestArenaInstances", "Child ", pid, "exited with code", code);
                  logger.log("TestArenaInstances", "After Kill testArenaInstances is:\n", testArenaInstances);
                  callback(null);
                });
                
                testArenaInstances[id].gameProcess.stdin.end();
                testArenaInstances[id].gameProcess.kill(); 
            }
            else{
              logger.log("TestArenaInstances", "No child for id");
                delete testArenaInstances[id];
                fileManager.deleteGameInstanceDirectory(id, function(err){
                  if(err){
                    logger.log("TestArenaInstances", err);
                    callback("Server file manage error"); 
                  }
                })
                callback(null);
            }
        }
        else{
          if(id !== "defaultIdValue"){
            logger.log("TestArenaInstances", "cleanup","invalid id:", id);
            callback("invalid id: " + id);
          }
          else{
            callback(null);
          }
        }
    }
 
})(); // Immedietly execute and create the module

