var EventEmitter = require('events').EventEmitter;
var util = require('util');
var BotBattleDatabase = require('./botBattleDatabase');


function InitialConfiguration() {
    
    var self = this;

    this.run = function(form) {
	/* What the form object looks like by default
	{   "databaseHost":"127.0.0.1",
	    "databasePort":"27017",
	    "databaseName":"testDB",
	    "databaseUserName":"testUser",
	    "databasePassword":"testPass"
	}
	*/

	var database = new BotBattleDatabase(form.databaseHost, form.databasePort, 
		form.databaseName, form.databaseUserName, form.databasePassword);

	
	database.connect(function(err, database) {
	    if (err)
	    {
		self.emit('config_error', err);
	    }
	    else {
		self.emit('progress_update', 100);
		self.emit('config_complete', database);
	    }
	})
    }
}
util.inherits(InitialConfiguration, EventEmitter);

module.exports = new InitialConfiguration();









//module.exports = botBattleDatabaseUnitTest();


/*
// Things to implement...

// Serve the static page
app.get('/initialConfiguration',function(req,res){
  res.sendFile(__dirname + '/static/initialConfiguration.html');
});

// Setup multer to process the uploaded files
app.use(multer({ dest: './tmp/',
  rename: function (fieldname, filename) {
      // override default renaming since we need to keep java files the same.
      // TODO investigate this default renaming (its mentioned here
      // https://github.com/expressjs/multer)
      return filename;
  }
}));

// Receive the form submission via ajax
app.post('/processInitialConfiguration',function(req,res){
  
  res.end();
});

// Establish a connection to the db
  // Create SystemParameters collection
  // Create GameModules collection
  // Create Tournaments collection
  // Create TestArenas collection
  // Create AdminUsers collection
//function connectToDatabase(dbUrl, dbName)

// Store system parameters in the db
  // Store the paths to the Game Modules, Private/Public tournaments,
  // and Test Arena tmp directory in the SystemParameters collection.

// Setup the file system
  // Create Game Modules Directory
  // Create Private Tournament Directory
  // Create Public Tournaments Directory
  // Create Test Arenas Tmp Directory

// Setup the Game Module
  // Create sub directory in Game Modules
      // Save the Game.java file
      // Save the rules.pdf file

  // Compile the Game Module (resulting .class shoudl stay in the Game Module
  // sub directory)
  
  // Store an entry in the DB for the Game Module
  
// Set up the Tournament
  // Build a userlist object from the uploaded txt file.

// Store admin user in the db
  // Create user object for the admin
  // Store this object in the AdminUsers collection

// No additional work should be needed at this time for the test arena
*/
