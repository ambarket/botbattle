module.exports = {
 // Will be more complicated in the future
    createUserObject : function(username, password) {
      return new (function() {
        this.username = username;
        this.password = password;
      })()
    }
}