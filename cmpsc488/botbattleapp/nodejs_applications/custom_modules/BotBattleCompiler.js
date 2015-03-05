/**
 *  Will emit 'stdout', 'stderr', 'warning', 'failed', 'complete',  events, each with a string data argument
 *  In addition the callback will be called with analogous err arguments when failed events are sent,
 *  and with a null err argument upon the complete event.
 */
function BotBattleCompiler() {
  var spawn = require('child_process').spawn;
  var self = this;
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
      console.log("Empty file path sent to BotBattleCompiler.compile(...)");
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
      console.log('Error during compilation: ' + sourceFilePath + ' is a NOT .cpp, .cxx, or .java file!');
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
          self.emit('failed', 'Compilation of ' + sourceFilePath + ' failed with error code ' + code);
          callback(new Error('Compilation of ' + sourceFilePath + ' failed with error code ' + code));
        }
        else
        {
          self.emit('complete', 'Compilation of ' + sourceFilePath + ' successful!');
          callback(null, compiledFilePath)
        }
      })
      .on('exit', function (code, signal) 
      {
          if (code !== 0) {
            //self.emit('failed', 'Compilation of ' + sourceFilePath + ' failed with error code ' + code);
            //callback(new Error('Compilation of ' + sourceFilePath + ' failed with error code ' + code));
          }
          else
          {
            // close is fired right after this
            //self.emit('complete', 'Exit Compilation of ' + sourceFilePath + ' successful!');
            //callback(null, compiledFilePath)
          }
      })
      .on('error', function (err) 
      {
        console.log('Compiler error, killing the process.');
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