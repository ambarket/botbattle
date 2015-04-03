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
    server.addDynamicRoute('post', '/uploadBot',
              multer({
                dest: './local_storage/test_arena_tmp/',
                limits : {
                          fieldNameSize : 100,
                          files: 2,
                },
                putSingleFilesInArray: true, // this needs done for future compat.
                changeDest: function(dest, req, res) {
                              var id = req.body.tabId;
                              var path = require('path');
                              var directoryPath = path.resolve(paths.local_storage.test_arena_tmp, id);
                              return directoryPath;                           
                },
                onFileUploadStart : function(file, req, res) {
                                      console.log(file.fieldname + ' is starting ...');
                                      var javaRE = /.*\.java/;
                                      var cppRE = /.*\.cpp/;
                                      var cxxRE = /.*\.cxx/;
                                      if (file.fieldname == 'player1_bot_upload' || file.fieldname == 'player2_bot_upload') {
                                        if (file.name.match(javaRE) || file.name.match(cppRE) || file.name.match(cxxRE)) {
                                          console.log(file.fieldname + ':' + file.name
                                              + ' is a .java/.cpp/.cxx file, uploading will continue');
                                        } else {
                                          console.log(file.fieldname
                                                  + ':'
                                                  + file.name
                                                  + ' is a NOT .java/.cpp/.cxx file, this file will not be uploaded');
                                          // Returning false cancels the upload.
                                          res.json({"error" : "Illegal file type"});
                                          return false;
                                        }
                                      }
                },
                onFileUploadComplete : function(file, req, res) {
                                        console.log(file.fieldname + ' uploaded to  ' + file.path);                                      
                                        if(file.fieldname === "player1_bot_upload"){
                                          testArenaInstances[req.body.tabId].bot1Name = file.originalname;
                                          testArenaInstances[req.body.tabId].bot1Path = file.path;
                                        }
                                        if(file.fieldname === "player2_bot_upload"){
                                          testArenaInstances[req.body.tabId].bot2Name = file.originalname;
                                          testArenaInstances[req.body.tabId].bot2Path = file.path;
                                        }                                                             
                },
                onError : function(error, next) {
                            console.log(error)
                            next(error)
                },
                onFileSizeLimit : function(file) {
                                    console.log('Failed: ', file.originalname)
                                    fs.unlink(file.path) // delete the partially written file
                },
                onFilesLimit : function() {
                                 console.log('Crossed file limit!')
                },
              }));
  
    /**
     * Requested by the "Upload Bot/s" Button on the test arena page
     */
    server.addDynamicRoute('post', '/uploadBot',function(req, res){
      var humanOrBot = req.body.player1_bot_or_human;
      console.log("Radio button is " + humanOrBot);
      var compiler = new (require(paths.custom_modules.BotBattleCompiler));
      
      if(humanOrBot === "human" || humanOrBot === "bot"){
        var newBot2Path = path.resolve(paths.local_storage.test_arena_tmp, req.body.tabId, "bot2", testArenaInstances[req.body.tabId].bot2Name);
        fileManager.moveFile(testArenaInstances[req.body.tabId].bot2Path, newBot2Path, function(err){
          if (err) {
            console.log("Failed to move bot 2 for tab " + req.body.tabId);
            res.json({"error" : "Bot " + 2 + " failed to upload."});
          }
          else {
            compiler.compile(newBot2Path, function(err){
              if(err){
                console.log("Failed to compile bot 2 for tab " + req.body.tabId);
                res.json({"error" : "Bot " + 2 + " failed to compile."});
              }
              else{
                console.log("Bot 2 moved and compiled success");
                
                if(humanOrBot === "bot"){ 
                  var newBot1Path = path.resolve(paths.local_storage.test_arena_tmp, req.body.tabId, "bot1", testArenaInstances[req.body.tabId].bot1Name);
                  fileManager.moveFile(testArenaInstances[req.body.tabId].bot1Path, newBot1Path, function(err){
                    if (err) {
                      console.log("Failed to move");
                      res.json({"error" : "Bot " + 2 + " failed to upload."});
                    }
                    else {
                      compiler.compile(testArenaInstances[req.body.tabId].bot1Path, function(err){
                        if(err){
                          console.log("Failed to compile bot 1 for tab " + req.body.tabId);
                          res.json({"error" : "Bot " + 1 + " failed to compile."});
                        }
                        else{
                          console.log("Upload success");
                          res.json({"status" : "Uploaded!"});      
                        }          
                      });
                    }
                  });
                }
                else {
                  //it was just human
                  res.json({"status" : "Uploaded!"});
                }
              }
            });
          }
        });
      }
      else {
        console.log("illegal radio button value uploaded");
        res.json({'error' : "Bad form value"});
      }
    });
  }
}
    
