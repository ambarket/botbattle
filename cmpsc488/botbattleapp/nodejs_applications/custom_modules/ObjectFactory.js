module.exports = {
 // Will be more complicated in the future
    createUserObject : function(username, password) {
      return new (function() {
        this.username = username;
        this.password = password;
      })();
    },

    createGameModuleObject : function(gameName, rulesLocation, classFileLocation, moveTimeout) {
      return new (function() {
        this.gameName = gameName;
        this.rulesLocation = rulesLocation;
        this.classFileLocation = classFileLocation;
        this.moveTimeout = moveTimeout;
      })();
    }

}