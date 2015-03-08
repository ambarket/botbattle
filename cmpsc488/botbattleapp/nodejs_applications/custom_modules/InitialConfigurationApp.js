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
  var objectFactory = require(paths.custom_modules.ObjectFactory);
  var logger = require(paths.custom_modules.Logger).newInstance('console');

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
          saveConfigAndCleanupTask
         ], 
         function(err) {
          if (err) {
            // Only output errors once to console, in the main function that listens for this config_error
            self.emit('config_error', err.message);
            self.emit('status_update', "Rolling back changes...");
            rollbackInitialConfiguration(function(err) {
              if (err) {
                self.emit('config_error', "Failed to roll back changes " + err.message);
              }
              else {
                self.emit('status_update', "Finished rolling back initial configuration.")
                // Use this to re-enable the submit button
                self.emit('reset_form', null);
              }
            });
          } else {
            self.emit('status_update', 'Completed setup.');
            self.emit('progress_update', 100);
            self.emit('config_success', database);
          }
        }
      );
  }
  
  function rollbackInitialConfiguration(callback) {

    var error = null;
    database.dropDatabaseAndDisconnect(function(err1) {
      if (!err1) {
        self.emit('status_update', "&nbsp&nbsp Successfully dropped database");
      }
      else {
        error = err1;
      }
      // Regardless keep trying to rollback as much as possible
      fileManager.deleteLocalStorage(function(err2) {
        if (!err2) {
          self.emit('status_update', "&nbsp&nbsp Successfully deleted local storage");
        }
        else {
          (error) ? error.message += '\n' + err2.message : error = err2;
        }
        // Regardless keep trying to rollback as much as possible
        fileManager.clearInitConfigTmp(function(err3) {
          if (!err3) {
            self.emit('status_update', "&nbsp&nbsp Successfully cleared initial configuration tmp directory");
          }
          else {
            (error) ? error.message += '\n' + err3.message : error = err3;
          }
          
          callback(error);
        });
      });
    });
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
    
    fileManager.deleteLocalStorage(function(err) {
      if (err) {
        initFileSystemTaskCallback(err);
      }
      else {
        self.emit('status_update', "&nbsp&nbsp Previous local storage directories successfully deleted!");
        self.emit('progress_update', 30);
        
        fileManager.ensureLocalStorage(function(err) {
          if (err) {
            initFileSystemTaskCallback(err);
          }
          else {
            self.emit('status_update', "&nbsp&nbsp Successfully recreated local storage directories");
            self.emit('status_update', "Local Storage Initialization Complete!");
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
    var adminUser = objectFactory.User.newInstance(
        sanitizedFormData.adminUserName, sanitizedFormData.adminPassword);

    database.insertAdminUser(adminUser, function(err) {
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
      gameTimeout : sanitizedFormData.gameMoveTimeout
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
            err.message = 'Error configuring the game module: ' + err.message;
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
        err.message += "&nbsp&nbsp Error creating directory for game module";
        callback(err);
      } else {
        self.emit('progress_update', 64);
        self.emit('status_update', '&nbsp&nbsp Directory for game module created at ' + pathToDirectory);
        
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
        err.message = "&nbsp&nbsp Failed to move '" + tmpData.gameRulesFile.path + "' to " + newRulesFilePath + '\n' + err.message;
        initGameModuleTask2Callback(err)
      } else {
        fileManager.moveFile(tmpData.gameSourceFile.path, newSourceFilePath, function(err) {
          if (err) {
            err.message = "Failed to move '" + tmpData.gameSourceFile.path + "' to " + newSourceFilePath  + '\n' + err.message;;
            initGameModuleTask2Callback(err)
          } else {
            self.emit('progress_update', 68);
            self.emit('status_update', '&nbsp&nbsp Successfully moved game module rules and source files to new directory');
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
          logger.log('compilation warning:', message);
        }).on('stdout', function(message) {
          logger.log('compilation stdout:', message);
        }).on('stderr', function(message) {
          logger.log('compilation stderr:', message);
          self.emit('config_error', '&nbsp&nbsp ' + message);
        }).on('failed', function(message) {
          logger.log('compilation failed:', message);
        }).on('complete', function(message) {
          logger.log('compilation complete:', message);
        });

    compiler.compile(tmpData.newSourceFilePath,
        function(err, compiledFilePath) {
          if (err) {
            err.message += "&nbsp&nbsp Error compiling game module source file";
            callback(err);
          } else {
            self.emit('progress_update', 72);
            self.emit('status_update', '&nbsp&nbsp Successfully compiled game module source file!');
            tmpData.compiledFilePath = compiledFilePath;
            callback(err, tmpData);
          }
        });
  }

  function initGameModuleTask4_InsertGameModuleDatabaseEntry(tmpData, callback) {
    var gameModuleObject = objectFactory.GameModule.newInstance(
        tmpData.gameName, tmpData.newDirectoryPath, tmpData.newRulesFilePath,
        tmpData.newSourceFilePath, tmpData.compiledFilePath,
        tmpData.gameTimeout);

    database.insertGameModule(gameModuleObject, 
        function(err) {
          if (err) {
            err.message += "&nbsp&nbsp Error inserting game module into database";
            callback(err);
          } else {
            self.emit('progress_update', 76);
            self.emit('status_update', '&nbsp&nbsp Successfully inserted game module into database');
            logger.log('Successfully inserted game module into database');
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
    self.emit('status_update', 'Initializing the Tournament');
    var async = require('async');
    self.emit('status_update', "&nbsp&nbsp Parsing the student list...");
    // Pass self to be used as event emitter to pass detailed line by line errors to the client
    fileManager.parseStudentListForTournament(sanitizedFormData.studentList.path, self, function(err, usersArray) {
      if (err) {
        callback(err);
      }
      else {
        fileManager.createDirectoryForPrivateTournament(sanitizedFormData.tournamentName, function(err, tournamentDirectory) {
          if (err) {
            callback(err);
          }
          else {
            self.emit('progress_update', 85);
            self.emit('status_update', '&nbsp&nbsp Successfully created directory for tournament');
            logger.log('Successfully created directory for tournament');
            var tournament = objectFactory.Tournament.newInstance(
                sanitizedFormData.tournamentName, 
                tournamentDirectory,
                sanitizedFormData.gameName, 
                sanitizedFormData.tournamentDeadline,
                usersArray,
                'upload');
            database.insertTournament(tournament, function(err) {
              if (err) {
                callback(err);
              }
              else {
                self.emit('progress_update', 90);
                self.emit('status_update', '&nbsp&nbsp Successfully inserted tournament into database');
                callback(null);
              }
            })
          }
        });
      }
    })
  }
  
  function saveConfigAndCleanupTask(callback) {
    fileManager.saveConfigurationToFile(sanitizedFormData, function(err) {
      if (err) {
        callback(err);
      }
      else {
        self.emit('status_update', "Successfully saved configuration to " + paths.configuration_file);
        logger.log("Successfully saved configuration to " + paths.configurationFile);
        //callback(new Error("Everything is great, just stopping at cleanupTask while still working on the page"));
        callback(null);
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
              onFileUploadStart : function(file, req, res) {
                logger.log(file.fieldname + ' is starting ...');
                var javaRE = /.*\.java/;
                if (file.fieldname == 'gameSource') {
                  if (file.name.match(javaRE)) {
                    logger.log(file.fieldname + ':' + file.name
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
                    logger.log(file.fieldname + ':' + file.name
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
              },
              onFileUploadComplete : function(file, req, res) {
                logger.log(file.fieldname + ' uploaded to  ' + file.path);
              },
              onError : function(error, next) {
                logger.log(error)
                next(error)
              },
              onFileSizeLimit : function(file) {
                logger.log('Failed: ', file.originalname)
                fs.unlink('./' + file.path) // delete the partially written file
                                            // // set
                // in limit object
              },
              onFilesLimit : function() {
                logger.log('Crossed file limit!')
              },
              onFieldsLimit : function() {
                logger.log('Crossed fields limit!')
              },
              onPartsLimit : function() {
                logger.log('Crossed parts limit!')
              },
            }));

    initConfigAppServer.addDynamicRoute('post', '/processInitialConfiguration',
        function(req, res) {
          // logger.log(JSON.stringify(req.body));
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
            gameMoveTimeout: sanitizer.sanitize(req.body.gameMoveTimeout),
            // tournament parameters
            tournamentName : sanitizer.sanitize(req.body.tournamentName),
            studentList : req.files.studentList,
            tournamentDeadline : sanitizer
                .sanitize(req.body.tournamentDeadline),
          };
          
          var valid = verifyAllFieldsWereSubmitted();
          if (valid) {
            valid = verifyAllFieldsMatchRegex();
          }
          
          if (!valid) {
            self.emit('status_update', 'Rolling back changes...');
            // Only cleanup to do is clear the tmp directory of the uploaded files
            fileManager.clearInitConfigTmp(function(err) {
              if (!err) {
                self.emit('status_update', "&nbsp&nbsp Successfully cleared initial configuration tmp directory");
              }
              else {
                self.emit('config_error', "&nbsp&nbsp Failed to clear initial configuration tmp directory " + err.message);
              }
              self.emit('status_update', 'Finished rolling back initial configuration');
              self.emit('reset_form');
            });
          } else {
            self.emit('status_update', 'Form submission succesful');
            self.emit('progress_update', 10);
            executeAllInitialConfigurationTasksInSequence();
          }
          res.end();
        });
  })();
  
  function verifyAllFieldsWereSubmitted() {
    var valid = true;
    for (fieldName in sanitizedFormData) {
      // Apparently the JSON parser turns undefined form submissions into the string 'undefined' so have to check for it
      if (!sanitizedFormData[fieldName] || sanitizedFormData[fieldName] === 'undefined') {
        valid = false;
        self.emit('config_error', 'No data was received for the ' + fieldName + ' field');
      }
    }
    
    if (valid && (sanitizedFormData.gameSource.name === sanitizedFormData.gameRules.name || 
        sanitizedFormData.gameSource.name === sanitizedFormData.studentList.name || 
        sanitizedFormData.gameRules.name === sanitizedFormData.studentList.name)) {
      valid = false;
      self.emit('config_error', 'Game Module Source, Game Rules, and Student List must have unique file names');
    }
    return valid;
  }
  
  function verifyAllFieldsMatchRegex() {
    var inputValidator = require(paths.custom_modules.InputValidator).newInstance();
    var valid = true;
    if (!inputValidator.isIPAddressOrHostName(sanitizedFormData.databaseHost)) {
      self.emit('config_error', 'Invalid database host');
      var valid = false;
    }
    if (!inputValidator.isPortNumber(sanitizedFormData.databasePort)) {
      self.emit('config_error', 'Invalid database port');
      var valid = false;
    }
    if (!inputValidator.isAlphanumeric4to35Char(sanitizedFormData.databaseName)) {
      self.emit('config_error', 'Invalid database name, must be alphanumeric with atleast 4 and no more than 35 characters');
      var valid = false;
    }
    if (!inputValidator.isAlphanumeric4to35Char(sanitizedFormData.databaseUserName)) {
      self.emit('config_error', 'Invalid database username, must be alphanumeric with atleast 4 and no more than 35 characters');
      var valid = false;
    }
    if (!inputValidator.isPassword(sanitizedFormData.databasePassword)) {
      self.emit('config_error', 'Invalid database password, must be atleast 4 characters and contain atleast one number');
      var valid = false;
    }
    if (!inputValidator.isAlphanumeric4to35Char(sanitizedFormData.adminUserName)) {
      self.emit('config_error', 'Invalid admin username, must be alphanumeric with atleast 4 and no more than 35 characters');
      var valid = false;
    }
    if (!inputValidator.isPassword(sanitizedFormData.adminPassword)) {
      self.emit('config_error', 'Invalid admin password, must be atleast 4 characters and contain atleast one number');
      var valid = false;
    }
    if (!inputValidator.is4to35Char(sanitizedFormData.gameName)) {
      self.emit('config_error', 'Invalid game module name, must be alphanumeric with atleast 4 and no more than 35 characters');
      var valid = false;
    }
    if (!inputValidator.isMoveTimeout(sanitizedFormData.gameMoveTimeout)) {
      self.emit('config_error', 'Invalid game move timeout, must be a number of seconds between 0 and 300');
      var valid = false;
    }
    if (!inputValidator.is4to35Char(sanitizedFormData.tournamentName)) {
      self.emit('config_error', 'Invalid tournament name, must be alphanumeric with atleast 4 and no more than 35 characters');
      var valid = false;
    }
    
    //TODO We need to support a time too not just the date
    var tournamentDeadlineDate = inputValidator.parseDate(sanitizedFormData.tournamentDeadline);
    if (!tournamentDeadlineDate) {
      self.emit('config_error', 'Invalid tournament deadline, must have the form dd-mm-yyyy');
      var valid = false;
    }
    else {
      sanitizedFormData.tournamentDeadline = tournamentDeadlineDate;
    }
    return valid;
  }
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
