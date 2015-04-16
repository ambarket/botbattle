/**
* Provides a local file management. This class will implement application specific
* insert, find, update, and delete methods to abstract away the lower level file management from the rest
* of the application logic
* @class FileMangaer
* @constructor 
*/

function FileManager(botBattleDatabase) {
    // Private variables
    var fse = require('fs-extra');
    var fs = require('fs-extra');
    var self = this;

    
    //  Only allow initFreshLocalStorage to be run once.
    //  Still need to make FileManager a singleton for this to really work
    var localStorageInitialized = false;
    var database = botBattleDatabase;
    var paths = require('./BotBattlePaths');
    var logger = require(paths.custom_modules.Logger).newInstance();
    
    /**
     * Upon successful completion, all paths in paths.local_storage will exist. Note this will not
     * delete any files in those folders if they already exist, for that, use deleteLocalStorage
     * @method ensureLocalStorage
     * @param {Function} callback used by async.waterfall(...). 
     * @private
     */
    this.ensureLocalStorage = function(callback) {
      if (!localStorageInitialized) {
        var async = require('async');
        var localStorageArray = Object.keys(paths.local_storage).map(function (key) {return paths.local_storage[key]});
        async.each(localStorageArray, createFolder, function(err) {
          if (err) {
            err.message += " Failed to create local storage folders";
            callback(err);
          }
          else {
            logger.log("Local storage folders successfully created");
            localStorageInitialized = true;
            callback(null);
          }
        });
      }
      else {
        callback(new Error("Local storage has already been initialized!"));
      }
    }
    
    /**
     * Completely delete all directories in the paths.local_storage object
     */
    this.deleteLocalStorage = function(callback) {
      var async = require('async');
      var localStorageArray = Object.keys(paths.local_storage).map(function (key) {return paths.local_storage[key]});
      async.each(localStorageArray, self.removeFileOrFolder, function(err) {
        if (err) {
          err.message += " Failed to clear local storage folders";
          callback(err);
        }
        else {
          logger.log("Local storage successfully cleared");
          localStorageInitialized = false;
          callback(null);
        }
      });
    }
    
    /**
     * Delete everything in paths.init_config_tmp but leave the folder. 
     * Can't simply delete the folder because multer crashes if you do.
     */
    this.clearInitConfigTmp= function(callback) {
      var path = require('path');
      fse.readdir(paths.init_config_tmp, function(err, files) {
        for (var i = 0; i < files.length; i++) {
          files[i] = path.resolve(paths.init_config_tmp, files[i])              
        }
        var async = require('async');
        async.each(files, self.removeFileOrFolder, callback);
      })
    }
    
    this.deleteInitConfigTmp = function(callback) {
      self.removeFileOrFolder(paths.init_config_tmp, callback);
    }
    
    this.deleteTestArenaTmp = function(callback) {
      self.removeFileOrFolder(paths.local_storage.test_arena_tmp, callback);
    }
    
    
    this.createDirectoryForGameModule = function(gameName, callback) {
      var async = require('async');
      var path = require('path');
      var directories = {
          root : path.join(paths.local_storage.game_modules, gameName),
          gameManagerCompiled : path.join(paths.local_storage.game_modules, gameName, "GameManagerCompiled"),
          rules : path.join(paths.local_storage.game_modules, gameName, "rules"),
          javascript : path.join(paths.local_storage.game_modules, gameName, "javascript"),
          resources : path.join(paths.local_storage.game_modules, gameName, "resources"),
      }
      var array = Object.keys(directories).map(function (key) {return directories[key]});

      
      async.each(array, createFolder, function(err) {
        if (err) {
          err.message += " Failed to create game module folders";
          callback(err);
        }
        else {
          logger.log("FileManager", "New Game Module Directories created at", directories);
          callback(null, directories);
        }
      });
    }
    
    
    this.createDirectoryForPrivateTournament = function(tournamentName, callback) {
      var path = require('path');
      var newDirectoryPath = path.resolve(paths.local_storage.private_tournaments, tournamentName);
      createFolder(newDirectoryPath, function(err) {
        if (err) {
          callback(err);
        }
        else {
          callback(null, newDirectoryPath);
        }
      });
    }
    
    this.saveConfigurationToFile = function(formData, callback) {
      var fileData = "";
      fileData += 'databaseHost' + '\t' + formData['databaseHost'] + '\n';
      fileData += 'databasePort' + '\t' + formData['databasePort'] + '\n';
      fileData += 'databaseName' + '\t' + formData['databaseName'] + '\n';
      fileData += 'databaseUserName' + '\t' + formData['databaseUserName'] + '\n';
      fileData += 'databasePassword' + '\t' + formData['databasePassword'];
      fse.outputFile(paths.configuration_file, fileData, callback);
    }
    
    /**
     * Callback has the signature function(err, config)
     * Where config is an object of the form 
     *      {
     *          'databaseHost' : 
     *          'databasePort' :
     *          'databaseName' :
     *          'databaseUserName' :
     *          'databasePassword' :
     *      }
     * If the file doesn't exist config will be null and an error will be passed back
     */
    this.parseConfigurationFile = function(callback) {
      var expectedProperties = ['databaseHost','databasePort','databaseName','databaseUserName','databasePassword'];
      readTextFileIntoLinesArray(paths.configuration_file, function(err, lines) {
        if (err) {
          callback(err);
        }
        else {
          var config = {};
          var error = null;
          for (var lineNum = 0; lineNum < lines.length; lineNum++) {
            var tmp = lines[lineNum].trim().split(/[\t ]/);
            var lineElements = [];
            var lineElementsIndex = 0;
            for (var i = 0; i < tmp.length; i++) {
              if (tmp[i].trim() !== '') {
                  lineElements[lineElementsIndex] = tmp[i];
                  lineElementsIndex++;
              }
            }
            if (lineElements.length != 2) {
              logger.log(lineElements);
              error = new Error("Line #" + (lineNum+1) + " of configuration file doesn't contain two tab separated elements");
              break;
            }
            else {
              var index = expectedProperties.indexOf(lineElements[0]);
              if ( index !== -1){
                config[lineElements[0]] = lineElements[1];
                expectedProperties.splice(index, 1);
              }
              else {
                error = new Error("Found invalid property name on line " + (lineNum+1) + "of configuration file");
                break;
              }
            }
          }
          if (!error && expectedProperties.length != 0) {
            callback(new Error("configuration file was missing the following properties: " + expectedProperties));
          }
          else {
            callback(error, config);
          }
        }
      })
    }
    
    this.parseStudentListForTournament = function(pathToFile, eventEmitter, callback) {
   // Read the txt file line by line
      var objectFactory = require(paths.custom_modules.ObjectFactory);
      readTextFileIntoLinesArray(pathToFile ,function(err, lines) {
        if (err) {
          callback(err);
        }
        else {
          var usersArray = [];
          var errMessage = "";
          var numberOfErrors = 0;
          var inputValidator = require(paths.custom_modules.InputValidator).newInstance();
          for (var line = 0; line < lines.length; line++) {
            var usernameRegEx = /^[a-z0-9_-]{3,16}$/;
            var passwordRegEx = /^[a-z0-9_-]{6,18}$/;
            var tmp = lines[line].trim().split(/[\t ]/);
            // Remove any extra whitespace between elements
            var lineElements = [];
            var lineElementsIndex = 0;
            for (var i = 0; i < tmp.length; i++) {
              if (tmp[i].trim() !== '') {
                  lineElements[lineElementsIndex] = tmp[i];
                  lineElementsIndex++;
              }
            }
            if (lineElements.length !== 2) {
              numberOfErrors++;
              eventEmitter.emit('config_error', "&nbsp&nbsp  Line #" + (line+1) + " Line must contain only username and password separated by a tab or space character");
            }
            else if (!inputValidator.isAlphanumeric4to35Char(lineElements[0])){
              numberOfErrors++;
              eventEmitter.emit('config_error', "&nbsp&nbsp  Line #" + (line+1) + " Username be an alphanumeric string between 4 and 35 characters");
            }
            else if (!inputValidator.isPassword(lineElements[1])){
              numberOfErrors++;
              eventEmitter.emit('config_error', "&nbsp&nbsp  Line #" + (line+1) + " Password consist of 4 to 16 characters and contain at least one number");
            }
            
            if (!numberOfErrors) {
                usersArray[line] = objectFactory.User.newInstance(lineElements[0], lineElements[1], 'student');
            }
            if (numberOfErrors >= 5) {
              break;
            }
          }
          
          if (numberOfErrors > 0) {      
              callback(new Error("Failed to parse student list file due to the errors above"));
          }
          else {
            callback(null, usersArray);
          }
        }
      });
    }
    
    //copies directory, even if it has subdirectories or files
    this.copyFileOrFolder = function(srcPath, destPath, callback) {
      fse.copy(srcPath, destPath, callback);
    }
    
    this.moveFile = function(srcPath, destPath, callback) {
      //logger.log(srcPath, destPath);
      fse.move(srcPath, destPath, {'clobber':true}, callback);
    }
    
    function readTextFileIntoLinesArray(pathToFile, callback) {
      fse.readFile(pathToFile, 'utf8', function(err, data) {
        if (err) {
          callback(err);
        }
        else {
          var lines = data.split(/\r?\n/);
          //logger.log(lines);
          if (lines[lines.length-1] === '') {
              lines.splice(lines.length-1, 1);
          }
          callback(null, lines);
        }

      })
    } 
    
    /**
     * ASYNC: Allows for the creation of a game instance directory that holds bots
     * @method createGameInstanceDirectory
     * @param {String} gameId - game id for folder identification
     * @param {Function} callback(err)
     * @public
     */
    this.createGameInstanceDirectory = function(gameId, callback) {
      var path = require('path');
      var directoryPath = path.resolve(paths.local_storage.test_arena_tmp, gameId);
      createFolder(directoryPath, callback);
    }
    
    /**
     * ASYNC: Allows for the creation of a bot folder in game instance directory
     * @method createGameInstanceDirectory
     * @param {String} gameId - game id for folder identification
     * @param {String} folderName - name of inner folder to create
     * @param {Function} callback(err)
     * @public
     */
    this.createBotFolderInGameInstanceDirectory = function(gameId, folderName, callback) {
      var path = require('path');
      var directoryPath = path.resolve(paths.local_storage.test_arena_tmp, gameId, folderName);
      createFolder(directoryPath, callback);
    }
    
    /**
     * ASYNC: Allows for the deletion of a game instance directory that holds bots
     * @method deleteGameInstanceDirectory
     * @param {String} gameId - game id for folder identification
     * @param {Function} callback(err)
     * @public
     */
    this.deleteGameInstanceDirectory = function(gameId, callback) {
      // if gameId is null or undefined this will delete the parent folder so return
      if(!gameId){
        return;
      }
      var path = require('path');
      var directoryPath = path.resolve(paths.local_storage.test_arena_tmp, gameId);
      self.removeFileOrFolder(directoryPath, callback);
    }
    
    this.getfolderContentList = function(folder){
      var folderContentList = fse.readdirSync(folder);
      return folderContentList
    }
    
    /* Likely not needed anymore.
     * 
     /**
     * SYNC: Allows to count all sub-directories in the provided directory
     * @method getSubFolderCount
     * @param {String} folder - absolute path for folder to count sub-folders
     * @return {integer} count - -1 if it doesn't exist, otherwise, number of sub-folders in the folder
     * @public
     *
    // should we make this async with callbacks?
    this.getSubFolderCount = function(folder){
      // ensure exists. if no subfolders when killbot finishes will crash server. i.e. somehow session is removed
      // and the tab is then closed
      try{
        var folderContentList = fse.readdirSync(folder);
      }
      catch(error){
        if(error.errno === 34){
          console.log(error);
          return -1;
        }
        else{
          console.log(error);
        }
      }
      var count = 0;
      var path = require('path');
      var directoryPath = null;
      for(var item in folderContentList){
        directoryPath = path.resolve(folder, folderContentList[item]);
        if(fse.statSync(directoryPath).isDirectory()){
          count++;
        }
      }
      return count;
    }*/
    
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
            logger.log("Error creating directory: " + err);
            if(callback && typeof(callback) == "function") {callback(err, "Failed to create" + folderPath);} 
          }
          else{
            logger.log("Created " + folderPath);
            if(callback && typeof(callback) == "function") {callback(null, "Created " + folderPath);}
          }
       });
     };
     
     /**
      * ASYNC: Allows for the deletion of a folder at the given path. Will pass any error objects as first argument to callback
      * @method createFolder
      * @param {String} folderPath - absolute path for folder to be created
      * @param {Function} callback(err)
      * @public
      */
     this.removeFileOrFolder = function(folderPath, callback){
        fse.remove(folderPath, function(err){
           if (err) {
             err.message += "Error deleting directory: " + folderPath + err.message;
             logger.log(err);
             if(callback && typeof(callback) == "function") {callback(err);} 
           }
           else{
             logger.log("fileManager", "Deleted " + folderPath);
             if(callback && typeof(callback) == "function") {callback(null);}
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
             logger.log("Error creating file: " + err);
             if(callback && typeof(callback) == "function") {callback(err, "Error creating file: " + err);}
           }
           else{
             logger.log("Created " + filePath);
             if(callback && typeof(callback) == "function") {callback(null, "Created " + filePath);}
           }
        });
      };
}

module.exports = FileManager;
module.exports.newInstance = function() {
  return new FileManager();
}