
var paths = require('../custom_modules/BotBattlePaths');

var BotBattleServer = require(paths.custom_modules.BotBattleServer)
var server = new BotBattleServer().initAndStartListening(6058);
var fileManager = new (require(paths.custom_modules.FileManager));

/*
server.addDynamicRoute('get', '/folderTest',function(req,res){
  fileManager.createFolder(req.query.path, function(result){
    server.socketIOEmitToAll('folderCreatedResult', result);
  });
});

server.addDynamicRoute('get', '/fileTest',function(req,res){
  fileManager.createFile(req.query.path, function(result){
    server.socketIOEmitToAll('fileCreatedResult', result);
  });
});

server.addStaticFolderRoute('/simpleTest', '/simple_test_page');

server.addStaticFileRoute('/', '/simple_test_page/simpleTestClient.html');
*/
//server.js
//load the things we need

//use res.render to load up an ejs view file

//index page 
server.addDynamicRoute('get', '/', function(req, res) {
  var drinks = [
                { name: 'Bloody Mary', drunkness: 3 },
                { name: 'Martini', drunkness: 5 },
                { name: 'Scotch', drunkness: 10 }
            ];
            var tagline = "Any code of your own that you haven't looked at for six or more months might as well have been written by someone else.";

            res.render('pages/index', {
                drinks: drinks,
                tagline: tagline
            });
        });

//about page 
server.addDynamicRoute('get', '/about', function(req, res) {
 res.render('pages/about');
});

