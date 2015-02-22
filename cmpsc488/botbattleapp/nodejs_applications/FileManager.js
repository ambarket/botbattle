/**
* Provides a local file management. This class will implement application specific
* insert, find, update, and delete methods to abstract away the lower level file management from the rest
* of the application logic
* @class FileMangaer
* @constructor 
*/
// BotBattleApp with multer to limit file upload size
module.exports = function FileManager() {
    // Private variables
    var fse = require('fs-extra');
    var self = this;
    var fileManager = require('./FileManager');
    
    /**
     * ASYNC: Allows for the creation of a folder at the given path.  createFolder also takes a callback
     * to return the success or fail message.
     * @method createFolder
     * @param {String} folderPath - absolute path for folder to be created
     * @param {Function} callback(result) - used to return the result of the folder creation 
     * @public
     */
    this.createFolder = function(folderPath, callback){
       fse.ensureDir(folderPath, function(err){
          if (err) {
            console.log("Error creating directory: " + err);
            if(callback) {callback("Error creating directory: " + err);} 
          }
          else{
            console.log("Created " + folderPath);
            if(callback) {callback("Created " + folderPath);}
          }
       });
     };
       
     // when testing this the page kept trying to submit the folder periodically and new sockets kept getting created     
     // this method is async so multiple button pushes are bad.  Can look for file before is it created.  sync is io blocking
          
          
     /**
      * ASYNC: Allows for the creation of a file at the given path.  createFile also takes a callback
      * to return the success or fail message. If the file that is requested to be created is in directories 
      * that do not exist, these directories are created. If the file already exists, it is NOT MODIFIED.
      * @method createFile
      * @param {String} filePath - absolute path for file to be created
      * @param {Function} callback(result) - used to return the result of the file creation 
      * @public
      */
     this.createFile = function(filePath, callback){
       fse.createFile(filePath, function(err){
           if (err) {
             console.log("Error creating file: " + err);
             if(callback) {callback("Error creating file: " + err);}
           }
           else{
             console.log("Created " + filePath);
             if(callback) {callback("Created " + filePath);}
           }
        });
      };
      
     //  read file
     //  read folder
     //  perhaps relate funtions to users instead of just set or get
       
     //  Create Game Modules Directory
     //  Create Private Tournament Directory
     //  Create Public Tournaments Directory
     //  Create Test Arenas Tmp Directory 
    
     //  Setup the Game Module
     //  Create sub directory in Game Modules
     //  Save the Game.java file
     //  Save the rules.pdf file
     
};

/* It could be that fs.stat is executed before fs.rename. The correct way to do this is to chain the callbacks.

fs.rename('/tmp/hello', '/tmp/world', function (err) {
  if (err) throw err;
  fs.stat('/tmp/world', function (err, stats) {
    if (err) throw err;
    console.log('stats: ' + JSON.stringify(stats));
  });
});
In busy processes, the programmer is strongly encouraged to use the asynchronous versions of these calls. The synchronous versions will block the entire process until they complete--halting all connections. */