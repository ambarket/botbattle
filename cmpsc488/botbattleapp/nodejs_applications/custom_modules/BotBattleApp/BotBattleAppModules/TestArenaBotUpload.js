var paths = require('../../BotBattlePaths');
var path = require('path');
var fileManager = require(paths.custom_modules.FileManager).newInstance();
var logger = require(paths.custom_modules.Logger).newInstance();
var compiler = new (require(paths.custom_modules.BotBattleCompiler));

var helpers = require(paths.BotBattleApp_sub_modules.Helpers);
var testArenaInstances = require(paths.BotBattleApp_sub_modules.TestArenaInstances);

module.exports = {
  'registerRoutes' : function(server, database) { 
    
    var newTestArenaInstanceRoute = function(req, res, next) {
      // if client exists in the testArenaInstance then delete it and the instance object
      // No need to wait for this to complete though
      var oldGameId = req.query.oldId;
      testArenaInstances.deleteTestArenaInstanceAndGameForId(oldGameId, function(err){
        if(err){
          logger.log("TestArenaBotUpload", helpers.getLogMessageAboutGame(oldGameId, "Error cleaning up testArenaInstance"));
        }
        else {
          logger.log("TestArenaBotUpload", helpers.getLogMessageAboutGame(oldGameId, "Successfully cleaned up testArenaInstance"));
        }
      });
      
      // Grab the game module from the DB, and create a new game
      // In a multi-game module system this database call will need to be replaced with one for the
      //    game module selected by the client.
      database.queryForSystemGameModule(function(err, gameModule) {
        if (err) {
          logger.log("TestArenaBotUpload", "There was an error getting the system game module while creating new test arena instance: ", err.message);
          res.json({'error' : "An unexpected error occured while uploading your bots. Please try again or see your administrator"});
        }
        else {
          testArenaInstances.createNewGame(gameModule, function(err, newGameId) {
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
      });
    }
       
    var multerForBotUploads = require('multer')({
      dest: paths.local_storage.test_arena_tmp,
      limits : {
        fields : 6, // Non-file fields (6 radio buttons)
        files: 2, // 2 bot uploads
        fileSize : 50000, //50 KB     
      },
      putSingleFilesInArray: true, // this needs done for future compat.
      changeDest: function(dest, req, res) {
        return path.resolve(dest, req.newGameId);
      },
      onFileUploadStart : function(file, req, res) {
        var logPrefix = helpers.getLogMessageAboutGame(req.newGameId, file.fieldname + " : " + file.originalname);
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
        logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame('Error in multer', err.message));     
        next()
      }, 
      onFileUploadComplete : function(file, req, res) {
        var instance = testArenaInstances.getGame(req.newGameId);
        var logPrefix = helpers.getLogMessageAboutGame(req.newGameId, file.fieldname + " : " + file.originalname);
        if (file.exceededSizeLimit === true) {
          logger.log('TestArenaBotUpload', logPrefix, 'exceeded 50 KB file size limit');
        }
        else {
          logger.log('TestArenaBotUpload', logPrefix, 'uploaded to', file.path);         
          if (instance.numberOfBots) {
            instance.numberOfBots++;
          }
          else {
            instance.numberOfBots = 1;
          }
          if(file.fieldname === "player1_bot_upload"){
            instance.bot1Name = file.originalname;
            instance.bot1SourcePath = file.path;
          }
          if(file.fieldname === "player2_bot_upload"){
            instance.bot2Name = file.originalname;
            instance.bot2SourcePath = file.path;
          }
        }
      }
    });
    
    // processPreloadedBot1Selection and processPreloadedBot2Selection simply fake the moveAndCompileBots function below into
    //  thinking these preloaded bots were actually uploaded.
    var processPreloadedBot1Selection = function(req, res, next) {
      var instance = testArenaInstances.getGame(req.newGameId);
      var gameFolder = path.resolve(paths.local_storage.test_arena_tmp, req.newGameId);
      var preloadedFileName = paths.built_in_games.save_the_island.preloaded_bots[0].fileName;
      var preloadedFilePath = paths.built_in_games.save_the_island.preloaded_bots[0].filePath;
      
      var player1BotSelect = req.body.player1_bot_select;
      
      if (player1BotSelect === "preloaded") {
        if (instance.numberOfBots) {
          instance.numberOfBots++;
        }
        else {
          instance.numberOfBots = 1;
        }

        instance.bot1Name = preloadedFileName;
        instance.bot1SourcePath = path.resolve(gameFolder, "bot1", instance.bot1Name);
        
        fileManager.copyFileOrFolder(preloadedFilePath, instance.bot1SourcePath, function(err){
          if (err) {
            logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 1, "Failed to copy preloaded source file"));
            res.json({"error" : "Failed to process preloaded bot for player 1"});
            removeIncompleteGameAfterFailure(req.newGameId);
          }
          else {
            next();
          }
        });
      }
      else if (player1BotSelect === "shared"){
        var player1SharedID = req.body.player1_shared_bot_id;
        console.log(player1SharedID);
        if (testArenaInstances.hasInstanceExpired(player1SharedID)) {
          logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 1, "Failed to copy preloaded source file"));
          res.json({"error" : "Shared id doesnt exist"});
          removeIncompleteGameAfterFailure(req.newGameId);
          return;
        }
        
        if (instance.numberOfBots) {
          instance.numberOfBots++;
        }
        else {
          instance.numberOfBots = 1;
        }

        var sharedFileName = testArenaInstances.getGame(player1SharedID).bot1Name;
        var sharedFilePath = testArenaInstances.getGame(player1SharedID).bot1SourcePath;
        
        console.log(sharedFileName, sharedFilePath);
        instance.bot1Name = sharedFileName;
        instance.bot1SourcePath = path.resolve(gameFolder, "bot1", instance.bot1Name);
        
        fileManager.copyFileOrFolder(sharedFilePath, instance.bot1SourcePath, function(err){
          if (err) {
            logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 1, "Failed to copy shared source file"));
            res.json({"error" : "Failed to process shared bot for player 1"});
            removeIncompleteGameAfterFailure(req.newGameId);
          }
          else {
            next();
          }
        });
      } else {
        next();
      }
    }
   
    var processPreloadedBot2Selection = function(req, res, next) {
      var instance = testArenaInstances.getGame(req.newGameId);
      var gameFolder = path.resolve(paths.local_storage.test_arena_tmp, req.newGameId);
      var preloadedFileName = paths.built_in_games.save_the_island.preloaded_bots[0].fileName;
      var preloadedFilePath = paths.built_in_games.save_the_island.preloaded_bots[0].filePath;
      
      var player2BotSelect = req.body.player2_bot_select;
      
      if (player2BotSelect === "preloaded") {
        if (instance.numberOfBots) {
          instance.numberOfBots++;
        }
        else {
          instance.numberOfBots = 1;
        }

        instance.bot2Name = preloadedFileName;
        instance.bot2SourcePath = path.resolve(gameFolder, "bot2", instance.bot2Name);
        
        fileManager.copyFileOrFolder(preloadedFilePath, instance.bot2SourcePath, function(err){
          if (err) {
            logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 2, "Failed to copy preloaded source file"));
            res.json({"error" : "Failed to process preloaded bot for player 2"});
            removeIncompleteGameAfterFailure(req.newGameId);
          }
          else {
            if (instance.numberOfBots > 2) {
              logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(req.newGameId, "Error in preloaded bot logic, numberOfBots has exceeded 2"));
              res.json({'error' : "Error with bot selection, numberOfBots has exceeded 2"});
              removeIncompleteGameAfterFailure(req.newGameId);
            }
            else {
              next();
            }
          }
        });
      } else if (player2BotSelect === "shared"){
        var player2SharedID = req.body.player2_shared_bot_id;
        console.log(player2SharedID);
        if (testArenaInstances.hasInstanceExpired(player2SharedID)) {
          logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 2, "Failed to copy preloaded source file"));
          res.json({"error" : "Shared id doesnt exist"});
          removeIncompleteGameAfterFailure(req.newGameId);
          return;
        }
        
        if (instance.numberOfBots) {
          instance.numberOfBots++;
        }
        else {
          instance.numberOfBots = 1;
        }

        var sharedFileName = testArenaInstances.getGame(player2SharedID).bot1Name;
        var sharedFilePath = testArenaInstances.getGame(player2SharedID).bot1SourcePath;
        
        instance.bot2Name = sharedFileName;
        instance.bot2SourcePath = path.resolve(gameFolder, "bot2", instance.bot2Name);
        
        fileManager.copyFileOrFolder(sharedFilePath, instance.bot2SourcePath, function(err){
          if (err) {
            logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 2, "Failed to copy shared source file"));
            res.json({"error" : "Failed to process shared bot for player 2"});
            removeIncompleteGameAfterFailure(req.newGameId);
          }
          else {
            next();
          }
        });
      }else {
        next();
      }
    }
    
    // TODO: In other places we tried to make it so if someone creates a game to use in the test arena it can have more than
    //       two players, but our bot upload only supports two players (bots) max...
    var moveAndCompileBots = function(req, res){
      var instance = testArenaInstances.getGame(req.newGameId);
      
      var humanOrBot = req.body.player2_bot_or_human;
      logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(req.newGameId, "Radio button is " + humanOrBot));
      if(humanOrBot !== "human" && humanOrBot !== "bot"){
        logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(req.newGameId, "Illegal player 2 type radio button value uploaded"));
        res.json({'error' : "Illegal player 2 type radio button value uploaded"});
        removeIncompleteGameAfterFailure(req.newGameId);
      }
      else if(humanOrBot === "human" && instance.numberOfBots !== 1) {
        logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(req.newGameId, "Attempt to run human v bot game with wrong number of bots"));
        res.json({'error' : "Attempt to run human v bot game with wrong number of bots"});
        removeIncompleteGameAfterFailure(req.newGameId);
      }
      else if(humanOrBot === "bot" && instance.numberOfBots !== 2) {
        logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(req.newGameId, "Attempt to run bot v bot game with wrong number of bots"));
        res.json({'error' : "Attempt to run bot v bot game with wrong number of bots"}); 
        removeIncompleteGameAfterFailure(req.newGameId);
      }
      else {
        var gameFolder = path.resolve(paths.local_storage.test_arena_tmp, req.newGameId);
        // Move and compile bot for player 1
        var newBot1Directory = path.resolve(gameFolder, "bot1");
        var newBot1Path = path.resolve(gameFolder, "bot1", instance.bot1Name);
        fileManager.moveFile(instance.bot1SourcePath, newBot1Path, function(err){
          if (err) {
            logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 1, "Failed to move source file"));
            res.json({"error" : "Failed to upload bot for player 1"});
            removeIncompleteGameAfterFailure(req.newGameId);
          }
          else {
            logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 1, "Successfully moved source file"));
            instance.bot1SourcePath = newBot1Path;
            instance.bot1Directory = newBot1Directory;
            compiler.compile(newBot1Path, function(err, compiledFilePath){
              if(err){
                logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 1, "Failed to compile source file"));
                res.json({"error" : "Failed to compile bot for player 1"});
                removeIncompleteGameAfterFailure(req.newGameId);
              }
              else{
                instance.bot1CompiledPath = compiledFilePath;
                logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 1, "Successfully compiled source file"));
                if(humanOrBot !== "bot"){ 
                    logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(req.newGameId, "Successfully processed bot uploads"));
                    res.json(
                        { "status" : "Your bot has been uploaded! Press Start Game to continue.", 
                          'id' : req.newGameId, 
                          'millisecondsUntilExpiration' : testArenaInstances.getMillisecondsBeforeInstanceExpires(req.newGameId)
                    }); 
                }
                else { // Move and compile bot for player 2
                  var newBot2Directory = path.resolve(gameFolder, "bot2");
                  var newBot2Path = path.resolve(gameFolder, "bot2", instance.bot2Name);
                  
                  fileManager.moveFile(instance.bot2SourcePath, newBot2Path, function(err){
                    if (err) {
                      logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 2, "Failed to move source file"));
                      res.json({"error" : "Failed to upload bot for player 2"});
                      removeIncompleteGameAfterFailure(req.newGameId);
                    }
                    else {
                      instance.bot2SourcePath = newBot2Path;
                      instance.bot2Directory = newBot2Directory;
                      logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 2, "Successfully moved source file"));
                      compiler.compile(newBot2Path, function(err, compiledFilePath){
                        if(err){
                          logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 2, "Failed to compile source file"));
                          res.json({"error" : "Failed to compile bot for player 2"});
                          removeIncompleteGameAfterFailure(req.newGameId);
                        }
                        else{
                          instance.bot2CompiledPath = compiledFilePath;
                          logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 2, "Successfully compiled source file"));
                          logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(req.newGameId, "Successfully processed bot uploads"));
                          res.json({ "status" : "Your bots have been uploaded! Press Start Game to continue.", 'id' : req.newGameId }); 
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
    
    function removeIncompleteGameAfterFailure(id) {
      testArenaInstances.deleteTestArenaInstanceAndGameForId(id, function(err){
        if (err) {
          logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(id, err.message));
        }
        else {
          logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(id, "Successfully deleted after failure to upload"));
        }
      });
    }
    
    /**
     * Requested by the "Upload Bot/s" Button on the test arena page, immediately after newTestArenaInstance route is processed
     */
    server.addDynamicRoute('post', '/processBotUploads', 
        [newTestArenaInstanceRoute, multerForBotUploads, processPreloadedBot1Selection, processPreloadedBot2Selection, moveAndCompileBots]);
    
    
    //-----------------------------------------------------Shared Bot Upload----------------------------------------------------------
    var multerForSharedBotUpload = require('multer')({
      dest: paths.local_storage.test_arena_tmp,
      limits : {
        fields : 3, // Non-file fields (6 radio buttons)
        files: 1, // 2 bot uploads
        fileSize : 50000, //50 KB     
      },
      putSingleFilesInArray: true, // this needs done for future compat.
      changeDest: function(dest, req, res) {
        return path.resolve(dest, req.newGameId);
      },
      onFileUploadStart : function(file, req, res) {
        var logPrefix = helpers.getLogMessageAboutGame(req.newGameId, file.fieldname + " : " + file.originalname);
        if (file.fieldname == 'shared_bot_upload') {
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
        logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame('Error in multer', err.message));     
        next()
      }, 
      onFileUploadComplete : function(file, req, res) {
        var instance = testArenaInstances.getGame(req.newGameId);
        var logPrefix = helpers.getLogMessageAboutGame(req.newGameId, file.fieldname + " : " + file.originalname);
        if (file.exceededSizeLimit === true) {
          logger.log('TestArenaBotUpload', logPrefix, 'exceeded 50 KB file size limit');
        }
        else {
          logger.log('TestArenaBotUpload', logPrefix, 'uploaded to', file.path);         
          instance.numberOfBots = 1;
          if(file.fieldname === "shared_bot_upload"){
            instance.bot1Name = file.originalname;
            instance.bot1SourcePath = file.path;
          }
        }
      }
    });
    
    var moveAndCompileSharedBot = function(req, res){
      var instance = testArenaInstances.getGame(req.newGameId);
      
      var prefixedId = req.newGameId;
      if (req.body.shared_bot_id_prefix) {
          prefixedId = testArenaInstances.addPrefixToInstanceId(req.body.shared_bot_id_prefix, req.newGameId);
          if (prefixedId === req.newGameId) {
            res.json(
                { "error" : "Failed to prefix your id. Likely your session expired or the prefixed id is already taken." }); 
            return;
          }
      }
      
      req.newGameId = prefixedId;
      
      
      instance.shared = true;
      if (instance.numberOfBots !== 1) {
        res.json(
            { "error" : "Failed to upload bot, please ensure the bot is a java or c++ file and is no more than 50 KB" }); 
        return;
      }

      
      if (req.body.shared_bot_timeout) {
        var timeout = parseInt(req.body.shared_bot_timeout);
        if (timeout && timeout <= 336 && timeout > 0) {
          instance.gameExpireDateTime = new Date().addHours(timeout);
        }
        else {
          logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 1, "Failed to set timeout. Out of bounds."));
          res.json({"error" : "Failed to set the timeout to " + timeout + ". Out of bounds."});
          removeIncompleteGameAfterFailure(req.newGameId);
          return;
        }
      }
      
      var gameFolder = path.resolve(paths.local_storage.test_arena_tmp, req.newGameId);
      // Move and compile shared bot 
      var newBot1Directory = path.resolve(gameFolder, "bot1");
      var newBot1Path = path.resolve(gameFolder, "bot1", instance.bot1Name);
      fileManager.moveFile(instance.bot1SourcePath, newBot1Path, function(err){
        if (err) {
          logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 1, "Failed to move source file"));
          res.json({"error" : "Failed to share bot"});
          removeIncompleteGameAfterFailure(req.newGameId);
        }
        else {
          instance.bot1SourcePath = newBot1Path;
          instance.bot1Directory = newBot1Directory;
          compiler.compile(newBot1Path, function(err, compiledFilePath){
            if(err){
              logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 1, "Failed to compile source file"));
              res.json({"error" : "Failed to compile shared bot"});
              removeIncompleteGameAfterFailure(req.newGameId);
            }
            else{
              instance.bot1CompiledPath = compiledFilePath;
              logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(req.newGameId, "Successfully shared bot"));
              
              res.json(
                  { "status" : "Your bot has been shared! Other uses can now select your bot by the id displayed on this page.", 
                    'id' : req.newGameId 
                  }); 
            }
          });
        }
      });
    }
    
    /**
     * Requested by the "Share Bot" Button on the test arena page
     */
    server.addDynamicRoute('post', '/processSharedBot', [newTestArenaInstanceRoute, multerForSharedBotUpload, moveAndCompileSharedBot]);
    
  }
}