/**
* Handles serving and processing of the initial configuration form. 
* This class extends EventEmitter and will emit 'progress_update', 
* 'config_error',  and 'config_success' events as described in the Events section.
* This class has no public properties or methods, all that is required to use it is to call the constructor 
* and register listeners for each of its events.
* @class InitialConfigurationApp
* @param {BotBattleServer} initConfigAppServer The instance of BotBattleServer that should be used to serve
*   the InitialConfigurationApp.
* @constructor 
* @extends EventEmitter
*/
function InitialConfigurationApp(initConfigAppServer) {
  var self = this;
  var paths = require('./BotBattlePaths');
  var fileManager = new (require(paths.custom_modules.FileManager));
  
  /**
  *  An object containing all fields submitted in the initial configuration form after sanitization.
  *  @property sanitizedFormData
   * @type {Object}
   * @private
  */
  var sanitizedFormData = null;
  
  /**
   *  The BotBattleDatabase that will be initialized and ultimately emitted via the config_success event.
   *  @property database
    * @type {BotBattleDatabase}
    * @private
   */
  var database = null;
  
  /**
   * Run as a result of the user submitting the initial configuration form. 
   * Executes all tasks necessary to setup of the file system and database for use by the BotBattleApp.
   * NOTE: All tasks to be run must call the passed callback upon completion passing an error object as the first argument
   * If a non-null error argument is passed, the sequence will terminate and the 'config_error' event will be fired.
   * Optionally you may pass a result as the second argument to the callback. This will be accessible in the results 
   * parameter of the final callback in async.series(...)
   * @method executeAllInitialConfigurationTasksInSequence

   * @private
   */
  function executeAllInitialConfigurationTasksInSequence() {
    
    require('async').series(
        [
           initDatabaseTask, //Each should be 20%
           initFileSystemTask,
           storeAdminUserTask,
           initGameModuleTask,
           initTournamentTask
        ], 
        function(err) {
          if (err) {
        	console.log("There was an error during configuration... " + err);
            self.emit('config_error', err.message);
          } 
          else{
        	 self.emit('status_update', 'Completed setup.');
        	  self.emit('progress_update', 100);
        	  //self.emit('config_success', database);        	  
          }
        }
    );  
  }
  
  /**
   * Upon successful completion, the private database property will be set to a
   * connected and authenticated BotBattleDatabase object.
   * @method initDatabaseTask
   * @param {Function} callback used by async.series(...). 
   * @private
   */
  function initDatabaseTask(callback) {
	self.emit('status_update', 'Setting up the Database');
    var BotBattleDatabase = require(paths.custom_modules.BotBattleDatabase); 
    database = new BotBattleDatabase(sanitizedFormData.databaseHost, sanitizedFormData.databasePort,
        sanitizedFormData.databaseName, sanitizedFormData.databaseUserName, sanitizedFormData.databasePassword);
    
    database.connect(function(err, result){
    	if(err){
    		self.emit('config_error', err);
    	}    	
    	else{
    		self.emit('status_update', result);
    		self.emit('progress_update', 20);
    		callback(null);
    	}
    });
  }
  
  /**
   * Upon successful completion, the Game Modules, Private/Public Tournaments, 
   * and Test Arena Tmp directories will exist on the file system
   * @method initDatabaseTask
   * @param {Function} callback used by async.series(...). 
   * @private
   */
  function initFileSystemTask(callback) {
    // Call FileManager to handle
	self.emit('status_update', 'Initializing the local storage');
	
	// Pass self to be used as an event emitter.
	// the fileManager will handle the emitting of all the necessary events
	// and nothing is returned by the callback other than the error object so no
	// need to define a custom one here.
	// This function should create all necessary directories
	fileManager.initLocalStorage(self, callback);
  }
  
  /**
   * Upon successful completion, the SystemParameters collection of the database
   * will contain document(s) with the information from the sanitizedFormData that
   * should be persisted. The AdminUser will also be stored in the SystemParameters collection (maybe)
   * @method initSystemParametersTask
   * @param {Function} callback used by async.series(...). 
   * @private
   */
  function storeAdminUserTask(callback) {
	// Insert the admin user into the AdminUsers collection
	  var ObjectFactory = require(paths.custom_modules.ObjectFactory);
	  var adminUser = ObjectFactory.createUserObject(sanitizedFormData.adminUserName, sanitizedFormData.adminPassword);
	  
	  database.insertAdminUser(adminUser, function(err, resultMessage) {
	    if (!err) {
	      self.emit('status_update', resultMessage);
	      self.emit('progress_update', 60);
	    }
	    callback(err);
	  });
  }
  
  /**
   * Upon successful completion, the GameModules collection of the database
   * will contain a GameModuleMetadata document representing the uploaded Game Module.
   * In addition the Game Module's java, class, and rules.pdf files will exist in a 
   * subdirectory of the system GameModules directory.
   * @method initGameModuleTask
   * @param {Function} callback used by async.series(...). 
   * @private
   */
  function initGameModuleTask(callback) {
    //self.emit('progress_update', 60);
  //TODO Implement
    //Setup the Game Module
    // Call FileManager to handle
    var async = require('async');
    async.waterfall(
        [
         // Seed the gameName into the waterfall
         function(callback2) {
           callback2(null, sanitizedFormData.gameName);
         },
         // Will be passed gameName from above as first arg, will call callback with newDirectoryPath when done
         fileManager.createDirectoryForGameModule,
         // Takes newDirectoryPath passed in from above, and moves the submitted rules and source files into it
         // Then passes the new path to the source file to the compile function
         moveGameRulesAndSourceIntoNewDirectory,
         // Takes the path to the source file, compiles it in the same directory, then passes the path to the
         // compiled file to the next function
         compileSourceFile,
         // Takes path to the compiled file and uses the file object of the sanitizedFormData to create a DB object
         // and insert it. Then were done!
         createGameModuleDatabaseEntry
         ], 
         function(err) {
          if (err) {
            self.emit('config_error', err.message + ' Error in initGameModuleTask')
          }
          else {
            self.emit('progress_update', 80);
            self.emit('status_update', 'Game Module successfully configured!');
          }
     
          callback(err);
         }
        );
  }
    
  function moveGameRulesAndSourceIntoNewDirectory(newDirectoryPath, callback) {
    console.log('here');
    var path = require('path');
    var newRulesPath = path.resolve(newDirectoryPath, sanitizedFormData.gameRules.name);
    var newSourcePath = path.resolve(newDirectoryPath, sanitizedFormData.gameSource.name);
    fileManager.moveFile(sanitizedFormData.gameRules.path, newRulesPath, function(err) {
      if (err) {
        err.message += "Failed to move '" + sanitizedFormData.gameRules.name + "' to " + newRulesPath;
        callback(err)
      }
      else {
        fileManager.moveFile(sanitizedFormData.gameSource.path, newSourcePath, function(err) {
          if (err) {
            err.message += "Failed to move '" + sanitizedFormData.gameSource.name + "' to " + newSourcePath;
            callback(err)
          }
          else {
            // Pass data created so far source file path along to the compilation function
            callback(null, {'gameName' : sanitizedFormData.gameName, 
                            'gameModuleDirectory' : newDirectoryPath, 
                            'rulesFilePath' : newRulesPath, 
                            'sourceFilePath' : newSourcePath
                            });
          }
        });
      }
    });
  }
  
  function compileSourceFile (pathData, callback) {
    var compiler = require(paths.custom_modules.BotBattleCompiler).createBotBattleCompiler()
      .on('warning', function(message) {
        console.log('warning', message);
        self.emit('status_update', message);
      })
      .on('stdout', function(message) {
        console.log('stdout', message);
        self.emit('status_update', message);
      })
      .on('stderr', function(message) {
        console.log('stderr', message);
        self.emit('status_update', message);
      })
      .on('failed', function(message) {
        console.log('failed', message);
        self.emit('config_error', message);
      })
      .on('complete', function(message) {
        console.log('complete', message);
        self.emit('status_update', message);
      });
    
    compiler.compile(pathData.sourceFilePath, function(err, compiledFilePath) {
      if (err) {
        callback(err);
      }
      else {
        pathData.compiledFilePath = compiledFilePath;
        callback(err, pathData);
      }
    });
  }
  
  function createGameModuleDatabaseEntry(pathData, callback) {
    var ObjectFactory =  require(paths.custom_modules.ObjectFactory);
    var gameModuleObject = ObjectFactory.createGameModuleObject(
        pathData.gameName, pathData.gameModuleDirectory, 
        pathData.rulesFilePath, pathData.sourceFilePath, 
        pathData.compiledFilePath, 30);
    console.log(gameModuleObject);
    
    database.insertGameModule(gameModuleObject, callback);
  }
  
  /**
   * Upon successful completion, the Tournaments collection of the database
   * will contain a TournamentMetadata document representing the configured Tournament.
   * In addition a subdirectory will exist with the tournament's folder that contains 
   * a directory for the bots of each student participating in the tournament. 
   * @method initTournamentTask
   * @param {Function} callback used by async.series(...). 
   * @private
   */
  function initTournamentTask(callback) {
   // self.emit('progress_update', 80);
    //TODO Implement
    
    //Set up the Tournament
      // Build a userlist object from the uploaded txt file.

		self.emit('progress_update',80);
    callback(null);
  }
  
  /**
   * Registers routes to serve the initialConfigurationPage and to process the initial configuration form submission.
   * Note: This method is invoked by the constructor. 
   * @method registerInitialConfigurationRoutes
   * @private
   */
  (function registerInitialConfigurationRoutes() {
    initConfigAppServer.addStaticFileRoute('/', paths.static_content.html + 'initialConfiguration.html');
	  

    // Add multer
    // This needs pulled out of here
    // security issues
    // https://github.com/jpfluger/multer/blob/examples/multer-upload-files-to-different-directories.md
    var multer = require('multer');
    initConfigAppServer.addDynamicRoute('post', '/processInitialConfiguration', multer({
      dest : paths.local_storage.init_config_tmp,
      limits : {
        fieldNameSize : 100,
      // files: 2,
      // fields: 5
      // fieldNameSize - integer - Max field name size (Default: 100 bytes)
      // fieldSize - integer - Max field value size (Default: 1MB)
      // fields - integer - Max number of non-file fields (Default: Infinity)
      // fileSize - integer - For multipart forms, the max file size (in bytes)
      // (Default: Infinity)
      // files - integer - For multipart forms, the max number of file fields
      // (Default: Infinity)
      // parts - integer - For multipart forms, the max number of parts (fields
      // + files) (Default: Infinity)
      // headerPairs - integer - For multipart forms, the max number of header
      // key=>value pairs to parse Default: 2000 (same as node's http).
      },
      // putSingleFilesInArray: true, // this needs doen for future compat. but
      // will break current multiproto.
      rename : function(fieldname, filename) {
        return filename;
      },
      // changeDest: function(dest, req, res) {
      // return dest + '/user1';
      // },
      onFileUploadStart : function(file, req, res) {
        console.log(file.fieldname + ' is starting ...');
        var javaRE = /.*\.java/;
        if (file.fieldname == 'gameSource') {
          if (file.name.match(javaRE))
          {
            console.log(file.fieldname + ':' + file.name + ' is a .java file, uploading will continue');
            self.emit('status_update', 'Verified game module is a java file');
          }
          else{
            console.log(file.fieldname + ':' + file.name + ' is a NOT .java file, this file will not be uploaded');
            self.emit('config_error', 'Error during form submission: Game module source is not a .java file');
            // Returning false cancels the upload.
            return false;
          }
        }
        
      },
      onFileUploadComplete : function(file, req, res) {
        console.log(file.fieldname + ' uploaded to  ' + file.path);
        // add logic to check the file fieldname and change save directory and
        // name based on this
      },
      onFileUploadData : function(file, data, req, res) {
        console.log(data.length + ' of ' + file.fieldname + ' arrived')
      },
      onParseStart : function() {
        console.log('Form parsing started at: ', new Date())
      },
      onParseEnd : function(req, next) {
        console.log('Form parsing completed at: ', new Date());

        // Dont need to do any custom parsing, also don't need half these
        // options
        // but leave them for now
        // usage example: custom body parse
        // req.body = require('qs').parse(req.body);
        // console.log("HERE!");
        // console.log(require.resolve('qs'));

        // call the next middleware
        next();
      },
      onError : function(error, next) {
        console.log(error)
        next(error)
      },
      onFileSizeLimit : function(file) {
        console.log('Failed: ', file.originalname)
        fs.unlink('./' + file.path) // delete the partially written file // set
                                    // in limit object
      },
      onFilesLimit : function() {
        console.log('Crossed file limit!')
      },
      onFieldsLimit : function() {
        console.log('Crossed fields limit!')
      },
      onPartsLimit : function() {
        console.log('Crossed parts limit!')
      },
    }));
	    
	// multer needs to be added here for security reasons
    initConfigAppServer.addDynamicRoute('post', '/processInitialConfiguration', function(req, res) {
      //console.log(JSON.stringify(req.body));
      var sanitizer=require('sanitizer');
      sanitizedFormData = {
        //database parameters
        databaseHost: sanitizer.sanitize(req.body.databaseHost),
        databasePort: sanitizer.sanitize(req.body.databasePort),
        databaseName: sanitizer.sanitize(req.body.databaseName),
        databaseUserName: sanitizer.sanitize(req.body.databaseUserName),
        databasePassword: sanitizer.sanitize(req.body.databasePassword),
        //admin user parameters
        adminUserName: sanitizer.sanitize(req.body.adminUserName),
        adminPassword: sanitizer.sanitize(req.body.adminPassword),
        //game module parameters
        gameName: sanitizer.sanitize(req.body.gameName),
        gameSource: req.files.gameSource,
        gameRules: req.files.gameRules,
        //tournament parameters
        tournamentName: sanitizer.sanitize(req.body.tournamentName),
        studentList: req.files.studentList,
        tournamentDeadline: sanitizer.sanitize(req.body.tournamentDeadline), 
      };
      //console.log(JSON.stringify(sanitizedFormData));
      var error = false;
      for (fieldName in sanitizedFormData) {
        if (!sanitizedFormData[fieldName]) {
          error = true;
          self.emit('config_error', 'No data was received for the ' + fieldName + ' field');
        }
      }
      if (error) {
        self.emit('config_error', 'Configuration has halted');
      }
      else {
        self.emit('status_update', 'Form submission succesfull');
        self.emit('progress_update', 10);
        executeAllInitialConfigurationTasksInSequence();
      }
    });
  })();
}

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(InitialConfigurationApp, EventEmitter);

module.exports = InitialConfigurationApp;


/**
 * Occurs when an error occurs during configuration. Configuration halts and
 *  no additional tasks will be attempted. 
 * @event config_error
 * @param {Error} err The Error object generated by the failed task.
 */
/**
 * Occurs after all tasks have been successfully completed.
 * @event config_success
 * @param {BotBattleDatabase} database The initialized database resulting from the successful initial configuration. 
 */
/**
 * Fired periodically to provide notification the progress has been made.
 * @event progress_update
 * @param {Number} progress A number between 0 and 100 indicating the current progress.
 */