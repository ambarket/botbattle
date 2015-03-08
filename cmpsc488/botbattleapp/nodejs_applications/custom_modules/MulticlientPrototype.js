/* checkout
https://www.npmjs.com/package/fs-extra
*/
module.exports=function(botBattleAppServer, botBattleDatabase) {
  
var multer = require('multer');
var express=require('express');
var sanitizer=require('sanitizer');
var spawn = require('child_process').spawn;

botBattleAppServer.addStaticFileRoute('/', '/static/html/basicInOutErr.html');

//var sockets = [];

var db = [];
var counter = 0;
botBattleAppServer.socketIOReceiveFromAll('connection', function(socket){  // if a bot is running and a user has intermittent connection then this is reloaded.  The program does not get shut down but the counter increases.  Not good!!!!
       //logger.log("new client" + socket);   //  This is why we need them to log in or use cookies to make sure it's the same person or client.
       //sockets[sockets.length] = socket;
       db[counter] = { 
           sock: socket,
           compile: undefined,
           run: undefined,
           filePath: undefined,
           language: undefined
       }
       socket.emit('id', { 'id' : counter });
	   logger.log("\nUser connected");
	   logger.log("Assigned id: " + counter);
	   logger.log("User id: " + db[counter].sock.id +"\n");
	   //logger.log(db[counter]);
       counter++;

       //io.sockets.on('error', function(err) { logger.log(err); });
       socket.on('error', function(err) { logger.log(err); });
       socket.on('stdin', function(data){
			if (db[data.id].run)
			{
				db[data.id].run.stdin.write(data.input + '\n');
			}
			else 
			{
				db[data.id].sock.emit('status', {'output': 'there is no running program to send input to.'});
			}
      });
});

var done=false;
var filePath = null;


/*Handling routes.*/


botBattleAppServer.addDynamicRoute('post', '/processBotUpload',function(req,res){
    //if(done==true){
        var id = req.body.theID;
	logger.log(req.session);
        
        if (db[id])
        {
            db[id].filePath = req.files.fileInput.path;
            var javaRE = /.*\.java/;
            var cppRE = /(.*\.cpp)|(.*\.cxx)/;
			
            if (db[id].filePath.match(javaRE))
            {
                db[id].language = 'java';
            }
            else if (db[id].filePath.match(cppRE))
            {
                db[id].language = 'cpp';
            }
            else
            {
                db[id].sock.emit('status', {'output': "File must end in .cpp, .cxx, or .java"});
            }
			
			if(db[id].filePath){
				db[id].sock.emit('uploaded', {'output': "File uploaded to " + db[id].filePath});
				logger.log("uploadbot: " + id +"\n");
			}
			else{
				logger.log("Can't upload Filepath is null.\n");
				db[id].sock.emit('status', {'output': "Error: File is null. Upload the file again."});
			}
        }
		else{
				logger.log("db " + db[id] + " is null.\n");
				db[id].sock.emit('status', {'output': "Error: Please refresh the page."});
			}		
//    }
    res.end();
});

botBattleAppServer.addDynamicRoute('get', '/compileBot', function(req,res) { 
        logger.log("compilebot: " + req.query.id +"\n");
        var id = req.query.id;
        if (db[id])
        {
			if(db[id].filePath){
				if (db[id].language === 'cpp')
				{
					db[id].compile = spawn('g++', [db[id].filePath, '-o'+db[id].filePath+'.out']); // should warn users if they don't have the compuler
				}
				else if (db[id].language === 'java')
				{
					db[id].compile = spawn('javac', [__dirname + '/' + db[id].filePath]); // compiler ware here too
					logger.log(__dirname + '/' + db[id].filePath);
				}
			}
			else{
				logger.log("Can't compile Filepath is null.\n")
				db[id].sock.emit('status', {'output': "Error: File is null. Upload the file again."});
			}
			
            if (db[id].compile)
            {
	            db[id].compile.on('close', function (code) 
	            {
			        if (code !== 0) {
		                db[id].sock.emit('status', {'output': "Compilation failed with error code " + code});
			        }
			        else
	   		        {
		                db[id].sock.emit('compiled', {'output': "Compilation Successful!"});
	                }
	            });
	            db[id].compile.stderr.on('data', function (data) 
	            {
	               db[id].sock.emit('stderr', {'output': "Compiler:" + data});
	            });
            }
			else{
				logger.log("Compile is null.\n");
				db[id].sock.emit('status', {'output': "Error: Compiled failed badly. Upload the file again."});
			}
        }
        else
        {
            logger.log("invalid id");
        }
    res.end();
});

botBattleAppServer.addDynamicRoute('get', '/runBot', function(req, res) 
{
        logger.log("runbot: " + req.query.id);
        var id = req.query.id;
        if (db[id])
        {
            if (!db[id].run)
            {
				if(db[id].filePath){
					if (db[id].language === 'cpp')
					{
						db[id].run  = spawn(db[id].filePath + '.out');
						db[id].sock.emit('status', {'output': "Running the compiled program"});
					}
					else
					{
						db[id].run  = spawn('java', [db[id].filePath.slice(8, -5)], {cwd:'uploads/'});
						db[id].sock.emit('status', {'output': "Running the compiled program"});
					}
					logger.log("PID: " + db[req.query.id].run.pid + "\n");
					
					db[id].run.stdout.on('data', function(data)
					{
						db[id].sock.emit('stdout', {'output': data.toString()});
					});
					
					db[id].run.stderr.on('data', function(data)
					{
						db[id].sock.emit('stderr', {'output': data.toString()});
					});
					
					db[id].sock.emit('status', {'output': "Program PID: " + db[id].run.pid});
					
					db[id].run.on('close', function(code) 
					{
					   db[id].sock.emit('status', {'output': 'program closed with code ' + code});
					});
					db[id].run.on('exit', function(code) 
					{
					   db[id].sock.emit('status', {'output': 'program exited with code ' + code});
					   logger.log("Exited :" + db[id].run.pid);
					});
				}
				else
				{
					logger.log("Can't run program.  Filepath is null.\n");
					db[id].sock.emit('status', {'output': "Error: File is null. Upload the file again."});
				}
            }
            else
            {
				logger.log("already running");
				db[id].sock.emit('reload', {'output': 'You already have a program running.\nWould you like to load another program?'});
			}
	}
	else
	{
		logger.log("invalid id");
	}
    res.end();
});

botBattleAppServer.addDynamicRoute('get', '/reloadBot', function(req, res) 
{
	
	var id = req.query.id;
	if (db[id])
	{
		logger.log("End Child: " + db[req.query.id].run.pid +"\n");
		db[id].run.stdin.pause();
		db[id].run.kill();
		db[id].run = null;
		db[id].sock.emit('status', {'output': "Child dead."}); 
			
		if (!db[id].run)
		{			
			if(db[id].filePath)
			{
				if (db[id].language === 'cpp')
				{
					db[id].run  = spawn(db[id].filePath + '.out');
					db[id].sock.emit('status', {'output': "Running the compiled program"});
				}
				else
				{
					db[id].run  = spawn('java', [db[id].filePath.slice(8, -5)], {cwd:'uploads/'});
					db[id].sock.emit('status', {'output': "Running the compiled program"});
				}
				
				logger.log("runbot: " + req.query.id);
				logger.log("PID: " + db[req.query.id].run.pid + "\n");
				
				db[id].run.stdout.on('data', function(data)
				{
					db[id].sock.emit('stdout', {'output': data.toString()});
				});
				
				db[id].run.stderr.on('data', function(data)
				{
					db[id].sock.emit('stderr', {'output': data.toString()});
				});
				
				db[id].sock.emit('status', {'output': "Program PID: " + db[id].run.pid});
				
				db[id].run.on('close', function(code) 
				{
				   db[id].sock.emit('status', {'output': 'program closed with code ' + code});
				});
				db[id].run.on('exit', function(code) 
				{
				   db[id].sock.emit('status', {'output': 'program exited with code ' + code});
				   logger.log("Exited :" + db[id].run.pid);
				});
			}
			else
			{
				logger.log("Can't run program.  Filepath is null.\n");
				db[id].sock.emit('status', {'output': "Error: File is null. Upload the file again."});
			}
		}	
	}
	else
	{
		logger.log("invalid id");
	}
    res.end();
});

botBattleAppServer.addDynamicRoute('get', '/killChild', function(req, res) {
        var id = req.query.id;
        if (db[id])
        {
			logger.log("\nUser disconnected");
			logger.log("Assigned id " + id +"\n");
			logger.log("User id: " + db[id].sock.id);
				
            if (db[id].run)
            {    		        
				//logger.log(db[id]);
				logger.log("End Child: " + db[req.query.id].run.pid +"\n");
				
				db[id].run.on('close', function(code) {
	            db[id].sock.emit('status', {'output': 'program exited with code ' + code});
					db[id].run = null;
					db[id].compile = null;
					db[id].filePath = null;
					db[id].language = null;
				});
				db[id].run.stdin.pause();
				db[id].run.kill();
				db[id].sock.emit('status', {'output': "Child dead."}); 
            }
            else
            {
                logger.log("No child for id\n");
            }
        }
        else
        {
            logger.log("invalid id");
        }
    res.end();
});

/* END: http://codeforgeek.com/2014/11/file-uploads-using-node-js/ */

};
