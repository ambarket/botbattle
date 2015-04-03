

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
    }
}