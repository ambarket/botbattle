module.exports = {
 // Will be more complicated in the future
    createUserObject : function(username, password) {
      return new (function() {
        this.username = username;
        this.password = password;
      })();
    },

    createGameModuleObject : function(gameName, gameModuleDirectory, rulesLocation, sourceFileLocation, classFileLocation, moveTimeout) {
      return new (function() {
        this.gameName = gameName;
        this.gameModuleDirectory = gameModuleDirectory;
        this.rulesLocation = rulesLocation;
        this.sourceFileLocation = sourceFileLocation;
        this.classFileLocation = classFileLocation;
        this.moveTimeout = moveTimeout;
      })();
    }

}