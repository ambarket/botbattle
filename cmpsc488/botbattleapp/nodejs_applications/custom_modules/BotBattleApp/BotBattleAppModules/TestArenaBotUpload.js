var paths = require('../../BotBattlePaths');
var path = require('path');
var fileManager = require(paths.custom_modules.FileManager).newInstance();
var logger = require(paths.custom_modules.Logger).newInstance('console');
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
      
      // Gram the game module from the DB, and create a new game
      // In a multi-game module system this database call will need to be replaced with one for the
      //    game module selected by the client.
      database.queryForSystemGameModule(function(err, gameModule) {
        if (err) {
          logger.log("TestArenaBotUpload", 
              helpers.getLogMessageAboutGame(newGameId, "There was an error getting the system game module: ", err.message));
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
        fields : 2, // Non-file fields (2 radio buttons)
        files: 2, // 2 bot uploads
        fileSize : 100000, //100 KB     
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
        var logPrefix = helpers.getLogMessageAboutGame(req.newGameId, file.fieldname + " : " + file.originalname);
        if (file.exceededSizeLimit === true) {
          logger.log('TestArenaBotUpload', logPrefix, 'exceeded 100 KB file size limit');
        }
        else {
          logger.log('TestArenaBotUpload', logPrefix, 'uploaded to', file.path);         
          if (testArenaInstances.getGame(req.newGameId).numberOfBots) {
            testArenaInstances.getGame(req.newGameId).numberOfBots++;
          }
          else {
            testArenaInstances.getGame(req.newGameId).numberOfBots = 1;
          }
          if(file.fieldname === "player1_bot_upload"){
            testArenaInstances.getGame(req.newGameId).bot1Name = file.originalname;
            testArenaInstances.getGame(req.newGameId).bot1Path = file.path;
          }
          if(file.fieldname === "player2_bot_upload"){
            testArenaInstances.getGame(req.newGameId).bot2Name = file.originalname;
            testArenaInstances.getGame(req.newGameId).bot2Path = file.path;
          }
        }
      }
    });
    
    var moveAndCompileBots = function(req, res){
      var humanOrBot = req.body.player2_bot_or_human;
      logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(req.newGameId, "Radio button is " + humanOrBot));
      if(humanOrBot !== "human" && humanOrBot !== "bot"){
        logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(req.newGameId, "Illegal radio button value uploaded"));
        res.json({'error' : "Bad form value"});
        removeIncompleteGameAfterFailure(req.newGameId);
      }
      else if(humanOrBot === "human" && testArenaInstances.getGame(req.newGameId).numberOfBots !== 1) {
        logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(req.newGameId, "Attempt to run human v bot game with wrong number of bots"));
        res.json({'error' : "Bad form value"});
        removeIncompleteGameAfterFailure(req.newGameId);
      }
      else if(humanOrBot === "bot" && testArenaInstances.getGame(req.newGameId).numberOfBots !== 2) {
        logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(req.newGameId, "Attempt to run bot v bot game with wrong number of bots"));
        res.json({'error' : "Bad form value"}); 
        removeIncompleteGameAfterFailure(req.newGameId);
      }
      else {
        var gameFolder = path.resolve(paths.local_storage.test_arena_tmp, req.newGameId);
        // Move and compile bot for player 1
        var newBot1Path = path.resolve(gameFolder, "bot1", testArenaInstances.getGame(req.newGameId).bot1Name);
        fileManager.moveFile(testArenaInstances.getGame(req.newGameId).bot1Path, newBot1Path, function(err){
          if (err) {
            logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 1, "Failed to move source file"));
            res.json({"error" : "Failed to upload bot for player 1"});
            removeIncompleteGameAfterFailure(req.newGameId);
          }
          else {
            logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 1, "Successfully moved source file"));
            compiler.compile(newBot1Path, function(err){
              if(err){
                logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 1, "Failed to compile source file"));
                res.json({"error" : "Failed to compile bot for player 1"});
                removeIncompleteGameAfterFailure(req.newGameId);
              }
              else{
                logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 1, "Successfully compiled source file"));
                if(humanOrBot !== "bot"){ 
                    logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(req.newGameId, "Successfully processed bot uploads"));
                    res.json({"status" : "Uploaded!", 'id' : req.newGameId}); 
                }
                else { // Move and compile bot for player 2
                  var newBot2Path = path.resolve(gameFolder, "bot2", testArenaInstances.getGame(req.newGameId).bot2Name);
                  fileManager.moveFile(testArenaInstances.getGame(req.newGameId).bot2Path, newBot2Path, function(err){
                    if (err) {
                      logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 2, "Failed to move source file"));
                      res.json({"error" : "Failed to upload bot for player 2"});
                      removeIncompleteGameAfterFailure(req.newGameId);
                    }
                    else {
                      logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 2, "Successfully moved source file"));
                      compiler.compile(newBot2Path, function(err){
                        if(err){
                          logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 2, "Failed to compile source file"));
                          res.json({"error" : "Failed to compile bot for player 2"});
                          removeIncompleteGameAfterFailure(req.newGameId);
                        }
                        else{
                          logger.log('TestArenaBotUpload', helpers.getLogMessageAboutPlayer(req.newGameId, 2, "Successfully compiled source file"));
                          logger.log('TestArenaBotUpload', helpers.getLogMessageAboutGame(req.newGameId, "Successfully processed bot uploads"));
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
    server.addDynamicRoute('post', '/processBotUploads', [newTestArenaInstanceRoute, multerForBotUploads, moveAndCompileBots]);
  }
}