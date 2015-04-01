var paths = require('../../BotBattlePaths');
var path = require('path');

var BotBattleAppHelpers = require(paths.BotBattleApp_sub_modules.Helpers);

module.exports = {
  registerRoutes : function(server, database) {
    server.addDynamicRoute('get', '/adminPortal', function(req, res) {
      if (req.user) {
        if (req.user.group == 'admin') {
          var locals = BotBattleAppHelpers.copyLocalsAndDeleteMessage(req.session);
          res.render(paths.static_content.views + 'pages/adminPortal', { 'locals' : locals});
        }
        else {
          req.session.locals.message = { 'type' : 'error', 'text' : "Sorry, you don't have permission to access the admin portal" };
          res.redirect('/');
        }
        
      }
      else {
        req.session.locals.message = { 'type' : 'error', 'text' : "Sorry, you don't have permission to access the admin portal"};
        res.redirect('/');
      }
    });
  }
}