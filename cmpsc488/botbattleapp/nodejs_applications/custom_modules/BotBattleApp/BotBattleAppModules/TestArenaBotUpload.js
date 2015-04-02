var paths = require('../../BotBattlePaths');
var path = require('path');
var fileManager = require(paths.custom_modules.FileManager).newInstance();
var logger = require(paths.custom_modules.Logger).newInstance('console');
var compiler = new (require(paths.custom_modules.BotBattleCompiler));

var BotBattleAppHelpers = require(paths.BotBattleApp_sub_modules.Helpers);

module.exports = {
  'registerRoutes' : function(server, database, testArenaInstances) { 
    
    var getLogMessageAboutGame = function(gameId, message) {
      return "Game " + gameId + " - " + message;
    }
    
    var getLogMessageAboutPlayer = function(gameId, playerNum, message) {
      return getLogMessageAboutGame(gameId, "Player " + playerNum + " : " + message);
    }

    // TODO: I'm not sure what this comment means : all oter functions that require session need to be changed because the structure is now different
    //TODO: This is called by the uploadBot button before the call to the actual upload route.
    //    Name this better to indicate that.
    server.addDynamicRoute('get', '/newTestArenaInstance', function(req, res) {
      console.log("here");
      // TODO: clean this up to samller concentrated functions.
      /*
       * 2. create object in testArenaInstances as needed
       * 3. create files like before.
       * 4. create game instance?
       * 5. return the new id
       */
        var id = req.query.id;
        // if client exists in the testArenaInstance then delete it and the instance object
        BotBattleAppHelpers.cleanUpTestArenaInstance(testArenaInstances, id, function(err){
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
              res.status(500).json({"error":err});
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
    
    var multerForBotUploads = require('multer')({
      dest: paths.local_storage.test_arena_tmp,
      limits : {
        fields : 2, // Non-file fields (2 radio buttons)
        files: 2, // 2 bot uploads
        fileSize : 100000, //100 KB     
      },
      putSingleFilesInArray: true, // this needs done for future compat.
      changeDest: function(dest, req, res) {
        return path.resolve(dest, req.body.tabId);
      },
      onFileUploadStart : function(file, req, res) {
        var logPrefix = getLogMessageAboutGame(req.body.tabId, file.fieldname + " : " + file.originalname);
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
        var logPrefix = getLogMessageAboutGame(req.body.tabId, file.fieldname + " : " + file.originalname);
        if (file.exceededSizeLimit === true) {
          logger.log('TestArenaBotUpload', logPrefix, 'exceeded 100 KB file size limit');
        }
        else {
          logger.log('TestArenaBotUpload', logPrefix, 'uploaded to', file.path);         
          if (testArenaInstances[req.body.tabId].numberOfBots) {
            testArenaInstances[req.body.tabId].numberOfBots++;
          }
          else {
            testArenaInstances[req.body.tabId].numberOfBots = 1;
          }
          if(file.fieldname === "player1_bot_upload"){
            testArenaInstances[req.body.tabId].bot1Name = file.originalname;
            testArenaInstances[req.body.tabId].bot1Path = file.path;
          }
          if(file.fieldname === "player2_bot_upload"){
            testArenaInstances[req.body.tabId].bot2Name = file.originalname;
            testArenaInstances[req.body.tabId].bot2Path = file.path;
          }
        }
      }
    });
    
    var moveAndCompileBots = function(req, res){
      var tabId = req.body.tabId;
      var humanOrBot = req.body.player2_bot_or_human;
      logger.log('TestArenaBotUpload', getLogMessageAboutGame(tabId, "Radio button is " + humanOrBot));
      if(humanOrBot !== "human" && humanOrBot !== "bot"){
        logger.log('TestArenaBotUpload', getLogMessageAboutGame(tabId, "Illegal radio button value uploaded"));
        res.json({'error' : "Bad form value"});
      }
      else if(humanOrBot === "human" && testArenaInstances[req.body.tabId].numberOfBots !== 1) {
        logger.log('TestArenaBotUpload', getLogMessageAboutGame(tabId, "Attempt to run human v bot game with wrong number of bots"));
        res.json({'error' : "Bad form value"});
      }
      else if(humanOrBot === "bot" && testArenaInstances[req.body.tabId].numberOfBots !== 2) {
        logger.log('TestArenaBotUpload', getLogMessageAboutGame(tabId, "Attempt to run bot v bot game with wrong number of bots"));
        res.json({'error' : "Bad form value"}); 
      }
      else {
        var gameFolder = path.resolve(paths.local_storage.test_arena_tmp, tabId);
        // Move and compile bot for player 1
        var newBot1Path = path.resolve(gameFolder, "bot1", testArenaInstances[req.body.tabId].bot1Name);
        fileManager.moveFile(testArenaInstances[req.body.tabId].bot1Path, newBot1Path, function(err){
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
                    logger.log('TestArenaBotUpload', "Successfully processed bot uploads for game " + tabId);
                    res.json({"status" : "Uploaded!"});
                }
                else { // Move and compile bot for player 2
                  var newBot2Path = path.resolve(gameFolder, "bot2", testArenaInstances[req.body.tabId].bot2Name);
                  fileManager.moveFile(testArenaInstances[req.body.tabId].bot2Path, newBot2Path, function(err){
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
                          logger.log('TestArenaBotUpload', "Successfully processed bot uploads for game " + tabId);
                          res.json({"status" : "Uploaded!"}); 
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
    server.addDynamicRoute('post', '/processBotUploads', [multerForBotUploads, moveAndCompileBots]);
  }
}