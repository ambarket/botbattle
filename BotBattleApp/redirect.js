/**
 * The entry point of the application.
 * Run the InitialConfigurationApp, then upon completion run the BotBattleApp
 *
 */


var port = process.argv[2] || 6058;

var BotBattleServer = require(__dirname + "/custom_modules/BotBattleServer");

    var redirectServer = new BotBattleServer().initAndStartListening(port);

    redirectServer.addDynamicRoute('GET', '/', function(req, res) {
        console.log("here");
       res.send("Bot!Battle! hosting has been moved exclusively to <a href='https://ambarket.info:8001'> here </a>"); 
    });
