// TODO: Eliminate the evert emitter stuff, overly complicates this for no reason.
//  Also replace all emits and console.log statmenets with logger.log('BotBattleCompiler', message)


/**
 *  Will emit 'stdout', 'stderr', 'warning', 'failed', 'complete',  events, each with a string data argument
 *  In addition the callback will be called with analogous err arguments when failed events are sent,
 *  and with a null err argument upon the complete event.
 */
function BotBattleCompiler() {
  var paths = require("./BotBattlePaths");
  var path = require('path');
  var logger = require(paths.custom_modules.Logger).newInstance();
  var spawn = require('child_process').spawn;
  var fileManager = new (require(paths.custom_modules.FileManager));
  var self = this;
  
  this.compileDirectoryJava = function(folder, outputFolder, callback) {
    if (!callback || typeof(callback) != "function") {
      console.log("Undefined or non-function object sent as callback to BotBattleCompiler.compile(...)");
      self.emit('warning', "Undefined or non-function object sent as callback to BotBattleCompiler.compile(...)");
    }
    else if (!folder) {
      logger.log("Empty folder path sent to BotBattleCompiler.compile(...)");
      self.emit('failed', "Empty folder path sent to BotBattleCompiler.compile(...)");
      callback(new Error("Empty folder path sent to BotBattleCompiler.compile(...)"));
    }
    // get the list of files in the folder
    var folderContentList = fileManager.getfolderContentList(folder);
    // for items do the below
    var sourceFiles = [];
    for(var item in folderContentList){
      if(folderContentList[item] !== "Rules"){
        sourceFiles.push(folder + "/" + folderContentList[item]);
      }
    }
    var compilationProcess = undefined;
    directoryPath = path.resolve(folder, folderContentList[item]);
    // TODO: THis is terrible coding.
    sourceFiles.unshift("-classpath", paths.gameManagerJars);
    sourceFiles.push("-d");
    sourceFiles.push(outputFolder);
    console.log("Compiling", sourceFiles);
    compilationProcess = spawn('javac', sourceFiles);
    compilationProcess
    .on('close', function (code, signal) 
        {
          if (code !== 0) {
            self.emit('failed', 'Compilation of ' + sourceFiles + ' failed with error code ' + code);
            callback(new Error('Compilation of ' + sourceFiles + ' failed with error code ' + code));
          }
          else
          {
            self.emit('complete', 'Compilation of ' + sourceFiles + ' successful!');
            callback(null)
          }
        })
        .on('exit', function (code, signal) 
        {
            if (code !== 0) {
              //self.emit('failed', 'Compilation of ' + sourceFiles + ' failed with error code ' + code);
              //callback(new Error('Compilation of ' + sourceFiles + ' failed with error code ' + code));
            }
            else
            {
              // close is fired right after this
              //self.emit('complete', 'Exit Compilation of ' + sourceFiles + ' successful!');
              //callback(null, sourceFiles)
            }
        })
        .on('error', function (err) 
        {
          logger.log('Compiler error, killing the process.');
          self.emit('failed', 'Compilation of ' + sourceFiles + ' failed on error event ' + err.message);
          compilationProcess.stdin.pause();
          compilationProcess.kill();
          // Killing it should call either exit or close? We never checked for these before but seems like a good idea.
          //callback(null, 'Compilation of ' + sourceFiles + ' failed on error event ' + err.message);
        })
       .stderr.on('data', function (data) 
       {
         self.emit('stderr', data.toString());
       });
       compilationProcess.stdout.on('data', function (data) 
       {
          self.emit('stdout', data.toString());
       });
    }
  
  this.compile = function(sourceFilePath, callback) {
    var cppRE = /(.*\.cpp)|(.*\.cxx)/;
    var javaRE = /.*\.java/;

    var language = undefined;
    // Validate arguments before going further
    if (!callback || typeof(callback) != "function" /*|| callback.getClass() != '[object Function]' TODO Doesn't work find another way*/) {
      console.log("Undefined or non-function object sent as callback to BotBattleCompiler.compile(...)");
      self.emit('warning', "Undefined or non-function object sent as callback to BotBattleCompiler.compile(...)");
    }
    else if (!sourceFilePath) {
      logger.log("Empty file path sent to BotBattleCompiler.compile(...)");
      self.emit('failed', "Empty file path sent to BotBattleCompiler.compile(...)");
      callback(new Error("Empty file path sent to BotBattleCompiler.compile(...)"));
    }
    else if(sourceFilePath.match(cppRE)) {
      language = 'cpp';
    }
    else if (sourceFilePath.match(javaRE)) {
      language = 'java'; 
    }
    else {
      logger.log('Error during compilation: ' + sourceFilePath + ' is a NOT .cpp, .cxx, or .java file!');
      self.emit('failed', 'Error during compilation: ' + sourceFilePath + ' is a NOT .cpp, .cxx, or .java file!');
      callback(new Error('Error during compilation: ' + sourceFilePath + ' is a NOT .cpp, .cxx, or .java file!'));
    }
    // If we couldnt set the language then there was an error, don't go any farther
    if (!language) {
      return;
    }
    
    //TODO: This is how we did it before but isn't it possible that it compiles before we registered the listener?
    //          is there built in protection for this?   // seems this could be a problem.. just register listener
    //    first by swapping the switch and listeners reg.
    // Start the process.
    var compiledFilePath = undefined;
    var compilationProcess = undefined;
    switch(language) {
      case 'cpp':
        compiledFilePath = sourceFilePath+'.out';
        compilationProcess = spawn('g++', [sourceFilePath, '-o'+compiledFilePath]); 
        break;
      case 'java':
        compiledFilePath = sourceFilePath.slice(0, -5) + '.class';
        compilationProcess = spawn('javac', [sourceFilePath])
        break;
    }
    
    // Register the listeners
    compilationProcess
      .on('close', function (code, signal) 
      {
        if (code !== 0) {
          var errMessage = 'Compilation of ' + sourceFilePath + ' failed with error code ' + code;
          logger.log('BotBattleCompiler', errMessage);
          self.emit('failed', errMessage);
          callback(new Error(errMessage));
        }
        else
        {
          self.emit('complete', 'Compilation of ' + sourceFilePath + ' successful!');
          logger.log('BotBattleCompiler', 'Compilation of ' + sourceFilePath + ' successful!');
          callback(null, compiledFilePath)
        }
      })
      .on('error', function (err) 
      {
        logger.log('Compiler error, killing the process.');
        self.emit('failed', 'Compilation of ' + sourceFilePath + ' failed on error event ' + err.message);
        compilationProcess.stdin.pause();
        compilationProcess.kill();
        // Killing it should call either exit or close? We never checked for these before but seems like a good idea.
        //callback(null, 'Compilation of ' + sourceFilePath + ' failed on error event ' + err.message);
      })
     .stderr.on('data', function (data) 
     {
       self.emit('stderr', data.toString());
     });
     compilationProcess.stdout.on('data', function (data) 
     {
        self.emit('stdout', data.toString());
     });
  }
}


(function() {
  var EventEmitter = require('events').EventEmitter;
  var util = require('util');
  util.inherits(BotBattleCompiler, EventEmitter);
})()
    
// GIve some options, can either call directly with new or user create factory method
module.exports = BotBattleCompiler;

module.exports.createBotBattleCompiler = function() {
  return new BotBattleCompiler();
}
