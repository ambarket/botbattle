/**
 * The entry point of the application.
 * Run the InitialConfigurationApp, then upon completion run the BotBattleApp
 *
 */
var paths = require('./custom_modules/BotBattlePaths');

var BotBattleServer = require(paths.custom_modules.BotBattleServer);

var fileManager = require(paths.custom_modules.FileManager).newInstance();
var logger = require(paths.custom_modules.Logger).newInstance('console');

fileManager.parseConfigurationFile(function(err, config) {
  if (err) {
    logger.log("No configuration file found, running initial configuration at https://localhost:6058");
    runInitialConfiguration();
  }
  else {
    logger.log("Successfuly read configuration file at " + paths.configuration_file);
    
    var BotBattleDatabase = require(paths.custom_modules.BotBattleDatabase);
    var database = new BotBattleDatabase(config.databaseHost,
        config.databasePort, config.databaseName,
        config.databaseUserName, config.databasePassword);

    database.connectToExistingDatabase(function(err) {
      if (!err) {
        logger.log("Successfully connected to the database found in the configuration file");
        logger.log("Running Bot!Battle! at https://localhost:6058");
        runBotBattleApp(database);
      }
      else {
        logger.log("Error connecting to the database found in the configuration file");
        logger.log(err)
      }
    });
  }
})

function runInitialConfiguration() {
  var initConfigAppServer = (new BotBattleServer()).initAndStartListening(6058);

  var initConfigApp = new (require(paths.custom_modules.InitialConfigurationApp))(initConfigAppServer)
    .on('progress_update', function(progress) {
        initConfigAppServer.socketIOEmitToAll('progress_update', progress);
      })
    .on('config_error', function(err) {
        logger.log("There was an error during initial configuration...\n" + err);
        initConfigAppServer.socketIOEmitToAll('config_error', err);
      })
    .on('status_update', function(status) {
        initConfigAppServer.socketIOEmitToAll('status_update', status);
    })
    .on('reset_form', function() {
        initConfigAppServer.socketIOEmitToAll('reset_form');
    })
    .on('config_success', function(database) {
        logger.log("Initial configuration completed successfully!" );
        
        initConfigAppServer.socketIOEmitToAll('config_success', null);      
        
        // Close the server, then load a new one to serve the botBattleApp
        initConfigAppServer.shutdown(function(err) {
          console.log('The initial configuration server has been shutdown!');
          logger.log("Running Bot!Battle! at https://localhost:6058");
          runBotBattleApp(database);
        });
      });
}
function runBotBattleApp(database) {
  fileManager.deleteInitConfigTmp(function(){});
  var botBattleAppServer = new BotBattleServer().initAndStartListening(6058);
  require('./test_arena_prototype/testArenaPrototype')(botBattleAppServer, database);
}

// Connect to localhost to test  https://localhost:6058/




