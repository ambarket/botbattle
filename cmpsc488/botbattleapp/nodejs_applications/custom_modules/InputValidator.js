function InputValidator() {
  var ipAddressRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
  var hostnameRegex = "^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$";
  var passwordRegex = /^(?=.*\d).{4,16}$/; // 4 to 16 characters with atleast one numeric digit
  var alphanumericRegex = /^([0-9A-Za-z]{4,35})$/;
  var moveTimeoutRegex = /^(\d|[1-9]\d|[1-2]\d\d|[3][0][0])$/; // 0 - 300
  var portNumberRegex = /^(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|[1-5]\d\d\d\d|[6][0-5][0-5][0-3][0-6])$/; //0 - 65536
  var gameModuleSourceRegex = "Game.java";
  
  var fourToThirtyFiveCharRegex = /^(.{4,35})$/
    
  this.isIPAddressOrHostName = function(string) {
    return (string.match(ipAddressRegex) || string.match(hostnameRegex));
  }
  
  this.isPortNumber = function(string) {
    return (string.match(portNumberRegex));
  }
  
  this.isCorrectGameName = function(string){
    return (string.match(gameModuleSourceRegex));
  }
  
  //TODO Make this use a better password regex. Kept it as alphanumeric so it works with the database password we've been using
  this.isPassword = function(string) {
    return (string.match(alphanumericRegex));
  }
  
  this.isAlphanumeric4to35Char = function(string) {
    return string.match(alphanumericRegex);
  }
  
  this.isMoveTimeout = function(string) {
    return string.match(moveTimeoutRegex);
  }
  
  this.is4to35Char = function(string) {
    return string.match(fourToThirtyFiveCharRegex);
  }
  
  // Returns false if its not a valid date
  // Accepts all these formats, must be day then month, then year
  // "13-09-2011", 
  // "13.09.2011",
  // "13/09/2011",
  // "08-08-1991",
  this.parseDate = function(str) {    
    // Try day-month-year
    var parms = str.split(/[\.\-\/]/);
    var yyyy = parseInt(parms[2],10);
    var mm   = parseInt(parms[1],10);
    var dd   = parseInt(parms[0],10);
    var date = new Date(yyyy,mm-1,dd,0,0,0,0);
    if (mm === (date.getMonth()+1) && dd === date.getDate() && yyyy === date.getFullYear()) {
      return date;
    }
    else {
      // Try year-month-day
      var parms = str.split(/[\.\-\/]/);
      var yyyy = parseInt(parms[0],10);
      var mm   = parseInt(parms[1],10);
      var dd   = parseInt(parms[2],10);
      var date = new Date(yyyy,mm-1,dd,0,0,0,0);
      if (mm === (date.getMonth()+1) && dd === date.getDate() && yyyy === date.getFullYear()) {
        return date;
      }
      else {
        // Try month-day-year
        var parms = str.split(/[\.\-\/]/);
        var yyyy = parseInt(parms[2],10);
        var mm   = parseInt(parms[0],10);
        var dd   = parseInt(parms[1],10);
        var date = new Date(yyyy,mm-1,dd,0,0,0,0);
        if (mm === (date.getMonth()+1) && dd === date.getDate() && yyyy === date.getFullYear()) {
          return date;
        }
        else {
          return false;
        }
      }
    }
  }
}

module.exports = InputValidator;
module.exports.newInstance = function() {
  return new InputValidator();
}