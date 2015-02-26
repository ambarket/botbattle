/**
 * The entry point of the application.
 * Run the InitialConfigurationApp, then upon completion run the BotBattleApp
 */
var BotBattleServer = require('./BotBattleServer');

var initConfigAppServer = (new BotBattleServer()).initAndStartListening(6058);

var initConfigApp = new (require('./InitialConfigurationApp'))(initConfigAppServer)
  .on('progress_update', function(progress) {
      initConfigAppServer.emitOverSocketIO('progress_update', progress);
    })
  .on('config_error', function(err) {
      console.log("There was an error during initial configuration\n" + err.message);
      initConfigAppServer.emitOverSocketIO('config_error', err.message);
    })
  .on('config_success', function(botBattleDatabase) {
      console.log("Initial configuration completed successfully!" );
      //console.log("Heres the BotBattleDatabase\n" + botBattleDatabase);
      
      //botBattleDatabase.insertThenFindUnitTest("thisIsATest");
      
      initConfigAppServer.emitOverSocketIO('config_success', null);      
      
      // Close the server, then load a new one to serve the botBattleApp
      initConfigAppServer.shutdown(function(err) {
        console.log('InitialConfigurationServer has been shutdown!');
        var botBattleAppServer = new BotBattleServer().initAndStartListening(6058);
        require('./botBattleApp')(botBattleAppServer, botBattleDatabase);
      });
    });

// Connect to localhost to test  https://localhost:6058/




