/**
 * Handles serving and processing of the initial configuration form. This class
 * extends EventEmitter and will emit 'progress_update', 'config_error', and
 * 'config_success' events as described in the Events section. This class has no
 * public properties or methods, all that is required to use it is to call the
 * constructor and register listeners for each of its events.
 * 
 * @class InitialConfigurationApp
 * @param {BotBattleServer}
 *            initConfigAppServer The instance of BotBattleServer that should be
 *            used to serve the InitialConfigurationApp.
 * @constructor
 * @extends EventEmitter
 */
function InitialConfigurationApp(initConfigAppServer) {
  var self = this;
  var paths = require('./BotBattlePaths');
  var fileManager = new (require(paths.custom_modules.FileManager));

  /**
   * An object containing all fields submitted in the initial configuration form
   * after sanitization.
   * 
   * @property sanitizedFormData
   * @type {Object}
   * @private
   */
  var sanitizedFormData = null;

  /**
   * The BotBattleDatabase that will be initialized and ultimately emitted via
   * the config_success event.
   * 
   * @property database
   * @type {BotBattleDatabase}
   * @private
   */
  var database = null;

  /**
   * Run as a result of the user submitting the initial configuration form.
   * Executes all tasks necessary to setup of the file system and database for
   * use by the BotBattleApp. NOTE: All tasks to be run must call the passed
   * callback upon completion passing an error object as the first argument If a
   * non-null error argument is passed, the sequence will terminate and the
   * 'config_error' event will be fired. Optionally you may pass a result as the
   * second argument to the callback. This will be accessible in the results
   * parameter of the final callback in async.series(...)
   * 
   * @method executeAllInitialConfigurationTasksInSequence
   * 
   * @private
   */
  function executeAllInitialConfigurationTasksInSequence() {

    require('async').series(
        [ initDatabaseTask, // Each should be 20%
          initFileSystemTask, 
          createAdminUserTask, // Probably should be moved to last
          initGameModuleTask, 
          initTournamentTask,
          cleanupTask
         ], 
         function(err) {
          if (err) {
            console.log("There was an error during configuration... " + err);
            self.emit('config_error', err.message);
          } else {
            // NOTE: arbitrary error is being passed from cleanupTask to halt things while still
            //  working on this page.
            self.emit('status_update', 'Completed setup.');
            self.emit('progress_update', 100);

            self.emit('config_success', database);
          }
        }
      );
  }

  /**
   * Upon successful completion, the private database property will be set to a
   * BotBattleDatabase object ready for use by the system.
   * 
   * @method initDatabaseTask
   * @param {Function} callback used by async.series(...).
   * @private
   */
  function initDatabaseTask(initDatabaseTaskCallback) {
    self.emit('status_update', 'Setting up the Database');
    var BotBattleDatabase = require(paths.custom_modules.BotBattleDatabase);
    database = new BotBattleDatabase(sanitizedFormData.databaseHost,
        sanitizedFormData.databasePort, sanitizedFormData.databaseName,
        sanitizedFormData.databaseUserName, sanitizedFormData.databasePassword);

    database.initializeFreshDatabase(function(err) {
      if (!err) {
        self.emit('status_update', "Database initialization Complete!");
        self.emit('progress_update', 20);
      }
      initDatabaseTaskCallback(err);
    });
  }

  /**
   * Upon successful completion, the Game Modules, Private/Public Tournaments,
   * and Test Arena Tmp directories will exist on the file system
   * 
   * @method initDatabaseTask
   * @param {Function} callback used by async.series(...).
   * @private
   */
  function initFileSystemTask(initFileSystemTaskCallback) {
    // Call FileManager to handle
    self.emit('status_update', 'Initializing the local storage');
    
    fileManager.clearLocalStorage(function(err) {
      if (err) {
        initFileSystemTaskCallback(err);
      }
      else {
        self.emit('status_update', "Local storage successfully cleared!");
        self.emit('progress_update', 30);
        
        fileManager.ensureLocalStorage(function(err) {
          if (err) {
            initFileSystemTaskCallback(err);
          }
          else {
            self.emit('status_update', "Local storage successfully created!");
            self.emit('progress_update', 40); 
            initFileSystemTaskCallback(null);
          }
        });
      }
    });
  }

  /**
   * Upon successful completion the admin user will exist in the database
   * @method createAdminUserTask
   * @param {Function}
   *            callback used by async.series(...).
   * @private
   */
  function createAdminUserTask(callback) {
    self.emit('status_update', 'Creating the administrator user');
    var ObjectFactory = require(paths.custom_modules.ObjectFactory);
    var adminUser = ObjectFactory.createUserObject(
        sanitizedFormData.adminUserName, sanitizedFormData.adminPassword);

    database.insertAdminUser(adminUser, function(err) {
      // TODO, get rid of this result message, make things more consistent
      if (!err) {
        self.emit('status_update', "Successfully created the administrator user");
        self.emit('progress_update', 60);
      }
      callback(err);
    });
  }

  /**
   * Upon successful completion, the Game Module will exist in a self-contained
   * sub directory of the game_modules local_storage directory. In addition, an
   * entry will be added to the database, keyed by the game's name, that stores
   * all pertinent information about the game module.
   * 
   * @method initGameModuleTask
   * @param {Function}
   *            callback used by async.series(...).
   * @private
   */
  function initGameModuleTask(initGameModuleTaskCallback) {
    /* Each subtask will be passed the tmpData, add its contributions to the
     * object, then pass it along to the next subtask. If anything goes wrong 
     * along the way, a non-null error object will be passed to a subtask's callback,
     * which will be propagated all the way back to 
     * executeAllInitialConfigurationTasksInSequence, halting the initial configuration 
     * process and notifying the user of any message in that err object.
     */
    self.emit('status_update', 'Initializizing the Game Module');
    var async = require('async');

    var tmpData = {
      gameName : sanitizedFormData.gameName,
      gameRulesFile : sanitizedFormData.gameRules,
      gameSourceFile : sanitizedFormData.gameSource,
      gameTimeout : 30
    // Probably should add this to the html form if we're allowing the timeout
    // (.e.g for disqualifying bots) to be configured.
    }
    async.waterfall(
        [
           function(seedCallback) {
             // Seed the tmpData into the waterfall
             seedCallback(null, tmpData);
           }, 
           initGameModuleTask1_CreateDirectoryFromGameName,
           initGameModuleTask2_MoveGameRulesAndSourceIntoNewDirectory,
           initGameModuleTask3_CompileGameModuleSourceFile,
           initGameModuleTask4_InsertGameModuleDatabaseEntry 
         ], 
         function(err) {
          if (err) {
            err.message = 'Error in initGameModuleTask: ' + err.message;
          } else {
            self.emit('progress_update', 80);
            self.emit('status_update', 'Game Module successfully configured!');
          }
          initGameModuleTaskCallback(err);
        }
      );
  }

  function initGameModuleTask1_CreateDirectoryFromGameName(tmpData, callback) {
    fileManager.createDirectoryForGameModule(tmpData.gameName, function(err, pathToDirectory) {
      if (err) {
        err.message += " Error creating directory for game module";
        callback(err);
      } else {
        self.emit('progress_update', 64);
        self.emit('status_update', 'Directory for game module created at ' + pathToDirectory);
        
        tmpData.newDirectoryPath = pathToDirectory;
        callback(null, tmpData);
      }
    });
  }

  function initGameModuleTask2_MoveGameRulesAndSourceIntoNewDirectory(tmpData, initGameModuleTask2Callback) {
    var path = require('path');
    var newRulesFilePath = path.resolve(tmpData.newDirectoryPath, tmpData.gameRulesFile.name);
    var newSourceFilePath = path.resolve(tmpData.newDirectoryPath, tmpData.gameSourceFile.name);
    fileManager.moveFile(tmpData.gameRulesFile.path, newRulesFilePath, function(err) {
      if (err) {
        err.message = "Failed to move '" + tmpData.gameRulesFile.path + "' to " + newRulesFilePath + '\n' + err.message;
        initGameModuleTask2Callback(err)
      } else {
        fileManager.moveFile(tmpData.gameSourceFile.path, newSourceFilePath, function(err) {
          if (err) {
            err.message = "Failed to move '" + tmpData.gameSourceFile.path + "' to " + newSourceFilePath  + '\n' + err.message;;
            initGameModuleTask2Callback(err)
          } else {
            self.emit('progress_update', 68);
            self.emit('status_update', 'Successfully moved game module rules and source files to new directory');
            tmpData.newRulesFilePath = newRulesFilePath;
            tmpData.newSourceFilePath = newSourceFilePath;
            initGameModuleTask2Callback(null, tmpData);
          }
        });
      }
    });
  }

  function initGameModuleTask3_CompileGameModuleSourceFile(tmpData, callback) {
    var compiler = require(paths.custom_modules.BotBattleCompiler)
        .createBotBattleCompiler().on('warning', function(message) {
          console.log('compilation warning:', message);
        }).on('stdout', function(message) {
          console.log('compilation stdout:', message);
        }).on('stderr', function(message) {
          console.log('compilation stderr:', message);
        }).on('failed', function(message) {
          console.log('compilation failed:', message);
        }).on('complete', function(message) {
          console.log('compilation complete:', message);
        });

    compiler.compile(tmpData.newSourceFilePath,
        function(err, compiledFilePath) {
          if (err) {
            err.message += " Error compiling game module source file";
            callback(err);
          } else {
            self.emit('progress_update', 72);
            self.emit('status_update', 'Successfully compiled game module source file!');
            tmpData.compiledFilePath = compiledFilePath;
            callback(err, tmpData);
          }
        });
  }

  function initGameModuleTask4_InsertGameModuleDatabaseEntry(tmpData, callback) {
    var ObjectFactory = require(paths.custom_modules.ObjectFactory);
    var gameModuleObject = ObjectFactory.createGameModuleObject(
        tmpData.gameName, tmpData.newDirectoryPath, tmpData.newRulesFilePath,
        tmpData.newSourceFilePath, tmpData.compiledFilePath,
        tmpData.gameTimeout);

    database.insertGameModule(gameModuleObject, 
        function(err) {
          if (err) {
            err.message += " Error inserting game module into database";
            callback(err);
          } else {
            self.emit('progress_update', 76);
            self.emit('status_update', 'Successfully inserted game module into database');
            console.log('Successfully inserted game module into database');
            callback(err);
          }
        });
  }

  /**
   * Upon successful completion, the Tournaments collection of the database will
   * contain a TournamentMetadata document representing the configured
   * Tournament. In addition a subdirectory will exist with the tournament's
   * folder that contains a directory for the bots of each student participating
   * in the tournament.
   * 
   * @method initTournamentTask
   * @param {Function}
   *            callback used by async.series(...).
   * @private
   */
  function initTournamentTask(callback) {
    self.emit('status_update', 'Initializizing the Game Module');
    var async = require('async');

    // Read the txt file line by line
    fileManager.readTextFileIntoLinesArray(sanitizedFormData.studentList.path ,function(err, lines) {
      var output = "";
      for (line in lines) {
        var usernameRegEx = /^[a-z0-9_-]{3,16}$/;
        var passwordRegEx = /^[a-z0-9_-]{6,18}$/;
        var userArray = lines[line].trim().split(/[\t ]/);
        // Remove any extra whitespace between elements
        for (element in userArray) {
          if (userArray[element].trim() === "") {
            userArray.splice(element,1);
          }
        }
        if (userArray.length != 2) {
          output +="\nLine #" + line + " Line must contain only username and password separated by a tab or space character";
        }
        else if (!userArray[0].match(usernameRegEx)){
          output +="\nLine #" + line + " Username must consist only of lowercase, numbers, underscores, and hypens and be between 3 and 16 characters";
        }
        else if (!userArray[1].match(usernameRegEx)){
          output += "\nLine #" + line + " Password must consist only of lowercase, numbers, underscores, and hypens and be between 6 and 18 characters";
        }
        else {
          output += "\nLine #" + line + " Valid username and password";
        }
        console.log(userArray, "Length", userArray.length);
      }
      console.log(output);
      self.emit('progress_update', 80);
      callback(null);
    });
  }
  
  function cleanupTask(callback) {
    fileManager.clearInitConfigTmp(function(err) {
      if (err) {
        err.message += " Failed to perform cleanup after initial configuration";
        callback(err);
      } else {
        self.emit('progress_update', 90);
        self.emit('status_update', 'Initial configuration cleanup successful');
        console.log('Initial configuration cleanup successful');
        //callback(null);
        callback(new Error("Everything is great, just stopping at cleanupTask while still working on the page"));
      }
    });
  }

  /**
   * Registers routes to serve the initialConfigurationPage and to process the
   * initial configuration form submission. Note: This method is invoked by the
   * constructor.
   * 
   * @method registerInitialConfigurationRoutes
   * @private
   */
  (function registerInitialConfigurationRoutes() {
    initConfigAppServer.addStaticFileRoute('/', paths.static_content.html
        + 'initialConfiguration.html');

    // Add multer
    // This needs pulled out of here
    // security issues
    // https://github.com/jpfluger/multer/blob/examples/multer-upload-files-to-different-directories.md
    var multer = require('multer');
    initConfigAppServer
        .addDynamicRoute(
            'post',
            '/processInitialConfiguration',
            multer({
              dest : paths.init_config_tmp,
              limits : {
                fieldNameSize : 100,
              // files: 2,
              // fields: 5
              // fieldNameSize - integer - Max field name size (Default: 100
              // bytes)
              // fieldSize - integer - Max field value size (Default: 1MB)
              // fields - integer - Max number of non-file fields (Default:
              // Infinity)
              // fileSize - integer - For multipart forms, the max file size (in
              // bytes)
              // (Default: Infinity)
              // files - integer - For multipart forms, the max number of file
              // fields
              // (Default: Infinity)
              // parts - integer - For multipart forms, the max number of parts
              // (fields
              // + files) (Default: Infinity)
              // headerPairs - integer - For multipart forms, the max number of
              // header
              // key=>value pairs to parse Default: 2000 (same as node's http).
              },
              // putSingleFilesInArray: true, // this needs doen for future
              // compat. but
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
                  if (file.name.match(javaRE)) {
                    console.log(file.fieldname + ':' + file.name
                        + ' is a .java file, uploading will continue');
                    self.emit('status_update',
                        'Verified game module is a java file');
                  } else {
                    console
                        .log(file.fieldname
                            + ':'
                            + file.name
                            + ' is a NOT .java file, this file will not be uploaded');
                    self
                        .emit('config_error',
                            'Error during form submission: Game module source is not a .java file');
                    // Returning false cancels the upload.
                    return false;
                  }
                }
                var pdfRE = /.*\.pdf/;
                if (file.fieldname == 'gameRules') {
                  if (file.name.match(pdfRE)) {
                    console.log(file.fieldname + ':' + file.name
                        + ' is a .pdf file, uploading will continue');
                    self.emit('status_update',
                        'Verified game rules is a pdf file');
                  } else {
                    console
                        .log(file.fieldname
                            + ':'
                            + file.name
                            + ' is a NOT .pdf file, this file will not be uploaded');
                    self
                        .emit('config_error',
                            'Error during form submission: Game rules is not a .pdf file');
                    // Returning false cancels the upload.
                    return false;
                  }
                }
                /*
                var txtRE = /.*\.txt/;
                if (file.fieldname == 'studentList') {
                  if (file.name.match(txtRE)) {
                    console.log(file.fieldname + ':' + file.name
                        + ' is a .txt file, uploading will continue');
                    self.emit('status_update',
                        'Verified game module is a txt file');
                  } else {
                    console
                        .log(file.fieldname
                            + ':'
                            + file.name
                            + ' is a NOT .txt file, this file will not be uploaded');
                    self
                        .emit('config_error',
                            'Error during form submission: Student list is not a .txt file');
                    // Returning false cancels the upload.
                    return false;
                  }
                }
                */

              },
              onFileUploadComplete : function(file, req, res) {
                console.log(file.fieldname + ' uploaded to  ' + file.path);
                // add logic to check the file fieldname and change save
                // directory and
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

                // Dont need to do any custom parsing, also don't need half
                // these
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
                fs.unlink('./' + file.path) // delete the partially written file
                                            // // set
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
    initConfigAppServer.addDynamicRoute('post', '/processInitialConfiguration',
        function(req, res) {
          // console.log(JSON.stringify(req.body));
          var sanitizer = require('sanitizer');
          sanitizedFormData = {
            // database parameters
            databaseHost : sanitizer.sanitize(req.body.databaseHost),
            databasePort : sanitizer.sanitize(req.body.databasePort),
            databaseName : sanitizer.sanitize(req.body.databaseName),
            databaseUserName : sanitizer.sanitize(req.body.databaseUserName),
            databasePassword : sanitizer.sanitize(req.body.databasePassword),
            // admin user parameters
            adminUserName : sanitizer.sanitize(req.body.adminUserName),
            adminPassword : sanitizer.sanitize(req.body.adminPassword),
            // game module parameters
            gameName : sanitizer.sanitize(req.body.gameName),
            gameSource : req.files.gameSource,
            gameRules : req.files.gameRules,
            // tournament parameters
            tournamentName : sanitizer.sanitize(req.body.tournamentName),
            studentList : req.files.studentList,
            tournamentDeadline : sanitizer
                .sanitize(req.body.tournamentDeadline),
          };
          // console.log(JSON.stringify(sanitizedFormData));
          var error = false;
          for (fieldName in sanitizedFormData) {
            if (!sanitizedFormData[fieldName]) {
              error = true;
              self.emit('config_error', 'No data was received for the '
                  + fieldName + ' field');
            }
          }
          if (error) {
            self.emit('config_error', 'Configuration has halted');
          } else {
            self.emit('status_update', 'Form submission succesfull');
            self.emit('progress_update', 10);
            executeAllInitialConfigurationTasksInSequence();
          }
          res.end();
        });
  })();
}

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(InitialConfigurationApp, EventEmitter);

module.exports = InitialConfigurationApp;

/**
 * Occurs when an error occurs during configuration. Configuration halts and no
 * additional tasks will be attempted.
 * 
 * @event config_error
 * @param {Error}
 *            err The Error object generated by the failed task.
 */
/**
 * Occurs after all tasks have been successfully completed.
 * 
 * @event config_success
 * @param {BotBattleDatabase}
 *            database The initialized database resulting from the successful
 *            initial configuration.
 */
/**
 * Fired periodically to provide notification the progress has been made.
 * 
 * @event progress_update
 * @param {Number}
 *            progress A number between 0 and 100 indicating the current
 *            progress.
 */
