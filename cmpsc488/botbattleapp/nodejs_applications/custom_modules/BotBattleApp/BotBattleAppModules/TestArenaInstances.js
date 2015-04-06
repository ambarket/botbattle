var paths = require('../../BotBattlePaths');
var path = require('path');

var helpers = require(paths.BotBattleApp_sub_modules.Helpers);
var fileManager = new (require(paths.custom_modules.FileManager));
var logger = require(paths.custom_modules.Logger).newInstance('console');
module.exports = new (function() {
  var self = this;
  var testArenaInstances = {};
  
  // Start cleanup routine
  (function cleanTest_Arena_tmp() {
    var count = 0;
    var instance;
    var now = Date.now();
    setTimeout(function () {
      logger.log("TestArenaInstances", "Cleaning");
      for(instance in testArenaInstances){
        logger.log("TestArenaInstances", "instance", instance);
        now = new Date(); //Date.now(); 
        logger.log("TestArenaInstances", "now", now);
        logger.log("TestArenaInstances", "Delete at", testArenaInstances[instance].gameExpireDateTime);
        logger.log("TestArenaInstances", "Delete in", (testArenaInstances[instance].gameExpireDateTime - now) / 1000, "seconds"); 
        if(now > testArenaInstances[instance].gameExpireDateTime){
          // kill spawned game here too and anything created during a game
          // TODO: if game exists as reference, but not running will calling kill() or stdin.end() crash the server
          //       could test by running, then calling killCurrentGame and seeing if this crashes.  (set time to 40 seconds or so)
          // TODO: test this again
          if (testArenaInstances[instance].gameProcess && testArenaInstances[instance].gameState === "running"){
            var pid = testArenaInstances[instance].gameProcess.pid;
            logger.log("TestArenaInstances", "End Child: " + pid);          
            testArenaInstances[instance].gameProcess.stdin.end();
            testArenaInstances[instance].gameProcess.kill(); 
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
    }, 10000/*3600000*/); // 1 hour 3600000
  })();
  
  this.getGame = function(id) { return testArenaInstances[id] }
  
  this.getAllInstances  =  function() { return testArenaInstances };
  
  this.getMillisecondsBeforeInstanceExpires = function(id) {
    if (testArenaInstances[id]) {
      return Math.max(0, testArenaInstances[id].gameExpireDateTime - (new Date()));
    }
    else {
      return 0;
    }
  }
  
  // Just a boolean version of getMillisecondsBeforeInstanceExpires
  this.hasInstanceExpired = function(id) {
    return this.getMillisecondsBeforeInstanceExpires(id) === 0;
  }
  
  this.isGameManagerRunning = function(id) {
    return testArenaInstances[id].gameState === 'running';
  }
  
  this.popAllFromGameStateQueue = function(id) {
    if (!self.hasInstanceExpired(id)) {
      return testArenaInstances[id].gameStateQueue.splice(0, testArenaInstances[id].gameStateQueue.length);
    }
    else {
      return null;
    }
  }

  // Pass the gameModule object of the game to play
  this.createNewGame = function(gameModule, callback) {
    // create new gameId, create new testArenaInstance, create file structure for the instance, and finally pass the newGameId to the callback.
    var newGameId = require('shortid').generate();
    testArenaInstances[newGameId] = { 
        'gameProcess' : null,
        'gameState' : null,
        'gameExpireDateTime' : null,
        'gameModule' : gameModule,
        'bot1Path' : null,
        'bot2Path' : null,
        'gameStateQueue' : [],
        'resetExpirationTime' : function() {
          //this.gameExpireDateTime = new Date().addHours(2);
          this.gameExpireDateTime = new Date().addSeconds(30);
        },   
      };
    testArenaInstances[newGameId].resetExpirationTime();
    fileManager.createGameInstanceDirectory(newGameId, function(err, result){
      if(err){
        logger.log("TestArenaInstances", 
            helpers.getLogMessageAboutGame(newGameId, "There was an error creating directory for new instance: ", err.message));
        callback(err);
      }
      else{
        fileManager.createBotFolderInGameInstanceDirectory(newGameId, "bot1", function(err, result){
          if(err){
            logger.log("TestArenaInstances", 
                helpers.getLogMessageAboutGame(newGameId, "There was an error creating directory for bot1 ", err.message));
            callback(err);
          }
          else{
            fileManager.createBotFolderInGameInstanceDirectory(newGameId, "bot2", function(err, result){
              if(err){
                logger.log("TestArenaInstances", 
                    helpers.getLogMessageAboutGame(newGameId, "There was an error creating directory for bot2 "+ err.message));
                callback(err);
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
  
  
  this.spawnNewGameInstance = function(id) {
    var spawn = require('child_process').spawn;
    if (self.hasInstanceExpired(id)) {
      logger.log("TestArenaInstances", 
          helpers.getLogMessageAboutGame(id, "Invalid ID, cannot spawn game manager"));
      return false;
    } 
    else {
      if (testArenaInstances[id].gameProcess && testArenaInstances[id].gameState === 'running') {
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
          // Update expiration time after each action on this instance.
          testArenaInstances[id].resetExpirationTime();
          var workingGamePath = path.resolve(paths.local_storage.test_arena_tmp, id);
          // TODO: This should be using gameModule.classFilePath. Currently gameModule.classFilePath is being set to the list of source files.
          //    This is bad since the regular compile for a single file that we used for bots returns the actual compiled file. 
          //    Instead of using the classpath argument it should probably just use the full absolute path to the GameManager class file.
          //    Which should be returned by the callback in BotBattleCompiler.compileDIrectory method.
          //    By default I believe it will search for the other class files in the same directory.
          var classPath = path.resolve(paths.local_storage.game_modules + "/"
              + testArenaInstances[id].gameModule.gameName);

          //testArenaInstances[id].gameProcess = spawn('java', [ "-classpath", classPath, "GameManager", JSON.stringify(testArenaInstances[id])], {cwd : workingGamePath});
          testArenaInstances[id].gameProcess = spawn('java', [ "-classpath", classPath, "ArenaGameManager", JSON.stringify(testArenaInstances[id])], {cwd : workingGamePath});
          testArenaInstances[id].gameState = "running";

          logger.log("TestArenaInstances", 
              helpers.getLogMessageAboutGame(id, "Spawned new GameManager. PID: " + testArenaInstances[id].gameProcess.pid));

          testArenaInstances[id].gameProcess.stdout.on('data', function(data) {
            var array = data.toString().split(/\n/);
            console.log("Split array:", array)
            if(!self.hasInstanceExpired(id)) {
              testArenaInstances[id].resetExpirationTime();
              
              for (var i = 0; i < array.length; i++) {
                try {
                  testArenaInstances[id].gameStateQueue.push(JSON.parse(array[i]));
                  logger.log("TestArenaInstances", 
                      helpers.getLogMessageAboutGame(id, "gameStateQueue: " + testArenaInstances[id].gameStateQueue));
                }
                catch(e) {
                  console.log("Invalid JSON sent", array[i], e);
                }
              }
            }
            else {
              logger.log("TestArenaInstances", 
                  helpers.getLogMessageAboutGame(id, "Recevied data on stdout after instance expired:" + data.toString()));
            }
          });
          
          testArenaInstances[id].gameProcess.stderr.on('data', function(data) {
            logger.log("TestArenaInstances", 
                helpers.getLogMessageAboutGame(id, "Message on GameManager.stderr: " + data.toString()));
          });

          // Not sure we need both of these or what the difference is.
          testArenaInstances[id].gameProcess.on('close', function(code) {
            if (!self.hasInstanceExpired(id)) {
              testArenaInstances[id].gameState = "closed";
            }
            
            logger.log("TestArenaInstances", helpers.getLogMessageAboutGame(id, "GameManager closed with code " + code));
          });

          testArenaInstances[id].gameProcess.on('exit', function(code) {
            if (!self.hasInstanceExpired(id)) {
              testArenaInstances[id].gameState = "exited";
            }
            logger.log("TestArenaInstances", helpers.getLogMessageAboutGame(id, "GameManager exited with code " + code));
          });

          testArenaInstances[id].gameProcess.on('error', function(err) {
            if (!self.hasInstanceExpired(id)) {
              testArenaInstances[id].gameState = "error";
            }
            logger.log("TestArenaInstances", helpers.getLogMessageAboutGame(id, "GameManager threw the following error "  + err.message));
          });
          return true;
        }
      }
    }
  }
  
  // Synchronous
  this.sendMoveToGameInstanceById = function(id, move) {
    if (!self.hasInstanceExpired(id)) {
      testArenaInstances[id].resetExpirationTime();
      if(testArenaInstances[id].gameProcess && testArenaInstances[id].gameState === "running"){
        testArenaInstances[id].gameProcess.stdin.write(move + '\n'); 
        logger.log("TestArenaInstances", helpers.getLogMessageAboutGame(id, "Sent move", move, "to GameManager." ));
        return 'success';
      }
      else {
        logger.log("TestArenaInstances", helpers.getLogMessageAboutGame(id, "GameManager isn't running, can't send move", move));
        return 'noGameRunning';
      }
    }
    else {
      return 'expiredID';
    }
  }
  
  // TODO: now that we use this in many places we should make a killSpawnedGame(id, callback) and a 
  //       deleteTestArenaInstance(id, callback) because all removals and cleanups are a combination of the two.
  // TODO:  This shouldn't happen, but if the folder for an id is deleted before the game is then a call to this will just hang.
  //       scenario is I deleted the folders while a game was running in the client then hit kill game in the client
  this.killSpawnedGameForId = function(id, callback) {
    if (!self.hasInstanceExpired(id)) {
      if (testArenaInstances[id].gameProcess && testArenaInstances[id].gameState === 'running') {
        var pid = testArenaInstances[id].gameProcess.pid;
        logger.log("TestArenaInstances", "End Child: " + pid);

        testArenaInstances[id].gameProcess.on('close', function(code) {
          logger.log("TestArenaInstances", "Child ", pid, "exited with code", code);
          logger.log("TestArenaInstances", "After Kill testArenaInstances is:\n", testArenaInstances);
          callback(null);
        });
        testArenaInstances[id].gameProcess.stdin.end();
        testArenaInstances[id].gameProcess.kill();
      } 
      else {
        callback(null);
      }
    } 
    else {
      if (id !== "defaultIdValue") {
        logger.log("TestArenaInstances", "killSpawnedGameForId invalid id: " +  id);
        callback(new Error("Invalid id: " + id));
      } 
      else {
        callback(null);
      }
    }
  }
  
  this.deleteTestArenaInstanceAndGameForId = function(id, callback) {
    if (!self.hasInstanceExpired(id)) {
      if (testArenaInstances[id].gameProcess && testArenaInstances[id].gameState === 'running') {
        var pid = testArenaInstances[id].gameProcess.pid;
        
        testArenaInstances[id].gameProcess.on('close', function(code) {
          logger.log("TestArenaInstances", helpers.getLogMessageAboutGame(id, "GameManager " +  pid + " exited with code " + code));
          delete testArenaInstances[id];
          logger.log("TestArenaInstances", "After deletion testArenaInstances is:\n", JSON.stringify(testArenaInstances));
          fileManager.deleteGameInstanceDirectory(id, function(err) {
            if (err) {
              callback(new Error("Failed to delete gameInstanceDirectory " + err.message));
            }
            else {
              callback(null);
            }
          })
        });

        testArenaInstances[id].gameProcess.stdin.end();
        testArenaInstances[id].gameProcess.kill();
      } else {
        logger.log("TestArenaInstances", "No child for id", id);
        delete testArenaInstances[id];
        fileManager.deleteGameInstanceDirectory(id, function(err) {
          if (err) {
            logger.log("TestArenaInstances", err);
            callback("Server file manage error");
          }
        })
        callback(null);
      }
    } else {
      if (id !== "defaultIdValue") {
        logger.log("TestArenaInstances", "cleanup", "invalid id:", id);
        callback("invalid id: " + id);
      } else {
        callback(null);
      }
    }
  }
  

 
})(); // Immedietly execute and create the module

