function User(username, password, group) {
      this.username = username;
      this.password = password; 
      this.group = group;
}
User.keyFieldName = 'username';
User.newInstance = function(username, password, group) {
  return new User(username, password, group);
};

function GameModule(gameName, gameModuleDirectories, rulesFilePath, javascriptFilePath)  {
    this.gameName = gameName;
    this.directories = gameModuleDirectories;
    this.rulesFilePath = rulesFilePath;
    this.javascriptFilePath = javascriptFilePath;
}
GameModule.keyFieldName = 'gameName';
GameModule.newInstance = function(gameName, gameModuleDirectories, rulesFilePath, javascriptFilePath)  {
  return new GameModule(gameName, gameModuleDirectories, rulesFilePath, javascriptFilePath);
};

function Tournament(tournamentName, tournamentDirectory, gameName, uploadDeadline, usersArray, state) {
  this.tournamentName = tournamentName;
  this.directory = tournamentDirectory;
  this.gameName = gameName;     // Used as key into the database to get the game module
  this.uploadDeadline = uploadDeadline; //Data have to decide how we want to store it, probably in ticks
  this.usersArray = usersArray;     // Array of User objects
  this.state = state;           //{ one of { ‘upload’, ‘running’, ‘private’, ‘public’}
}
Tournament.keyFieldName = 'tournamentName';
Tournament.newInstance = function(tournamentName, tournamentDirectory, gameName, uploadDeadline, userList, state) {
  return new Tournament(tournamentName, tournamentDirectory, gameName, uploadDeadline, userList, state);
};

module.exports.User = User;
module.exports.GameModule = GameModule;
module.exports.Tournament= Tournament;