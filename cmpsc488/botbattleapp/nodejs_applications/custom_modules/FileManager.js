/**
* Provides a local file management. This class will implement application specific
* insert, find, update, and delete methods to abstract away the lower level file management from the rest
* of the application logic
* @class FileMangaer
* @constructor 
*/
// BotBattleApp with multer to limit file upload size
module.exports = function FileManager(botBattleDatabase) {
    // Private variables
    var fse = require('fs-extra');
    var self = this;
    
    var database = botBattleDatabase;
    
    var paths = require('./BotBattlePaths');
    
    // Each of these task methods will 
    //  1) Create the folder as specified in the corresponding BotBattlePaths property
    //  2) if failed, emit a 'config_error' event with a "Failed to create [folderpath]" message.
    //      then pass the err object to the callback. Waterfall will halt at this point, and pass the err object 
    //      back to the caller of initLocalStorage.
    //  3) If successful, emit a 'status_update' event with a "Created [folderpath]" message, 
    //      and emit a 'progress_update' event with the updated progress value.
    //      Then pass the eventemitter along to the next task.
    //  The eventemitter is expected to to be the initialCOnfigurationApp which has main listening for these updates
    this.initLocalStorage = function(eventEmitter, callback) {
      var async = require('async');
      async.waterfall(
        [
          function(callback) {
            callback(null, eventEmitter); // Seed the waterfall with the Event Emitter
          },
          createGameModulesFolderTask,
          createPrivateTournamentsFolderTask,
          createPublicTournamentsFolderTask,
          createTestArenaTmpFolderTask,
        ], 
        //final function (this is where we pass stuff to callback)
        // In this case any errors have already been emitted to the client.
        // And all progress updates have already been emitted to the client,
        //    All that's left is to give a friendly completion message and call
        //    the callback.
        function(err){
          if (!err) {
            eventEmitter.emit('status_update', "Initialization of local storage successfull!");
          }
          callback(err);
        }
      ); 
    };
 
    this.createDirectoryForGameModule = function(gameName, callback) {
      var path = require('path');
      var newDirectoryPath = path.resolve(paths.local_storage.game_modules, gameName);
      createFolder(newDirectoryPath, function(err, data) {
        console.log('here');
        callback(err, newDirectoryPath);
      });
    }
    
    this.moveFile = function(srcPath, destPath, callback) {
      console.log(srcPath, destPath);
      fse.move(srcPath, destPath, {'clobber':true}, callback);
    }
    
    
    /* With database stuff to see if its been run yet. THis seems like overkill and doesn't wuite work yet because,
     * fileManager doesnt have a reference to the database. WHich means we can't create the filemanager until the db is
     * created which is fine but takes some rearranging of logic. Will revisit this in time if it becomes more apparent
     * that the FIleManager should be accessing the database at all
     *
    this.initLocalStorage = function(eventEmitter, callback) {
      database.getLocalStorageCreatedFlag(function(err, document) {
        if (err) {
          callback(err);
        }
        else {
          if (document.localStorageCreated === true) {
            console.log("You already initialized local storage");
          }
          else {
            // Initialize local storage
            var async = require('async');
            async.waterfall(
              [
                function(callback) {
                  callback(null, eventEmitter); // Seed the waterfall with the Event Emitter
                },
                createGameModulesFolderTask,
                createPrivateTournamentsFolderTask,
                createPublicTournamentsFolderTask,
                createTestArenaTmpFolderTask,
              ], 
              //final function (this is where we pass stuff to callback)
              // In this case any errors have already been emitted to the client.
              // And all progress updates have already been emitted to the client,
              //    All that's left is to give a friendly completion message and call
              //    the callback.
              function(err){
                if (!err) {
                  eventEmitter.emit('status_update', "Initialization of local storage successfull!");
                  database.setLocalStorageCreatedFlag(true, callback);
                }
                else {
                  callback(err);
                }
              }
            ); 
          }
        }
      });
    };
    */

    var createGameModulesFolderTask = function (eventEmitter, callback) {
      genericCreateFolderTask(paths.local_storage.game_modules, 25, eventEmitter, callback);
    }
    
    var createPrivateTournamentsFolderTask = function (eventEmitter, callback) {
      genericCreateFolderTask(paths.local_storage.private_tournaments, 30, eventEmitter, callback);
    }
    
    var createPublicTournamentsFolderTask = function (eventEmitter, callback) {
      genericCreateFolderTask(paths.local_storage.public_tournaments, 35, eventEmitter, callback);
    }
    
    var createTestArenaTmpFolderTask = function (eventEmitter, callback) {
      genericCreateFolderTask(paths.local_storage.test_arena_tmp, 40, eventEmitter, callback);
    }
    
    var genericCreateFolderTask = function(pathToCreate, progressIfSuccessful, eventEmitter, callback) {
      createFolder(pathToCreate, function(err, resultMessage){
        if (err) {
          eventEmitter.emit('config_error', resultMessage);
          callback(err);
        }
        else {
          eventEmitter.emit('status_update', resultMessage);
          eventEmitter.emit('progress_update', progressIfSuccessful);
          callback(null, eventEmitter);
        }
      });  
    }
    
    
    /**
     * ASYNC: Allows for the creation of a folder at the given path.  createFolder also takes a callback
     * to return the success or fail message.
     * @method createFolder
     * @param {String} folderPath - absolute path for folder to be created
     * @param {Function} callback(err, message)
     * @private
     */
    var createFolder = function(folderPath, callback){
       fse.ensureDir(folderPath, function(err){
          if (err) {
            console.log("Error creating directory: " + err);
            if(callback) {callback(err, "Failed to create" + folderPath);} 
          }
          else{
            console.log("Created " + folderPath);
            if(callback) {callback(null, "Created " + folderPath);}
          }
       });
     };
       
     // when testing this the page kept trying to submit the folder periodically and new sockets kept getting created     
     // this method is async so multiple button pushes are bad.  Can look for file before is it created.  sync is io blocking
          
          
     /**
      * ASYNC: Allows for the creation of a file at the given path.  createFile also takes a callback
      * to return the success or fail message. If the file that is requested to be created is in directories 
      * that do not exist, these directories are created. If the file already exists, it is NOT MODIFIED.
      * @method createFile
      * @param {String} filePath - absolute path for file to be created
      * @param {Function} callback(result) - used to return the result of the file creation 
      * @private
      */
     var createFile = function(filePath, callback){
       fse.createFile(filePath, function(err, result){
           if (err) {
             console.log("Error creating file: " + err);
             if(callback) {callback(err, "Error creating file: " + err);}
           }
           else{
             console.log("Created " + filePath);
             if(callback) {callback(null, "Created " + filePath);}
           }
        });
      };
}
      
     //  read file
     //  read folder
     //  perhaps relate funtions to users instead of just set or get
       
     //  Create Game Modules Directory
     //  Create Private Tournament Directory
     //  Create Public Tournaments Directory
     //  Create Test Arenas Tmp Directory 
    
     //  Setup the Game Module
     //  Create sub directory in Game Modules
     //  Save the Game.java file
     //  Save the rules.pdf file
     

/* It could be that fs.stat is executed before fs.rename. The correct way to do this is to chain the callbacks.

fs.rename('/tmp/hello', '/tmp/world', function (err) {
  if (err) throw err;
  fs.stat('/tmp/world', function (err, stats) {
    if (err) throw err;
    console.log('stats: ' + JSON.stringify(stats));
  });
});
In busy processes, the programmer is strongly encouraged to use the asynchronous versions of these calls. The synchronous versions will block the entire process until they complete--halting all connections. */