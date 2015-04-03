var paths = require('../../BotBattlePaths');
var path = require('path');

var BotBattleAppHelpers = require(paths.BotBattleApp_sub_modules.Helpers);

module.exports = {
  'registerRoutes' : function(server, database) {
    var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
    
    passport.use(new LocalStrategy(
        function(username, password, done) {
          database.queryAllUsers(username, function(err, user) {
            if (err) { return done(err, false, 'An error occured during verification'); }
            if (!user || !user.password === password) {
              return done(null, false,  { 'type' : 'error', 'text' : 'Incorrect username or password' });
            }
            if (!user.password === password) {
              return done(null, false, { 'type' : 'error', 'text' : 'Incorrect username or password' });
            }
            if (!user.group) {
              return done(null, false, { 'type' : 'error', 'text' : 'Valid username and password but no group' });
            }
            
            return done(null, user, { 'type' : 'success', 'text' : 'Login successful'});
          });
        }
      ));
    
    passport.serializeUser(function(user, done) {
      done(null, user.username);
    });

    passport.deserializeUser(function(username, done) {
      database.queryAllUsers(username, function(err, user) {
        done(err, user);
      });
    });
    

    server.addDynamicRoute('get', '/login', function(req, res) {
      var locals = BotBattleAppHelpers.copyLocalsAndDeleteMessage(req.session);
      res.render(paths.static_content.views + 'pages/login', { 'locals' : locals});
    });

    
    server.addDynamicRoute('post', '/verify_login', function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
          req.session.locals.message = info;
          if (err) { 
            //return res.redirect('/login'); 
            return next(err); 
          }
          if (!user) { 
            return res.redirect('/login'); 
          }
          req.logIn(user, function(err) {
            if (err) { 
              return next(err); 
            }
            req.session.locals.username = req.user.username;
            req.session.locals.group = req.user.group;
            
            if (user.group === 'admin') {
              return res.redirect('/adminPortal');
            }
            if (user.group === 'student') {
              return res.redirect('/studentPortal');
            }
            
          });
        })(req, res, next);
    });
    
    server.addDynamicRoute('get', '/logout', function(req, res) {
      req.logout();
      
      req.session.regenerate(function(err) {
        req.session.locals = {};
        req.session.locals.message = { 'type' : 'success', 'text' : 'Successfully logged out'};
        res.redirect('/');
      });
    });
  }
}

  