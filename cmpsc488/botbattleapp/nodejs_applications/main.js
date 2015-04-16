/**
 * The entry point of the application.
 * Run the InitialConfigurationApp, then upon completion run the BotBattleApp
 *
 */

var port = process.argv[2] || 6058;

var paths = require('./custom_modules/BotBattlePaths');
var BotBattleServer = require(paths.custom_modules.BotBattleServer);
var fileManager = require(paths.custom_modules.FileManager).newInstance();
var logger = require(paths.custom_modules.Logger).newInstance('console');

fileManager.parseConfigurationFile(function(err, config) {
  if (err) {
    logger.log(err.message);
    logger.log('initialConfig', "No valid configuration file found, running initial configuration at https://localhost:" + port);
    runInitialConfiguration();
  }
  else {
    logger.log('initialConfig', "Successfuly read configuration file at " + paths.configuration_file);
    
    var BotBattleDatabase = require(paths.custom_modules.BotBattleDatabase);
    var database = new BotBattleDatabase(config.databaseHost,
        config.databasePort, config.databaseName,
        config.databaseUserName, config.databasePassword);

    database.connectToExistingDatabase(function(err) {
      if (!err) {
        logger.log('initialConfig', "Successfully connected to the database found in the configuration file");
        runBotBattleApp(database);
      }
      else {
        logger.log('initialConfig', "Error connecting to the database found in the configuration file", err);
      }
    });
  }
})

var initConfigMessageQueue = [];
function runInitialConfiguration() {
  var initConfigAppServer = (new BotBattleServer()).initAndStartListening(port);
  
  initConfigAppServer.addDynamicRoute('get', '/getLatestInitConfigMessage', function(req,res) {
    var firstInitConfigMessage = initConfigMessageQueue.shift(); // remove first, if empty, this will be undefined
    if (firstInitConfigMessage) {
      res.json(firstInitConfigMessage);
    }
    else {
      res.json({ 'event' : 'noMessages' });
    }
  });
  
  var initConfigApp = new (require(paths.custom_modules.InitialConfigurationApp))(initConfigAppServer)
    .on('progress_update', function(progress) {
        //initConfigAppServer.socketIOEmitToAll('progress_update', progress);
        initConfigMessageQueue.push({ "event" : "progress_update", "data" : progress});
      })
    .on('config_error', function(err) {
        logger.log("There was an error during initial configuration...\n" + err);
       // initConfigAppServer.socketIOEmitToAll('config_error', err);
        initConfigMessageQueue.push({ "event" : "config_error", "data" : err});
      })
    .on('status_update', function(status) {
        //initConfigAppServer.socketIOEmitToAll('status_update', status);
        initConfigMessageQueue.push({ "event" : "status_update", "data" : status});
    })
    .on('reset_form', function() {
        //initConfigAppServer.socketIOEmitToAll('reset_form');
        initConfigMessageQueue.push({ "event" : "reset_form"});
    })
    .on('config_success', function(database) {
        logger.log("Initial configuration completed successfully!" );
        
        //initConfigAppServer.socketIOEmitToAll('config_success', null);    
        initConfigMessageQueue.push({ "event" : "config_success"});
        
        // Close the server, then load a new one to serve the botBattleApp
        initConfigAppServer.shutdown(function(err) {
          logger.log('initialConfig','The initial configuration server has been shutdown!');
          runBotBattleApp(database);
          // Probably not even be necessary now that these are defined locally in this function
          initConfigAppServer = null;
		  initConfigApp = null;
        });
      });
}

function runBotBattleApp(database) {
  logger.log('httpsServer', "Running Bot!Battle! at https://localhost:" + port);
  fileManager.deleteInitConfigTmp(function(){});
  fileManager.deleteTestArenaTmp(function(){
    var botBattleAppServer = new BotBattleServer().initAndStartListening(port);
    var botBattleApp = (new require(paths.custom_modules.BotBattleApp))(botBattleAppServer, database);
     // TODO: register new listeners.  set prototype to inherit emmiter like initconfig
  });
}

