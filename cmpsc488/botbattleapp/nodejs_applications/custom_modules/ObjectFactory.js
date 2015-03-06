module.exports = {
 // Will be more complicated in the future
    createUserObject : function(username, password) {
      return new (function() {

      })();
    },

function User(username, password) {
      this.username = username;
      this.password = password;
      
}
User.keyFieldName = 'username';
User.newInstance = function(username, password) {
  return new User()
}

drawableRectangle.prototype = Object.create(drawableObject.prototype);
drawableRectangle.prototype.constructor = drawableRectangle;
drawableRectangle.prototype.draw = function(context) {
  context.beginPath();
  context.rect(this.x, this.y, this.width, this.height);
  context.fillStyle = '#8ED6FF';
  context.fill();
  context.lineWidth = this.borderWidth;
  context.strokeStyle = 'black';
  context.stroke();
};

function GameModule(gameName, gameModuleDirectory, rulesFilePath, sourceFilePath, classFilePath, moveTimeout) {
    this.gameName = gameName;
    this.directory = gameModuleDirectory;
    this.rulesFilePath = rulesFilePath;
    this.sourceFilePath = sourceFilePath;
    this.classFilePath = classFilePath;
    this.moveTimeout = moveTimeout;
    this.keyFieldName = 'gameName';
}
GameModule.keyFieldName = 'gameName';
GameModule.newInstance = function(gameName, gameModuleDirectory, rulesFilePath, sourceFilePath, classFilePath, moveTimeout) {
  return new GameModule(gameName, gameModuleDirectory, rulesFilePath, sourceFilePath, classFilePath, moveTimeout);
}

function Tournament(tournamentName, gameName, uploadDeadline, userList, state) {
  this.tournamentName = tournamentName;
  this.gameName = gameName;     // Used as key into the database to get the game module
  this.uploadDeadline = uploadDeadline; //Data have to decide how we want to store it, probably in ticks
  this.userList = userList;     // List of StudentUser objects
  this.state = state;           //{ one of { ‘upload’, ‘running’, ‘private’, ‘public’}
}
Tournament.keyFieldName = 'tournamentName';
Tournament.newInstance = function(tournamentName, gameName, uploadDeadline, userList, state) {
  return new Tournament(tournamentName, gameName, uploadDeadline, userList, state);
}

module.exports.GameModule = GameModule;
module.exports.Tournament= Tournament;


