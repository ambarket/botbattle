var paths = require('../BotBattlePaths');
var path = require('path');

var helpers = require(paths.BotBattleApp_sub_modules.Helpers);
var fileManager = require(paths.custom_modules.FileManager).newInstance();
var logger = require(paths.custom_modules.Logger).newInstance();
var testArenaInstances = require(paths.BotBattleApp_sub_modules.TestArenaInstances);

function BotBattleApp(server, database) {
	var self = this;
	
	Date.prototype.addHours= function(h){
	    this.setHours(this.getHours()+h);
	    return this;
	}
	
	Date.prototype.addMinutes= function(m){
      this.setMinutes(this.getMinutes()+m);
      return this;
    }
	
	Date.prototype.addSeconds= function(s){
      this.setSeconds(this.getSeconds()+s);
      return this;
    }


	//require(paths.BotBattleApp_sub_modules.Login).registerRoutes(server, database);
	require(paths.BotBattleApp_sub_modules.StudentPortal).registerRoutes(server, database);
	require(paths.BotBattleApp_sub_modules.AdminPortal).registerRoutes(server, database);
	
	require(paths.BotBattleApp_sub_modules.TestArenaBotUpload).registerRoutes(server, database);
	   
	registerGameResourceRoutes(server, database);
	registerTestArenaRoutes(server, database);
}


var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(BotBattleApp, EventEmitter);

module.exports = BotBattleApp;

function registerGameResourceRoutes(server, database) {
  
  server.addDynamicRoute('get', /^\/game\/(.*)\/resources/, function(req, res) {
    // To get the filePath just strip /game/ off and append to game_modules directory.
    // Split into components based on forward slash. 
    //    urlComponents[0] will always be '' because of leading forward slash
    //    urlComponents[1] will always be 'game'
    //    urlComponents[2] is the game name.
    //    urlComponents[3] is always 'resources'
    //    The rest is the path to the requested resource
    var urlComponents = req.url.split("/"); 
    
    database.queryGameModule(urlComponents[2], function(err, gameModule) {
      if (err) {
        logger.log("BotBattleApp", "Error while querying for game module with name", + urlComponents[2], err.message);
        res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
      }
      else {
        if (!gameModule) {
          logger.log("BotBattleApp", "Failed to serve resource file for game " + urlComponents[2] + " because no game module was found under that name.");
          res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
        }
        else {
          if (!gameModule.directories.resources) {
            logger.log("BotBattleApp", "Failed to serve resource file for game", urlComponents[2], 
                "because no resource directory was not defined in the game module's database entry\n", gameModule);
            res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
          }
          else {
            var filenameStartIndex = req.url.indexOf('resources/') + 10;    // 10 characters in 'resources/'
            var filename = req.url.substring(filenameStartIndex);
            if (!filename || filenameStartIndex === 9 /*It was -1 before adding 10*/) {
              res.status(404).end("The requested resource does not exist.");
              return;
            }
            res.sendFile(filename, { root: gameModule.directories.resources }, function (err) {
              if (err) {
                if (err.code === "ECONNABORT" && res.statusCode == 304) {
                  // No problem, 304 means client cache hit, so no data sent.
                  logger.log("BotBattleApp", "Failed to serve request for", req.url, " 304 client cache hit.", err);
                  return;
                }
                logger.log("BotBattleApp", "Failed to serve request for", req.url, ".", err, " (status: " + err.status + ")");
                if (err.status) {
                  res.status(err.status).end("Failed to find the requested resource. Please see your administrator if this problem persists.");
                }
                else {
                  res.status(404).end("Failed to find the requested resource. Please see your administrator if this problem persists.");
                }
              }
            });
          }
        }
      }
    });
  });
  


  server.addDynamicRoute('get', /^\/game\/(.*)\/rules$/, function(req, res) {
    // To get the filePath just strip /game/ off and append to game_modules directory.
    // Split into components based on forward slash. 
    //    urlComponents[0] will always be '' because of leading forward slash
    //    urlComponents[1] will always be 'game'
    //    urlComponents[2] is the game name.
    //    urlComponents[3] is always 'rules'
    var urlComponents = req.url.split("/"); 
    
    database.queryGameModule(urlComponents[2], function(err, gameModule) {
      if (err) {
        logger.log("BotBattleApp", "Error while querying for game module with name", + urlComponents[2], err.message);
        res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
      }
      else {
        if (!gameModule) {
          logger.log("BotBattleApp", "Failed to serve rules file for game " + urlComponents[2] + " because no game module was found under that name.");
          res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
        }
        else {
          if (!gameModule.rulesFilePath) {
            logger.log("BotBattleApp", "Failed to serve rules file for game", urlComponents[2], 
                "because its path was not defined in the game module's database entry\n", gameModule);
            res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
          }
          else {
            res.sendFile(gameModule.rulesFilePath, function (err) {
              if (err) {
                if (err.code === "ECONNABORT" && res.statusCode == 304) {
                  // No problem, 304 means client cache hit, so no data sent.
                  logger.log("BotBattleApp", "Failed to serve request for", req.url, " 304 client cache hit.", err);
                  return;
                }
                logger.log("BotBattleApp", "Failed to serve request for", req.url, ".", err, " (status: " + err.status + ")");
                if (err.status) {
                  res.status(err.status).end("Failed to find the requested resource. Please see your administrator if this problem persists.");
                }
                else {
                  res.status(404).end("Failed to find the requested resource. Please see your administrator if this problem persists.");
                }
              }
            });
          }
        }
      }
    });
  });
  
  server.addDynamicRoute('get', /^\/game\/(.*)\/javascript$/, function(req, res) {
    // To get the filePath just strip /game/ off and append to game_modules directory.
    // Split into components based on forward slash. 
    //    urlComponents[0] will always be '' because of leading forward slash
    //    urlComponents[1] will always be 'game'
    //    urlComponents[2] is the game name.
    //    urlComponents[3] is always 'javascript'
    var urlComponents = req.url.split("/"); 
    
    database.queryGameModule(urlComponents[2], function(err, gameModule) {
      if (err) {
        logger.log("BotBattleApp", "Error while querying for game module with name", + urlComponents[2], err.message);
        res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
      }
      else {
        
        if (!gameModule) {
          logger.log("BotBattleApp", "Failed to serve javascript file for game " + urlComponents[2] + " because no game module was found under that name.");
          res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
        }
        else {
          if (!gameModule.javascriptFilePath) {
            logger.log("BotBattleApp", "Failed to serve javascript file for game", urlComponents[2], 
                "because its path was not defined in the game module's database entry\n", gameModule);
            res.status(404).send("Failed to find the requested resource. Please see your administrator if this problem persists.");
          }
          else {
            res.sendFile(gameModule.javascriptFilePath, function (err) {
              if (err) {
                if (err.code === "ECONNABORT" && res.statusCode == 304) {
                  // No problem, 304 means client cache hit, so no data sent.
                  logger.log("BotBattleApp", "Failed to serve request for", req.url, " 304 client cache hit.", err);
                  return;
                }
                logger.log("BotBattleApp", "Failed to serve request for", req.url, ".", err, " (status: " + err.status + ")");
                if (err.status) {
                  res.status(err.status).end("Failed to find the requested resource. Please see your administrator if this problem persists.");
                }
                else {
                  res.status(404).end("Failed to find the requested resource. Please see your administrator if this problem persists.");
                }
              }
            });
          }
        }
      }
    });
  });
}


