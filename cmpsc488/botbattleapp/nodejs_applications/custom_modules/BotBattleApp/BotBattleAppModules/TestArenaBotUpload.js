var paths = require('../../BotBattlePaths');
var path = require('path');
var fileManager = require(paths.custom_modules.FileManager).newInstance();
var logger = require(paths.custom_modules.Logger).newInstance('console');
var compiler = new (require(paths.custom_modules.BotBattleCompiler));

var BotBattleAppHelpers = require(paths.BotBattleApp_sub_modules.Helpers);

module.exports = {
  'registerRoutes' : function(server, database, testArenaInstances) { 
    
    var getLogMessageAboutGame = function(gameId, message) {
      return gameId + " - " + message;
    }
    
    var getLogMessageAboutPlayer = function(gameId, playerNum, message) {
      return getLogMessageAboutGame(gameId, "Player " + playerNum + " : " + message);
    }

    var createNewTestArenaInstanceForClient = function(oldGameId, callback) {
      // if client exists in the testArenaInstance then delete it and the instance object
      // No need to wait for this to complete though
      BotBattleAppHelpers.cleanUpTestArenaInstance(testArenaInstances, oldGameId, function(err){
        if(err){
          logger.log("TestArenaBotUpload", getLogMessageAboutGame(oldGameId, "Error cleaning up testArenaInstance"));
        }
        else {
          logger.log("TestArenaBotUpload", getLogMessageAboutGame(oldGameId, "Successfully cleaned up testArenaInstance"));
        }
      });
      
      // Get SystemGameModule, create new gameId, create new testArenaInstance, 
      // create file structure for the instance, and finally pass the newGameId to the callback.
      database.queryForSystemGameModule(function(err, gameModule) {
        var newGameId = require('shortid').generate();
        if (err) {
          logger.log("TestArenaBotUpload", 
              getLogMessageAboutGame(newGameId, "There was an error getting the system game module: ", err.message));
        }
        else {
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
                  getLogMessageAboutGame(newGameId, "There was an error creating directory for new instance: ", err.message));
            }
            else{
              fileManager.createBotFolderInGameInstanceDirectory(newGameId, "bot1", function(err, result){
                if(err){
                  logger.log("TestArenaBotUpload", 
                      getLogMessageAboutGame(newGameId, "There was an error creating directory for bot1 ", err.message));
                }
                else{
                  fileManager.createBotFolderInGameInstanceDirectory(newGameId, "bot2", function(err, result){
                    if(err){
                      logger.log("TestArenaBotUpload", 
                          getLogMessageAboutGame(newGameId, "There was an error creating directory for bot2 "+ err.message));
                    }
                    logger.log("TestArenaBotUpload", 
                        getLogMessageAboutGame(newGameId, "Successfully created new testArenaInstance"));
                    callback(null, newGameId);
                  });
                }
              });
            }
          }); 
        }
      });
    }
    
    
    var newTestArenaInstanceRoute = function(req, res, next) {
      createNewTestArenaInstanceForClient(req.query.oldId, function(err, newGameId) {
        if (err) {
          res.status(500).json({'error' : "An unexpected error occured while uploading your bots. Please try again or see your administrator"});
        }
        else {
          // Set the game id in request object so multer and moveAndCompile can access it.
          req.newGameId = newGameId 
          next();
        }
      });
    }
       
    var multerForBotUploads = require('multer')({
      dest: paths.local_storage.test_arena_tmp,
      limits : {
        fields : 2, // Non-file fields (2 radio buttons)
        files: 2, // 2 bot uploads
        fileSize : 100000, //100 KB     
      },
      putSingleFilesInArray: true, // this needs done for future compat.
      changeDest: function(dest, req, res) {
        return path.resolve(dest, req.newGameId);
      },
      onFileUploadStart : function(file, req, res) {
        var logPrefix = getLogMessageAboutGame(req.newGameId, file.fieldname + " : " + file.originalname);
        if (file.fieldname == 'player1_bot_upload' || file.fieldname == 'player2_bot_upload') {
          if (file.extension.match(/cxx|cpp|java/)) {
            logger.log('TestArenaBotUpload', logPrefix, 'is a .java/.cpp/.cxx file, uploading will continue');
            return true; 
          } else {
            logger.log('TestArenaBotUpload', logPrefix, 'is NOT a .java/.cpp/.cxx file');
          }
        }
        else {
          logger.log('TestArenaBotUpload', logPrefix, 'is not a supported fieldname');
        }
        logger.log('TestArenaBotUpload', logPrefix, 'uploading has been cancelled');
        return false;
      },
      onFileSizeLimit : function(file) {
        file.exceededSizeLimit = true;
        fileManager.removeFileOrFolder(file.path) // delete the partially written file
      },
      onFilesLimit : function() {
        logger.log('TestArenaBotUpload', 'Form submission exceeded number of file fields limit');
      },
      onFieldsLimit : function() {
        logger.log('TestArenaBotUpload', 'Form submission exceeded number of non-file fields limit');
      },
      onError : function(err, next) {
        logger.log('TestArenaBotUpload', getLogMessageAboutGame('Error in multer', err.message));     
        next()
      }, 
      onFileUploadComplete : function(file, req, res) {
        var logPrefix = getLogMessageAboutGame(req.newGameId, file.fieldname + " : " + file.originalname);
        if (file.exceededSizeLimit === true) {
          logger.log('TestArenaBotUpload', logPrefix, 'exceeded 100 KB file size limit');
        }
        else {
          logger.log('TestArenaBotUpload', logPrefix, 'uploaded to', file.path);         
          if (testArenaInstances[req.newGameId].numberOfBots) {
            testArenaInstances[req.newGameId].numberOfBots++;
          }
          else {
            testArenaInstances[req.newGameId].numberOfBots = 1;
          }
          if(file.fieldname === "player1_bot_upload"){
            testArenaInstances[req.newGameId].bot1Name = file.originalname;
            testArenaInstances[req.newGameId].bot1Path = file.path;
          }
          if(file.fieldname === "player2_bot_upload"){
            testArenaInstances[req.newGameId].bot2Name = file.originalname;
            testArenaInstances[req.newGameId].bot2Path = file.path;
          }
        }
      }
    });
    
    var moveAndCompileBots = function(req, res){
      var tabId = req.newGameId;
      var humanOrBot = req.body.player2_bot_or_human;
      logger.log('TestArenaBotUpload', getLogMessageAboutGame(tabId, "Radio button is " + humanOrBot));
      if(humanOrBot !== "human" && humanOrBot !== "bot"){
        logger.log('TestArenaBotUpload', getLogMessageAboutGame(tabId, "Illegal radio button value uploaded"));
        res.json({'error' : "Bad form value"});
      }
      else if(humanOrBot === "human" && testArenaInstances[req.newGameId].numberOfBots !== 1) {
        logger.log('TestArenaBotUpload', getLogMessageAboutGame(tabId, "Attempt to run human v bot game with wrong number of bots"));
        res.json({'error' : "Bad form value"});
      }
      else if(humanOrBot === "bot" && testArenaInstances[req.newGameId].numberOfBots !== 2) {
        logger.log('TestArenaBotUpload', getLogMessageAboutGame(tabId, "Attempt to run bot v bot game with wrong number of bots"));
        res.json({'error' : "Bad form value"}); 
      }
      else {
        var gameFolder = path.resolve(paths.local_storage.test_arena_tmp, tabId);
        // Move and compile bot for player 1
        var newBot1Path = path.resolve(gameFolder, "bot1", testArenaInstances[req.newGameId].bot1Name);
        fileManager.moveFile(testArenaInstances[req.newGameId].bot1Path, newBot1Path, function(err){
          if (err) {
            logger.log('TestArenaBotUpload', getLogMessageAboutPlayer(tabId, 1, "Failed to move source file"));
            res.json({"error" : "Failed to upload bot for player 1"});
          }
          else {
            logger.log('TestArenaBotUpload', getLogMessageAboutPlayer(tabId, 1, "Successfully moved source file"));
            compiler.compile(newBot1Path, function(err){
              if(err){
                logger.log('TestArenaBotUpload', getLogMessageAboutPlayer(tabId, 1, "Failed to compile source file"));
                res.json({"error" : "Failed to compile bot for player 1"});
              }
              else{
                logger.log('TestArenaBotUpload', getLogMessageAboutPlayer(tabId, 1, "Successfully compiled source file"));
                if(humanOrBot !== "bot"){ 
                    logger.log('TestArenaBotUpload', getLogMessageAboutGame(tabId, "Successfully processed bot uploads"));
                    res.json({"status" : "Uploaded!", 'id' : req.newGameId}); 
                }
                else { // Move and compile bot for player 2
                  var newBot2Path = path.resolve(gameFolder, "bot2", testArenaInstances[req.newGameId].bot2Name);
                  fileManager.moveFile(testArenaInstances[req.newGameId].bot2Path, newBot2Path, function(err){
                    if (err) {
                      logger.log('TestArenaBotUpload', getLogMessageAboutPlayer(tabId, 2, "Failed to move source file"));
                      res.json({"error" : "Failed to upload bot for player 2"});
                    }
                    else {
                      logger.log('TestArenaBotUpload', getLogMessageAboutPlayer(tabId, 2, "Successfully moved source file"));
                      compiler.compile(newBot2Path, function(err){
                        if(err){
                          logger.log('TestArenaBotUpload', getLogMessageAboutPlayer(tabId, 2, "Failed to compile source file"));
                          res.json({"error" : "Failed to compile bot for player 2"});
                        }
                        else{
                          logger.log('TestArenaBotUpload', getLogMessageAboutPlayer(tabId, 1, "Successfully compiled source file"));
                          logger.log('TestArenaBotUpload', getLogMessageAboutGame(tabId, "Successfully processed bot uploads"));
                          res.json({"status" : "Uploaded!", 'id' : req.newGameId}); 
                        }          
                      });
                    }
                  });
                }
              }
            });
          }
        });
      }
    }
    
    /**
     * Requested by the "Upload Bot/s" Button on the test arena page, immediately after newTestArenaInstance route is processed
     */
    server.addDynamicRoute('post', '/processBotUploads', [newTestArenaInstanceRoute, multerForBotUploads, moveAndCompileBots]);
  }
}