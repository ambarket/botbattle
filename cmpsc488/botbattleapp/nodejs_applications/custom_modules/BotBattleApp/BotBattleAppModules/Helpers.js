var paths = require('../../BotBattlePaths');
var path = require('path');
var fileManager = require(paths.custom_modules.FileManager).newInstance();
var logger = require(paths.custom_modules.Logger).newInstance('console');
var compiler = new (require(paths.custom_modules.BotBattleCompiler));

var BotBattleAppHelpers = require(paths.BotBattleApp_sub_modules.Helpers);


module.exports = {
    /**
     * This is weird but its the only way I could find to unset the message while still sending it.
     * @param session
     * @returns {object} deep copy of session.locals
     */
    copyLocalsAndDeleteMessage : function(session) {
      var retval = {}
      for (var key in session.locals) {
        retval[key] = session.locals[key];
      }
      session.locals.message = null;
      session.locals.id = null;
      return retval;
    },

    cleanUpTestArenaInstance : function(testArenaInstances, id, callback){
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
}