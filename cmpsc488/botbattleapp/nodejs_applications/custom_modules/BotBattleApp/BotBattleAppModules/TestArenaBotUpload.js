var paths = require('../../BotBattlePaths');
var path = require('path');
var fileManager = require(paths.custom_modules.FileManager).newInstance();
var logger = require(paths.custom_modules.Logger).newInstance('console');

module.exports = {
  'registerRoutes' : function(server, testArenaInstances) {
    /**
     * Requested by the "Upload Bot/s" Button on the test arena page
     */
    // TODO:  Test with many uploading at the same time.
    var multer = require('multer');
    var multerForTestArenaBotUpload = 
      multer({
        dest: './local_storage/test_arena_tmp/unprocessedBotUploads',
        limits : {
                  fieldNameSize : 100,
                  files: 2,
        },
        putSingleFilesInArray: true, // this needs done for future compat.
        onFileUploadStart : function(file, req, res) {
                              console.log(file.fieldname + ' is starting ...');
                              var javaRE = /.*\.java/;
                              var cppRE = /.*\.cpp/;
                              var cxxRE = /.*\.cxx/;
                              if (file.fieldname == 'player1_bot_upload' || file.fieldname == 'player2_bot_upload') {
                                if (file.originalname.match(javaRE) || file.originalname.match(cppRE) || file.originalname.match(cxxRE)) {
                                  console.log(file.fieldname + 
                                      '- tmp_name: ' + file.name + 
                                      '- originalname: ' + file.originalname +
                                      ' is a .java/.cpp/.cxx file, uploading will continue');
                                } else {
                                  console.log(file.fieldname + 
                                      '- tmp_name: ' + file.name + 
                                      '- originalname: ' + file.originalname +
                                      ' is a NOT .java/.cpp/.cxx file, this file will not be uploaded');
                                  // Returning false cancels the upload.
                                  res.json({"error" : "Illegal file type"});
                                  return false;
                                }
                              }
        },
        onError : function(error, next) {
                    console.log(error)
                    next(error)
        },
        onFileSizeLimit : function(file) {
                            console.log('Failed: ', file.originalname)
                            // TODO: Pretty sure that's not where the file is? Do we need this?
                            fs.unlink('./' + file.path) // delete the partially written file
        },
        onFilesLimit : function() {
                         console.log('Crossed file limit!')
        },
      });
    
    /**
     * Requested by the "Upload Bot/s" Button on the test arena page after multer runs
     */
    var processBotUpload = function (req, res) {
      console.log(req.files);
      var humanOrBot = req.body.player1_bot_or_human;
      console.log("Radio button is " + humanOrBot + JSON.stringify(req.files.player2_bot_upload[0]));
      // TODO: It threw me off that human(one bot) has botNum of 2 and bot v bot has botNum of 1 but
      //  makes sense for the players. Would be nice to reconcile this weirdness, perhaps make the human 
      //  player be on the right of the board(player 2) like the original game was.
      
      // This if stmt got ugly i thought it was just req.files[0], but I guess since each field can have multiple
      //      files associated with its req.files['theHTMLFieldName][indexOfFileInThatField].
      if (req.files.player2_bot_upload && req.files.player2_bot_upload[0] && (humanOrBot === 'human' || humanOrBot === 'bot')) {
        var player2SourceFile = req.files.player2_bot_upload[0];
        var botNum = 2;
        moveBotToTabFolderAndCompileTheBotHelper(req.body.tabId, botNum, player2SourceFile, function(err) {
          if (err) {
            logger.log('BotBattleApp', "Error in moveBotsToCorrectLocation:", err.message); 
            res.json({"error" : "Failed to move bot to tab folder and compile the bot"});
          }
          // There's another bot to compile and move.
          else if (req.files.player1_bot_upload && req.files.player1_bot_upload[0] && humanOrBot === "bot") {
            var player1SourceFile = req.files.player1_bot_upload[0];
            botNum = 1;
            moveBotToTabFolderAndCompileTheBotHelper(req.body.tabId, botNum, player1SourceFile, function(err) {
              if (err) {
                logger.log('BotBattleApp', "Error in moveBotsToCorrectLocation:", err.message); 
                res.json({"error" : "Failed to move bot to tab folder and compile the bot"});
              }
              else {
                // Both bots were moved and compiled successfully.
                logger.log('BotBattleApp', 'Successfully moved and compiled 2 bots for', req.body.tabId); 
                res.json({'status' : 'Successfully moved and compiled both bots'});
              }
            });
          }
          // There was only one bot and it was moved and compiled successfully.
          else {
            logger.log('BotBattleApp', 'Successfully moved and compiled 1 bot for', req.body.tabId); 
            res.json({'status' : 'Successfully moved and compiled both bots'});
          }
        });
      }
      // The radio button selection did not match the number of bots received.
      else {
        logger.log('BotBattleApp', "Illegal radio button value uploaded, or radio button did not match number of bots received");
        res.json({'error' : "Illegal radio button value uploaded, or radio button did not match number of bots received"});
      }
    };
   
    // 1) Calls moveBotToTabFolderAndCompileTheBot, 
    // 2a) If successful it then sets testArenaInstances[tabId].bot[botNum]path = compiledBotPath, then passes a null err to the callback.
    // 2b) Otherwise ensures the file at file.path has been moved or it deletes it, then passes any errors to the callback.
    function moveBotToTabFolderAndCompileTheBotHelper(tabId, botNum, file, callback) {
      moveBotToTabFolderAndCompileTheBot(tabId, botNum, file, function(moveAndCompileErr, compiledBotPath) {
        if (moveAndCompileErr) {
          // Attempt to delete req.files[0].path now since it may not have been moved and cleanup wont get it otherwise
          fileManager.removeFileOrFolder(file.path, function(removalErr) {
            var removalMessage = null;
            if (removalErr) {
              removalMessage = "\n\tFailed to delete the file at " +  file.path +  
                  " after failure to move and compile the bot, perhaps it was moved but failed to compile" +
                  " if so no worries, it will be deleted up by the cleanup routine";
            }
            else {
              removalMessage = "\n\tSuccessfully deleted the file at " + file.path +  
                " after failure to move and compile the bot";
            }
            callback(new Error("Error in moveBotToTabFolderAndCompileTheBotHelper:" + moveAndCompileErr.message + removalMessage));
          });
        }
        else {
          if (compiledBotPath) { 
            testArenaInstances[tabId]['bot' + botNum + 'Path'] = compiledBotPath;
            callback(null);
          }
          else {
            callback(new Error("moveBotToTabFolderAndCompileTheBotHelper: No error during moving, yet botPath was undefined, cannot compile"));
          }
        }
      });
    }
    
    // 1) Will move the specified file into local_storage/test_arena_tmp/tabId/bot[botNum]/file.originalname
    // 2) Then compile that bot
    // 3) Finally call the callback passing err and the compiledBotPath
    function moveBotToTabFolderAndCompileTheBot(tabId, botNum, file, callback) {
      var path = require('path');
      // Try to ensure all arguments are defined
      if (file && file.path && tabId && tabId != 'defaultIdValue' && botNum) {
        var movedBotPath = path.resolve(paths.local_storage.test_arena_tmp, tabId, 'bot' + botNum, file.originalname);
        fileManager.moveFile(file.path, movedBotPath, function(err) {
          if (err) {
            callback(err);
          }
          else {
            console.log("Successfully moved " + file.path + " to " + movedBotPath);
            var compiler = new (require(paths.custom_modules.BotBattleCompiler));
            // BotBattleCompiler will pass along the path to the compiled bot to the callback.
            // And will generate meaningful error messages otherwise.
            // No need for additional handling here.
            compiler.compile(movedBotPath, callback);
          }
        });
      }
      else {
        callback(new Error("Invalid argument to moveBotToTabFolder"));
      }
    }
    
    // Finally we can register the route. 
    server.addDynamicRoute('post', '/uploadBot', [multerForTestArenaBotUpload, processBotUpload]);
  }
}
