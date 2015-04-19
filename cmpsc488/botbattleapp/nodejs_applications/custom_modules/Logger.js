// Created this to use instead of logger.log. Idea is that this will be more complicated later and
//  will support logging to files and stuff

// A mapping of categories (can be sent as first argument to logger.log method)
//  to an array of destinations. Will be extended in the future to support files as well.
//  current supports 'console'.
//  If the first argument to logger.log is not one of these categories, 'general will be applied.
var categoryDestinations = {
    general : ['ignore'],
    database : ['ignore'],
    session : ['ignore'],
    fileManager : ['console'],
    InitialConfigurationApp : ['console'],
    httpsServer : ['console'],
    BotBattleCompiler : ['console'],
    BotBattleApp : ['console'],
    TestArenaBotUpload : ['console'],
    TestArenaInstances : ['console']
}
  
function Logger() {
  /**
   * First argument can be the category of the message. If not, the 'general' category will be applied.
   */
  this.log = function() {
    
    var message = "";
    var category = arguments[0];
    if (categoryDestinations[category]) {
      if (categoryDestinations[category].indexOf('ignore') !== -1) {
        return;
      }
      else {
        message += " " + category + ":";
      }
    }
    else {
      message += " " + "general" + ": " + arguments[0];
    }
    
    arguments[0] = Datemessage;
    
    if(console){
      console.log.apply(console, arguments);
    }

  }
};
module.exports = Logger;
module.exports.newInstance = function() {
  return new Logger();
}
