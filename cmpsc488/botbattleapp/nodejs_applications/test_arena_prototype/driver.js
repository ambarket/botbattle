/**
 * The entry point of the application.
 * Run the InitialConfigurationApp, then upon completion run the BotBattleApp
 */
var BotBattleServer = require('../custom_modules/BotBattleServer');

var server = new BotBattleServer().initAndStartListening(6058);
require('./testArenaPrototype')(server);