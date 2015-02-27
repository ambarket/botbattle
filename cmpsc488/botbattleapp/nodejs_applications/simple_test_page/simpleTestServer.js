

var BotBattleServer = require('../custom_modules/BotBattleServer');

var server = new BotBattleServer().initAndStartListening(6058);
var fileManager = new (require('../custom_modules/FileManager'));

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
  
