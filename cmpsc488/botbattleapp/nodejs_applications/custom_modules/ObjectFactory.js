module.exports = {
 // Will be more complicated in the future
    createUserObject : function(username, password) {
      return new (function() {
        this.username = username;
        this.password = password;
        this.keyFieldName = 'username';
      })();
    },

    createGameModuleObject: function(gameName, gameModuleDirectory, rulesFilePath, sourceFilePath, classFilePath, moveTimeout) {
      return new (function() {
        var self = this;
        this.gameName = gameName;
        this.directory = gameModuleDirectory;
        this.rulesFilePath = rulesFilePath;
        this.sourceFilePath = sourceFilePath;
        this.classFilePath = classFilePath;
        this.moveTimeout = moveTimeout;
        this.keyFieldName = 'gameName';
      })();
    }
}