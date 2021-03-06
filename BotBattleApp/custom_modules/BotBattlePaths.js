
/**
  * Provide consistent directory paths throughout the BotBattleApp's various modules in differing directories
  *   Created to solve problem of having hardcoded relative directories all throughout the code. 
  *   Still have to hardcode a relative path to this module from each module that uses it, 
  *   and this module needs the relative path from this module to the root application directory
  *   but that should me much easier to manage and shouldn't need to change.
  *        Example Usage:
  *        
  *        var paths = require("./custom_modules/BotBattlePaths");
  *        paths.app_root  //Path to the root of the application
  *        paths.https_cert.directory      // Path to directory containing the https certificate
  *        paths.https_cert.key            // Path to directory containing the .key file
  *        paths.https_cert.cert           // Path to directory containing the .crt file
  *        paths.custom_modules.directory   //Path to the custom modules directory
  *        paths.custom_modules.[module_name]    //Path to a specific module
  *        @constructor 
  */
//TODO update the above description

var path = require('path');
// Must be changed if the BotBattlePaths.js file is ever moved
module.exports.app_root = path.resolve(__dirname, '../');

var https_cert_directory = path.join(module.exports.app_root, '/https_certificate/');
module.exports.https_cert  = {
    'directory' : https_cert_directory,
    'key' : https_cert_directory + 'server.key',
    'cert' : https_cert_directory + 'server.crt',
}

var custom_modules_directory = path.join(module.exports.app_root, '/custom_modules/');
var BotBattleApp_directory = path.join(custom_modules_directory, 'BotBattleApp/');
module.exports.custom_modules = {
    'directory' : custom_modules_directory,
    'BotBattleApp' : BotBattleApp_directory + 'BotBattleApp',
    'BotBattleDatabase' : custom_modules_directory + 'BotBattleDatabase',
    'BotBattleServer' : custom_modules_directory + 'BotBattleServer',
    'FileManager' : custom_modules_directory + 'FileManager',
    'HTTPSConnectionTracker' : custom_modules_directory + 'HTTPSConnectionTracker',
    'SocketIOConnectionTracker' : custom_modules_directory + 'SocketIOConnectionTracker',
    'ObjectFactory' : custom_modules_directory + 'ObjectFactory',
    'BotBattleCompiler' : custom_modules_directory + 'BotBattleCompiler',
    'InitialConfigurationApp' : custom_modules_directory + 'InitialConfigurationApp',
    'Logger' : custom_modules_directory + 'Logger',
    'InputValidator' : custom_modules_directory + 'InputValidator',
    'MulticlientPrototype' : custom_modules_directory + 'MulticlientPrototype',
}

var BotBattleApp_sub_modules_directory = path.join(BotBattleApp_directory, 'BotBattleAppModules/');
module.exports.BotBattleApp_sub_modules = {
    'Helpers' : BotBattleApp_sub_modules_directory + 'Helpers',
    'TestArenaBotUpload' : BotBattleApp_sub_modules_directory + 'TestArenaBotUpload',
    'Login' : BotBattleApp_sub_modules_directory + 'Login',
    'StudentPortal' : BotBattleApp_sub_modules_directory + 'StudentPortal',
    'AdminPortal' : BotBattleApp_sub_modules_directory + 'AdminPortal',
    'TestArenaInstances' :  BotBattleApp_sub_modules_directory + 'TestArenaInstances',
}

var static_content_directory = path.join(module.exports.app_root, '/static/');
module.exports.static_content = {
  'directory' : static_content_directory,
  'css' : path.join(static_content_directory,  'css/'),
  'javascript' : path.join(static_content_directory,  'javascript/'),
  'html' : path.join(static_content_directory,  'html/'),
  'images' : path.join(static_content_directory,  'images/'),
  'icons' : path.join(static_content_directory,  'icons/'),
  'views' : path.join(static_content_directory,  'views/'),
}

var local_storage_directory = path.join(module.exports.app_root, 'local_storage');
module.exports.local_storage = {
    'directory' : local_storage_directory,
    'game_modules' :  path.join(local_storage_directory, 'game_modules'),
    // Tournaments have not been fully implemented
    //'private_tournaments' :  path.join(local_storage_directory, 'private_tournaments'),
    //'public_tournaments' :  path.join(local_storage_directory, 'public_tournaments'),
    'test_arena_tmp' :  path.join(local_storage_directory, 'test_arena_tmp'),
}

module.exports.init_config_tmp =  path.join(module.exports.app_root,'init_config_tmp');

module.exports.configuration_file = path.join(module.exports.app_root,'savedConfiguration.txt');

/* Currently only a single jar, but works as a colon separated list of class path elements.
 * If you'd like more just append ":" + [path to your jar]
 * This is used in the BotBattleCompiler and TestArenaInstances modules to compile and run the GameManager 
 */
module.exports.gameManagerClassPath = path.resolve(module.exports.app_root,'../GameManager/Jars/json-simple-1.1.1.jar');
module.exports.gameManagerSource = path.resolve(module.exports.app_root,'../GameManager/Production/');

module.exports.built_in_games = {
    'save_the_island' : {
      'rules_pdf' : path.resolve(module.exports.app_root, 'built_in_games', 'save_the_island', 'SaveTheIslandGameRules.pdf'),
      'game_java' : path.resolve(module.exports.app_root, 'built_in_games', 'save_the_island', 'Game.java'),
      'game_js' : path.resolve(module.exports.app_root, 'built_in_games', 'save_the_island', 'game.js'),
      'resources_zip' : path.resolve(module.exports.app_root, 'built_in_games', 'save_the_island', 'resources.zip'),
      'preloaded_bots' : 
        [
          {
            'fileName' : 'SaveIslandBot1.java',
            'filePath' : path.resolve(module.exports.app_root, 'built_in_games', 'save_the_island', 'preloaded_bots', 'SaveIslandBot1.java'),
          }
        ]
    }
}

module.exports.promo_website_dir = path.resolve(module.exports.app_root, '../', "PromoWebsite");
