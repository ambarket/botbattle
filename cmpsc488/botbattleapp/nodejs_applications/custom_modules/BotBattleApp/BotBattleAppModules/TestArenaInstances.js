var paths = require('../../BotBattlePaths');
var path = require('path');

var helpers = require(paths.BotBattleApp_sub_modules.Helpers);
var fileManager = new (require(paths.custom_modules.FileManager));
var logger = require(paths.custom_modules.Logger).newInstance();
module.exports = new (function() {
  var self = this;
  var testArenaInstances = {};
  
  // Start cleanup routine
  (function cleanTest_Arena_tmp(){
    var count = 0;
    var instance;
    var now;
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
            }
          });
        }
      }
      logger.log("TestArenaInstances", "Cleaned :", count, " instances.");
      cleanTest_Arena_tmp();
    }, 3600000); // 1 hour 3600000
  })();
  
  this.getAllIdNotMe = function(myId){
    var notMeInstances = [];
    var instance;
    var now = new Date();
    for(instance in testArenaInstances){
      now = new Date(); //Date.now(); 
      if(now < testArenaInstances[instance].gameExpireDateTime && instance !== myId){
          notMeInstances.push(instance);
      }
    }
    return notMeInstances;
  }
  
  this.getGame = function(id) { return testArenaInstances[id] }
  
  this.getAllInstances  =  function() { return testArenaInstances }
  
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
    return testArenaInstances[id] && ['running'].indexOf(testArenaInstances[id].gameState) !== -1;
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
        'gameState' : null,   // 'running', 'closed', 'exited', 'error'
        'waitingForHumanInput' : false,
        'gameExpireDateTime' : null,
        'gameModule' : gameModule,
        'bot1Name' : null,
        'bot2Name' : null,
        'bot1Directory' : null,
        'bot2Directory' : null,
        'bot1SourcePath' : null,
        'bot2SourcePath' : null,
        'bot1CompiledPath' : null,
        'bot2CompiledPath' : null,
        'gameStateQueue' : [],
        'resetExpirationTime' : function() {
          this.gameExpireDateTime = new Date().addHours(2);
          //this.gameExpireDateTime = new Date().addSeconds(30);
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
  
  // Synchronous - called from /startGame
  // Returns a event code from the set { 'expiredID', 'gameAlreadyRunning', 'gameManagerNotFound', 'success' }
  this.spawnNewGameInstance = function(id) {
    var spawn = require('child_process').spawn;
    if (self.hasInstanceExpired(id)) {
      logger.log("TestArenaInstances", 
          helpers.getLogMessageAboutGame(id, "Invalid ID, cannot spawn game manager"));
      return 'expiredID';
    } 
    else {
      if (testArenaInstances[id].gameProcess && self.isGameManagerRunning(id)) {
        logger.log("TestArenaInstances", 
            helpers.getLogMessageAboutGame(id, "Game Manager already running"));
        return 'gameAlreadyRunning';
      } 
      /*
      else if (testArenaInstances[id].gameStateQueue.length != 0) {
        logger.log("TestArenaInstances", 
            helpers.getLogMessageAboutGame(id, "Game Manager isn't running but the client hasn't received the states yet."));
        return 'gameAlreadyRunning';
      }
      */
      else {
        //TODO : added test for bad database
        if (!testArenaInstances[id].gameModule.directories || !testArenaInstances[id].gameModule.directories.gameManagerCompiled) {
          logger.log("TestArenaInstances", 
              helpers.getLogMessageAboutGame(id, "Path to GameManager classFiles is null, cannot spawn"));
          return 'gameManagerNotFound';
        } 
        else {
          // Update expiration time after each action on this instance.
          testArenaInstances[id].resetExpirationTime();
          var workingGamePath = path.resolve(paths.local_storage.test_arena_tmp, id);

          var jsonArgument = {};
          jsonArgument.numberOfBots = testArenaInstances[id].numberOfBots;
          jsonArgument.bot1 = { 'path' : testArenaInstances[id].bot1CompiledPath };  
          if (jsonArgument.bot1.path.match(/.class$/)) {
            jsonArgument.bot1.language = 'java';
            jsonArgument.bot1.name = testArenaInstances[id].bot1Name.substring(0, testArenaInstances[id].bot1Name.length-5);
            jsonArgument.bot1.directory = testArenaInstances[id].bot1Directory;
          }
          else {
            jsonArgument.bot1.language = 'c++';
            jsonArgument.bot1.name = testArenaInstances[id].bot1CompiledPath.substring(testArenaInstances[id].bot1Directory.length); // have to get compiled name
            jsonArgument.bot1.directory = testArenaInstances[id].bot1Directory;
          }
          if (jsonArgument.numberOfBots === 2) {
            jsonArgument.bot2 = { 'path' : testArenaInstances[id].bot2CompiledPath };  
            if (jsonArgument.bot2.path.match(/.class$/)) {
              jsonArgument.bot2.language = 'java';
              jsonArgument.bot2.name = testArenaInstances[id].bot2Name.substring(0, testArenaInstances[id].bot2Name.length-5);
              jsonArgument.bot2.directory = testArenaInstances[id].bot2Directory;
            }
            else {
              jsonArgument.bot2.language = 'c++';
              jsonArgument.bot2.name = testArenaInstances[id].bot2CompiledPath.substring(testArenaInstances[id].bot2Directory.length);// testArenaInstances[id].bot2Name;
              jsonArgument.bot2.directory = testArenaInstances[id].bot2Directory;
            }
          }

          //testArenaInstances[id].gameProcess = spawn('java', [ "-classpath", classPath, "GameManager", JSON.stringify(testArenaInstances[id])], {cwd : workingGamePath});
          testArenaInstances[id].gameProcess = spawn('java', [ "-classpath", paths.gameManagerJars + ":" + testArenaInstances[id].gameModule.directories.gameManagerCompiled, "ArenaGameManager", 'testarena', JSON.stringify(jsonArgument)], {cwd : workingGamePath});
          testArenaInstances[id].gameState = "running";
          testArenaInstances[id].waitingForHumanInput = false;

          logger.log("TestArenaInstances", 
              helpers.getLogMessageAboutGame(id, "Spawned new GameManager. PID: " + testArenaInstances[id].gameProcess.pid));

          testArenaInstances[id].gameProcess.stdout.on('data', function(data) {
            var array = data.toString().split(/\n/);
            for (var i = 0; i < array.length; i++) {
              if (array[i] === '') {
                array.splice(i, 1);
              }
            }
            if(!self.hasInstanceExpired(id)) {
              testArenaInstances[id].resetExpirationTime();
              
              for (var i = 0; i < array.length; i++) {
                try {
                  var message = JSON.parse(array[i]);
                  if ((message.messageType === 'invalidMove' && message.humanOrBot === 'human') ||
                      (['initialGamestate', 'midGamestate', 'finalGamestate'].indexOf(message.messageType) !== -1 && message.enableHumanInput === true)) {
                    testArenaInstances[id].waitingForHumanInput = true;
                  }
                  
                  testArenaInstances[id].gameStateQueue.push(message);
                  
                  // THis was blowing up the logs.
                  //logger.log("TestArenaInstances", 
                  //    helpers.getLogMessageAboutGame(id, "gameStateQueue: "), JSON.stringify(testArenaInstances[id].gameStateQueue));
                }
                catch(e) {
                  logger.log("TestArenaInstances", 
                      helpers.getLogMessageAboutGame(id, "Invalid JSON sent: "),  array[i], e);
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
              testArenaInstances[id].gameStateQueue = [];
            }
            logger.log("TestArenaInstances", helpers.getLogMessageAboutGame(id, "GameManager closed with code " + code));
          });

          testArenaInstances[id].gameProcess.on('exit', function(code) {
            if (!self.hasInstanceExpired(id)) {
              testArenaInstances[id].gameState = "exited";
              testArenaInstances[id].gameStateQueue = [];
            }
            logger.log("TestArenaInstances", helpers.getLogMessageAboutGame(id, "GameManager exited with code " + code));
          });

          testArenaInstances[id].gameProcess.on('error', function(err) {
            if (!self.hasInstanceExpired(id)) {
              testArenaInstances[id].gameState = "error";
              testArenaInstances[id].gameStateQueue = [];
            }
            logger.log("TestArenaInstances", helpers.getLogMessageAboutGame(id, "GameManager threw the following error "  + err.message));
          });
          return 'success';
        }
      }
    }
  }
  
  // Synchronous
  // Returns a event code from the set { 'expiredID', 'noGameRunning', 'notExpectingHumanInput', 'success' }
  this.sendMoveToGameInstanceById = function(id, move) {
    if (!self.hasInstanceExpired(id)) {
      testArenaInstances[id].resetExpirationTime();
      if(testArenaInstances[id].gameProcess && self.isGameManagerRunning(id) && testArenaInstances[id].waitingForHumanInput === true){
        testArenaInstances[id].waitingForHumanInput = false;
        testArenaInstances[id].gameProcess.stdin.write(move + '\n'); 
        logger.log("TestArenaInstances", helpers.getLogMessageAboutGame(id, "Sent move"), move, "to GameManager." );
        return 'success';
      }
      else if (self.isGameManagerRunning()){
        logger.log("TestArenaInstances", helpers.getLogMessageAboutGame(id, "GameManager isn't expecting human input, can't send move", move));
        return 'notExpectingHumanInput';
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
  
  this.killSpawnedGameForId = function(id, callback) {
    if (!self.hasInstanceExpired(id)) {
      if (testArenaInstances[id].gameProcess && self.isGameManagerRunning(id)) {
        var pid = testArenaInstances[id].gameProcess.pid;
        
        logger.log("TestArenaInstances", "Attempting to kill child: " + pid);
        
        testArenaInstances[id].gameProcess.stdin.end();
        testArenaInstances[id].gameProcess.kill();
        return 'success';
      } 
      else {
        return 'success'; // TODO: maybe handle this differently like noGameRunning 
      }
    } 
    else {
      if (id !== "defaultIdValue") {
        logger.log("TestArenaInstances", "killSpawnedGameForId expired id: " +  id);
        return 'expiredID';
      } 
      else {
        return 'success';
      }
    }
  }
  
  this.deleteTestArenaInstanceAndGameForId = function(id) {
    if (!self.hasInstanceExpired(id)) {
      if (testArenaInstances[id].gameProcess && self.isGameManagerRunning(id)) {
        var pid = testArenaInstances[id].gameProcess.pid;
        
        testArenaInstances[id].gameProcess.on('close', function(code) {
          delete testArenaInstances[id];
          logger.log("TestArenaInstances", helpers.getLogMessageAboutGame(id, "GameManager " +  pid + " exited with code " + code));
          
          fileManager.deleteGameInstanceDirectory(id, function(err) {
            if (err) {
              logger.log("TestArenaInstances", helpers.getLogMessageAboutGame(id, "Failed to delete gameInstanceDirectory " + err.message));
            }
          })
        });

        testArenaInstances[id].gameProcess.stdin.end();
        testArenaInstances[id].gameProcess.kill();
      } else {
        delete testArenaInstances[id];
        fileManager.deleteGameInstanceDirectory(id, function(err) {
          if (err) {
            logger.log("TestArenaInstances", helpers.getLogMessageAboutGame(id, "Failed to delete gameInstanceDirectory " + err.message));
          }
        })
      }
    } else {
      logger.log("BotBattleApp", helpers.getLogMessageAboutGame(id, "The record associated with " + id + 
          " has already expired, no further action needed in deleteTestArenaInstance"));
    }
  }
})(); // Immedietly execute and create the module

