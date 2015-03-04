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
    // Create sub directory in Game Modules
        // Save the Game.java file
        // Save the rules.pdf file

    // Compile the Game Module (resulting .class should stay in the Game Module
    // sub directory)
    
    // Store an entry in the DB for the Game Module

		self.emit('progress_update', 60);
    callback(null);
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
	  
	// multer needs to be added here for security reasons
    initConfigAppServer.addDynamicRoute('post', '/processInitialConfiguration', function(req, res) {
      console.log(JSON.stringify(req.body));
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
        gameModule: sanitizer.sanitize(req.body.gameModule),
        gameRules: sanitizer.sanitize(req.body.gameRules),
        //tournament parameters
        tournamentName: sanitizer.sanitize(req.body.tournamentName),
        studentList: sanitizer.sanitize(req.body.studentList),
        tournamentDeadline: sanitizer.sanitize(req.body.tournamentDeadline), 
      };
      console.log(JSON.stringify(sanitizedFormData));
      console.log(req.files);

      executeAllInitialConfigurationTasksInSequence();
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