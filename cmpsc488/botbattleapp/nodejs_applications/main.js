/**
 * The entry point of the application.
 * Run the InitialConfigurationApp, then upon completion run the BotBattleApp
 *
 */
var custom_modules = require('./custom_modules/BotBattlePaths').custom_modules;
var BotBattleServer = require(custom_modules.BotBattleServer);

var initConfigAppServer = (new BotBattleServer()).initAndStartListening(6058);

var initConfigApp = new (require(custom_modules.InitialConfigurationApp))(initConfigAppServer)
  .on('progress_update', function(progress) {
      initConfigAppServer.socketIOEmitToAll('progress_update', progress);
    })
  .on('config_error', function(err) {
      console.log("There was an error during initial configuration\n" + err);
      initConfigAppServer.socketIOEmitToAll('config_error', err);
    })
  .on('status_update', function(status) {
	  initConfigAppServer.socketIOEmitToAll('status_update', status);
  })
  .on('config_success', function(botBattleDatabase) {  // why are we passing the database here?? oh unit test...
      console.log("Initial configuration completed successfully!" );
      //console.log("Heres the BotBattleDatabase\n" + botBattleDatabase);
      
      //botBattleDatabase.insertThenFindUnitTest("thisIsATest");
      
      initConfigAppServer.socketIOEmitToAll('config_success', null);      
      
      // Close the server, then load a new one to serve the botBattleApp
      initConfigAppServer.shutdown(function(err) {
        console.log('InitialConfigurationServer has been shutdown!');
        startBotBattleAppServer();
      });
    });

var botBattleAppServer;
var botBattleApp;

function startBotBattleAppServer(){
	botBattleAppServer = (new BotBattleServer()).initAndStartListening(6058);
    //require(custom_modules.MulticlientPrototype)(botBattleAppServer, botBattleDatabase);
	botBattleApp = (new require(custom_modules.BotBattleApp))(botBattleAppServer)
    // TODO: register new listeners.  set prototype to inherit emmiter like initconfig
    cleanMemory();
} 

function cleanMemory(){
	initConfigAppServer = null;
	initConfigApp = null;
}

// Connect to localhost to test  https://localhost:6058/




