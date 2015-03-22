var paths = require('./BotBattlePaths');
  
function BotBattleApp(server, database) {
	var self = this;
	
	registerTestArenaRoutes(server);
	registerLoginRoutes(server, database);
}


var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(BotBattleApp, EventEmitter);

module.exports = BotBattleApp;


// write cleanup function that checks the timeout and connection existance (if possible) of the session object then
//  removes the files and games if not valid anymore incase of error or crash or something.


function verifyAllFieldsWereSubmitted(sanitizedFormData) {
  var valid = true;
  for (fieldName in sanitizedFormData) {
    // Apparently the JSON parser turns undefined form submissions into the string 'undefined' so have to check for it
    if (!sanitizedFormData[fieldName] || sanitizedFormData[fieldName] === 'undefined') {
      valid = false;
    }
  }
  return valid;
}

function registerLoginRoutes(server, database) {
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
    var locals = copyLocalsAndDeleteMessage(req.session);
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
  
  server.addDynamicRoute('get', '/adminPortal', function(req, res) {
    if (req.user) {
      if (req.user.group == 'admin') {
        var locals = copyLocalsAndDeleteMessage(req.session);
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
  
  server.addDynamicRoute('get', '/studentPortal', function(req, res) {
    if (req.user) {
      if (req.user.group == 'student') {
        var locals = copyLocalsAndDeleteMessage(req.session);
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
  
  server.addDynamicRoute('get', '/logout', function(req, res) {
    req.logout();
    
    req.session.regenerate(function(err) {
      req.session.locals = {};
      req.session.locals.message = { 'type' : 'success', 'text' : 'Successfully logged out'};
      res.redirect('/');
    });
  });
  
}

/**
 * This is weird but its the only way I could find to unset the message while still sending it.
 * @param session
 * @returns {object} deep copy of session.locals
 */
function copyLocalsAndDeleteMessage(session) {
  var retval = {}
  for (var key in session.locals) {
    retval[key] = session.locals[key];
  }
  session.locals.message = null;
  session.locals.id = null;
  return retval;
}

function registerTestArenaRoutes(server) {
  var paths = require('./BotBattlePaths');
  var path = require('path');
  var fileManager = new (require(paths.custom_modules.FileManager));
  
  var testArenaInstances = {};
  
  server.addDynamicRoute('get', '/', function(req, res) {
  	var id = require('shortid').generate();
  	  
  	var newInstance = { 
  	  'gameProcess' : null,
  	  'state' : 'stopped',
  	  'timoutToDelete' : 'tomorrow'
  	};
  	  
  	if (!testArenaInstances[req.session.id]) {
  	  testArenaInstances[req.session.id] = { };  
  	  fileManager.createDirectoryForTestArenaSession(req.session.id, function(err, result){
  	    if(err){
  	      console.log(err);
  	    }
  	    console.log(result);
  	  })
  	}
  	
  	testArenaInstances[req.session.id][id] = newInstance;
  	fileManager.createDirectoryForTestArenaTab(req.session.id, id, function(err, result){
      if(err){
        console.log(err);
      }
      console.log(result);
    })
    
  	console.log("Current session\n",testArenaInstances[req.session.id]);
  	  
  	req.session.locals.id = id;
  	var locals = copyLocalsAndDeleteMessage(req.session);
  	
  	//console.log(locals.id);
  	res.render(paths.static_content.views + 'pages/testArena', { 'locals' : locals});
  });
  
  
  //server.addDynamicRoute('get', '/', function(req, res) {
    // Everytime the page is refreshed, we want a whole new session. (Original comment for the below code)
    //   This fails because it replaces the session of all other existing tabs
    //   with this new one. It seems the only way to keep track of multiple browser
    //   tabs associated with separate server side data is to use our own tracking 
    //   mechanism. There are some sources that site making cookies and or HTML5 session storage
    //   work for this. e.g. https://sites.google.com/site/sarittechworld/track-client-windows
    //   but I think it makes for sense for us to just implement our own way similar to what
    //   was done in SocketIOConnectionTracker. 
    //   The other obvious though is to just allow on connection to the server from each browser,
    //   however to implement this you have to keep track of things yourself anyway. Below I tried complaining
    //   if there was already a cookie set but this fails for reloading the page in a single tab.
    
    /*req.session.regenerate(function(err) {
       console.log(req.session.id, req.cookies['connect.sid']);
       // res.cookie('rememberme', 'yes', { maxAge: 900000, httpOnly: true});
        console.log(req.session);
        req.session.views = 1234;
        //console.log(req.sessionId);
        //if (!req.cookies['connect.sid']) {
          res.sendFile(path.resolve(paths.static_content.html, 'testArena.html'));
        //}
        //else {
        //  res.send("Sorry you already have an open session");
        //}
     });*/
  //  res.sendFile(path.resolve(paths.static_content.html, 'testArena.html'));
  //});
  
  
  /**
   * Requested by the "Play Game" Button on the test arena page
   */
  server.addDynamicRoute('post', '/playNewGame', function(req, res) {
    // Make choose file buttons submit the form only if they are the second one to upload the bot.
    //  This way we clean up half of this to be in another route and play game stays just play game
    // and also you can play another game when one finishes without uploading nbew bots';
    
    // 1) Ensure any previous Game Manager instances associated with this browser tab have been killed
    // 0) Grab the unique id of this client from the req and verify it is valid
    // 1.125) Ensure two appropriate number of bots (players) are present in storage
    // 1.25) Delete previous files in the directory of the unique id.
    // 1.5) Move the source files of the bot(s) to the directory of this unique id.
    // 2) Compile the bot(s)
    // 3) Build the JSON object to send to the Game Manager
    // 4) Spawn a new Game Manager and pass the JSON object as command line argument(s). 
    //       We could maybe make it easier on the Game Manager side by splitting things up here
    //       into multiple arguments instead of just sending one object
    // 5) Somehow maintain a reference to that process object associated with the exact browser tab
    //       that spawned it.
    // 5.5) Hide the play game button and unhide the Send Move button  // client side crap
    // 5.75) When user sends the move hide the Send Move button.  // client side crap
    // 6) Wait for the initial game state to be sent by the Game Manager via stdout
    // 7) Send this initial game state to the client via res.send()
  });
  
  /**
   * Requested the test arena page is refreshed or a link is followed out
   * i.e. when the page is reloaded.
   */
  server.addDynamicRoute('get', '/killGame', function(req, res) {
    // Kill any Game Manager instances associated with this browser tab
    // Send a response back that the client should use to reset its canvas 
    //    and other html and javascript stuff so that the user can request
    //    playNewGame again and it will work.
    console.log("Killing ", req.query.id);
    //TODO: Look up why delete isn't recommended
    
    //TODO: With this and others that rely on id we should check that req.query.id exists or delete finds the value
    //      incase the user tries to change the value or it becomes corrupted.
    delete testArenaInstances[req.session.id][req.query.id];
    fileManager.deleteDirectoryForTestArenaTab(req.session.id, req.query.id, function(err, result){
      if(err){
        console.log(err);
      }
      // would be nice to have a counter to inc/dec when create and delete instead of checking
      // sync each time we delete.  Or base on data array, but can never be sure because each way
      // has problems.
      var path = require('path');
      var directoryPath = path.resolve(paths.local_storage.test_arena_tmp, req.session.id);
      if(fileManager.getSubFolderCount(directoryPath) === 0){
        // delete the parent directory
        fileManager.deleteDirectoryForTestArenaSession(req.session.id, function(err, result){
          if(err){
            console.log(err);
          }
          console.log(result);
        })
      }
      console.log(result);
    })
    console.log("After Kill \n", testArenaInstances[req.session.id]);
    res.send("killed");
  });
  
  /**
   * Requested by the "Upload Bot/s" Button on the test arena page
   */
  // TODO:  Test with many uploading at the same time.
  var multer = require('multer');
  server.addDynamicRoute('post', '/uploadBot',
            multer({
              dest: './local_storage/test_arena_tmp/',
              limits : {
                        fieldNameSize : 100,
                        files: 2,
                      // fields: 5
                      // fieldNameSize - integer - Max field name size (Default: 100 bytes)
                      // fieldSize - integer - Max field value size (Default: 1MB)
                      // fields - integer - Max number of non-file fields (Default: Infinity)
                      // fileSize - integer - For multipart forms, the max file size (in bytes) (Default: Infinity)
                      // files - integer - For multipart forms, the max number of file fields (Default: Infinity)
                      // parts - integer - For multipart forms, the max number of parts (fields + files) (Default: Infinity)
                      // headerPairs - integer - For multipart forms, the max number of header key=>value pairs to parse Default: 2000 (same as node's http).
              },
              //putSingleFilesInArray: true, // this needs done for future compat.
              rename :  function(fieldname, filename) {
                          if(fieldname === 'player1_bot_upload'){
                            return 'bot1';
                          }
                          else if(fieldname === 'player2_bot_upload'){
                            return 'bot2';
                          }
                          else{
                            return filename;
                          }                                  
              },
              changeDest: function(dest, req, res) {
                // this is a big problem because we can not get the body until after the files are parsed
                // or use get instead of post
                console.log("called changeDest");
                            var path = require('path');
                            var directoryPath = path.resolve(paths.local_storage.test_arena_tmp, req.session.id, req.body.tabId);
                            console.log("storing at ", directoryPath);
                            return directoryPath; 
              },
              onFileUploadStart : function(file, req, res) {
                                    console.log(file.fieldname + ' is starting ...');
                                    var javaRE = /.*\.java/;
                                    var cppRE = /.*\.cpp/;
                                    var cxxRE = /.*\.cxx/;
                                    if (file.fieldname == 'player1_bot_upload' || file.fieldname == 'player2_bot_upload') {
                                      if (file.name.match(javaRE) || file.name.match(cppRE) || file.name.match(cxxRE)) {
                                        console.log(file.fieldname + ':' + file.name
                                            + ' is a .java/.cpp/.cxx file, uploading will continue');
                                      } else {
                                        console.log(file.fieldname
                                                + ':'
                                                + file.name
                                                + ' is a NOT .java/.cpp/.cxx file, this file will not be uploaded');
                                        // Returning false cancels the upload.
                                        return false;
                                      }
                                    }
              },
              onFileUploadComplete : function(file, req, res) {
                                      console.log(file.fieldname + ' uploaded to  ' + file.path);
              },
              onError : function(error, next) {
                          console.log(error)
                          next(error)
              },
              onFileSizeLimit : function(file) {
                                  console.log('Failed: ', file.originalname)
                                  fs.unlink('./' + file.path) // delete the partially written file
              },
              onFilesLimit : function() {
                               console.log('Crossed file limit!')
              },
              onFieldsLimit : function() {
                                console.log('Crossed fields limit!')
              },
              onPartsLimit : function() {
                               console.log('Crossed parts limit!')
              },
            }));

  server.addDynamicRoute('post', '/uploadBot',
        function(req, res) {
          console.log(JSON.stringify(req.body));
          var sanitizer = require('sanitizer');
          var sanitizedFormData = {
            // tabId
            tabId : sanitizer.sanitize(req.body.tabId), 
            // player parameters
            player1_bot_or_human : sanitizer.sanitize(req.body.player1_bot_or_human),
            // bot upload parameters
            player1_bot_upload : req.files.player1_bot_upload,
            player2_bot_upload : req.files.player2_bot_upload,
          };
          
          var valid = verifyAllFieldsWereSubmitted(sanitizedFormData);
          if (valid) {
            //valid = verifyTabIdExists();
          }
          
          if (!valid) {
            // do something here
          }
          res.end();
        });
  
  /**
   * Requested by the "Send Move" Button on the test arena page
   */
  server.addDynamicRoute('post', '/testArenaUpdate', function(req, res) {
    // Here it should be asserted that this current session has 
    
    setTimeout(function() {
      //console.log("in ajax req", req.session.id, req.cookies['connect.sid']);
      // res.cookie('rememberme', 'yes', { maxAge: 900000, httpOnly: true});
       //console.log(req.session);
       res.send(
           [ // Instead of named objects called turns, just use an array of objects, on our end were calling these gamestates
             // and they will be processed in the order that they are defined in this array
             // Each gaem state has three properties
             //  animatableEvents : an array of animatableEvent objects
             //  gameData : an arbitrary game specific object containing necessary information
             //  debugData : an arbitrary game specific object containing necessary information
             {
               'animatableEvents': [     // Each animatableEvent must have an event name and data object
                  {
                    'event': 'move',
                    'data': { 
                      'objectName' : 'player1',
                      'finalPosition' : 9 
                    } 
                  },
               ],
               'gameData' : {
                 'player1Tiles' : [1, 3, 5, 5, 3],    // The tiles after this turn
                 'player2Tiles' : [2, 4, 3, 5, 1],
                 'turnDescription' : "Player 2 used a 3 tile to move to position 11.",  // May not be necessary but would be nice.
               },
               'debugData' : { // Only used in the test arena display
                    'stderr' : [ "An array", "of lines output by the bot", "stderr on this turn." ],
                    'stdout' : [ "An array", "of lines output by the bot", "stdout on this turn." ]
               },
             }, 
             // Turn 2
             {
                'animatableEvents': 
                  [
                      {
                        'event': 'defendedAttack',
                        'data': 
                         { 
                          'attacker' : 'player2',
                          'defender' : 'player1',
                          'attackerStartingPosition' : 24,  // After a defend the attacker should move back to their original position
                          'attackerAttackPosition' : 11
                         } 
                      },  
                  ],
                  'gameData' : {
                    'player1Tiles' : [1, 3, 2, 2, 3],
                    'player2Tiles' : [2, 4, 3, 5, 1],
                    'turnDescription' : "Player 1 used two 5 tile's to attack but was defended.",
                  },
                  'debugData' : {
                    'stderr' : [ "An array", "of lines output by the bot", "stderr on this turn." ],
                    'stdout' : [ "An array", "of lines output by the bot", "stdout on this turn." ]
                  },
              },
              // Turn 3
              {
                'animatableEvents': [     // Each animatableEvent must have an event name and data object
                   {
                     'event': 'move',
                     'data': { 
                       'objectName' : 'player1',
                       'finalPosition' : 0 
                     } 
                   },
                ],
                'gameData' : {
                  'player1Tiles' : [1, 3, 5, 5, 3],    // The tiles after this turn
                  'player2Tiles' : [2, 4, 3, 5, 1],
                  'turnDescription' : "Player 2 used a 3 tile to move to position 11.",  // May not be necessary but would be nice.
                },
                'debugData' : {
                  'stderr' : [ "An array", "of lines output by the bot", "stderr on this turn." ],
                  'stdout' : [ "An array", "of lines output by the bot", "stdout on this turn." ]
                },
              }, 
            ] // End game state array
    );
    }, 500); 

  }); 
  
}


