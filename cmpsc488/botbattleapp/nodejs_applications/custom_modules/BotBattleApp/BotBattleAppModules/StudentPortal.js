var paths = require('../../BotBattlePaths');
var path = require('path');

var BotBattleAppHelpers = require(paths.BotBattleApp_sub_modules.Helpers);

module.exports = {
  registerRoutes : function(server, database) {
    server.addDynamicRoute('get', '/studentPortal', function(req, res) {
      if (req.user) {
        if (req.user.group == 'student') {
          var locals = BotBattleAppHelpers.copyLocalsAndDeleteMessage(req.session);
          res.render(paths.static_content.views + 'pages/studentPortal', { 'locals' : locals});
        }
        else {
          req.session.locals.message = { 'type' : 'error', 'text' : "Sorry, admins don't have a student portal"};
          res.redirect('/');
        }
      }
      else {
        req.session.locals.message = { 'type' : 'error', 'text' : "Sorry, you don't have permission to access the student portal"};
        res.redirect('/');
      }
    });
  }
}

