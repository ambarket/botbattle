var paths = require('../../BotBattlePaths');
var path = require('path');
var fileManager = require(paths.custom_modules.FileManager).newInstance();
var logger = require(paths.custom_modules.Logger).newInstance('console');
var compiler = new (require(paths.custom_modules.BotBattleCompiler));

var BotBattleAppHelpers = require(paths.BotBattleApp_sub_modules.Helpers);


module.exports = {
    /**
     * This is weird but its the only way I could find to unset the message while still sending it.
     * @param session
     * @returns {object} deep copy of session.locals
     */
    copyLocalsAndDeleteMessage : function(session) {
      var retval = {}
      for (var key in session.locals) {
        retval[key] = session.locals[key];
      }
      session.locals.message = null;
      session.locals.id = null;
      return retval;
    },
    
    getLogMessageAboutGame : function(gameId, message) {
      return gameId + " - " + message;
    },
    
    getLogMessageAboutPlayer : function(gameId, playerNum, message) {
      return this.getLogMessageAboutGame(gameId, "Player " + playerNum + " : " + message);
    }

}