// TODO: if we ever go into a branch on a route that has an error we must always res.end() or send() or the client hangs
function registerTestArenaRoutes(server, database) {
  
  /**
   * Requested the test arena page is refreshed or a link is followed out
   * i.e. when the page is reloaded.
   */
  server.addDynamicRoute('get', '/deleteTestArenaInstance', function(req, res) {
    res.end(); // This is only called after navigating away from the page. No point in sending anything.
    testArenaInstances.deleteTestArenaInstanceAndGameForId(req.query.id);
  });
  
  /**
   * Requested the test arena page is requested
   */
  server.addDynamicRoute('get', '/', function(req, res) {
    // Grab the game module from the DB, to know which client javascript file to render into the test arena page.
    // To support multiple tournaments, this route would need to present a list of game modules to the client, then
    //  in another route, after receiving their selection you grab the game module and send them the rendered testArena.ejs
    database.queryForSystemGameModule(function(err, gameModule) {
      if (err) {
        logger.log("BotBattleApp", 
            helpers.getLogMessageAboutGame("NotCreatedYet", "Failed to load test arena because system game module couldn't be found: ", err.message));
        res.status(500).send("An unexpected error occured while loading the test arena. Please see your administrator if this problem persists.");
      }
      else {
        
        var locals = helpers.copyLocalsAndDeleteMessage(req.session);
        locals.gameJavascriptUrl = "/game/" + gameModule.gameName + "/javascript";
        locals.gameRulesUrl = "/game/" + gameModule.gameName + "/rules";
        res.render(paths.static_content.views + 'pages/testArena', { 'locals' : locals});
      }
    });
  });

  server.addDynamicRoute('get', '/getAllSharedInstanceIds', function(req, res) {
    // Returns a set of id's that have bots uploaded that are not the same id as the req.id
    var idArray = testArenaInstances.getAllSharedInstanceIds();
    res.json({ 'event' : 'success', 'data' : idArray });
  });

  server.addDynamicRoute('get', '/startGame', function(req, res) {
    // Returns a event code from the set { 'expiredID', 'gameAlreadyRunning', 'gameManagerNotFound', 'success' }
    // These will be handled on the client side accordingly.
    var event = testArenaInstances.spawnNewGameInstance(req.query.id);
    res.json({ 'event' : event });
  });
  
  server.addDynamicRoute('get', '/sendMove', function(req, res) {
    // Returns a event code from the set { 'expiredID', 'noGameRunning', 'notExpectingHumanInput', 'success' }
    // These will be handled on the client side accordingly.
    var event = testArenaInstances.sendMoveToGameInstanceById(req.query.id, req.query.move);
    res.json({ 'event' : event });
  });
  
  /**
   * Requested the test arena client clicks Kill Game
   */
  // Currently the only reason this would return an error is an invalidID
  // TODO: It seems like killSpawnedGameForID still has some TODOs
  //    If anything changes there may have to change this too.
  server.addDynamicRoute('get', '/killCurrentGame', function(req, res) {
    var id = req.query.id;
    var event = testArenaInstances.killSpawnedGameForId(id);
    res.json({ 'event' : event });
  });
 
  
  server.addDynamicRoute('get', '/getLatestGameStates', function(req,res) {
    var latestGameStateArray = testArenaInstances.popAllFromGameStateQueue(req.query.id);
    if (latestGameStateArray) {
      if (testArenaInstances.isGameManagerRunning(req.query.id) || latestGameStateArray.length > 0) {
        res.json(
            { 'event' : 'success',
              'data' : latestGameStateArray,
              'millisecondsUntilExpiration' : testArenaInstances.getMillisecondsBeforeInstanceExpires(req.query.id)
            });
      }
      else {
        return res.json({ 'event' : 'noStatesRemaining' });
      }
    }
    // popAllFromGameStateQueue returns null if the instance has expired.
    else {
      res.json({ 'event' : 'expiredID' });
    }
  });
  
}


