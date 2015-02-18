/*
 * http://docs.mongodb.org/manual/tutorial/enable-authentication-without-bypass/
use admin
db.createUser(
  {
    user: "siteUserAdmin",
    pwd: "password",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)
 */

/*
 * mongo --port 27017 -u siteUserAdmin -p password --authenticationDatabase admin
use testDB
db.createUser(
    {
      user: "testUser",
      pwd: "testPass",
      roles: [
         { role: "readWrite", db: "testDB" }
      ]
    }
)
*/


var async = require('async');
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;

function BotBattleDatabase(host, port, dbName, uName, pass) {
    // Private variables
	this.database = null;
	url = "mongodb://" + host + ":" + port + "/" + dbName;
	console.log("2");
	// Public Methods
	this.connect = function(connectCallback){
	  async.waterfall(
	    [
          function initializeDB(initializeDBCallback)
          {
            console.log("3");
            // when complete calls a callback passing err and db. Waterfall will
            // pass the
            // db object along to the authenticateDB task if there wasn't an
            // error.
            MongoClient.connect(url, {native_parser:true}, initializeDBCallback);
            console.log("4");
          },
          function authenticateDB(db, authenticateDBCallback)
          {
            console.log("5");
            db.authenticate(uName, pass, function(err, result) {
              if (result)
              {
                // this probably isn't what we'd hope at this point, may need to
                // pass it as a parameter
                console.log("5.5")
                console.log(this);
                this.database = db;
              }
              // Signifies that the final task in the sequence is complete, the
              // final callback of the
              // waterfall should now run.
              authenticateDBCallback(err);
              // Note not run until after everything else finishes and stack unwinds
              console.log("6");
          })
          }
        ], function (err) {
	        console.log("7");
            if (err) {
              // EIther connect or authenticate failed, pass it back up
              connectCallback(err);
            }
            else {
              // This is redundant but leave it for clarity until we really
              // understand how this
              // waterfall works
              connectCallback(null);
            }
            // Note not run until after everything else finishes and stack unwinds
            console.log("8");
           }
          );              
	  }
               
	
	this.close = function () {
	  database.close();
	  database = null; // not sure about this
	}
	
	this.queryTournament = function(tournamentName) {
	  if (db)
	  {
	    // Perform the query
	  }
	}
	
	 this.insertTournament = function(tournament) {
	    if (db)
	    {
	      // Perform the insert
	    }
	  }
	// ... and so on, seems like a nice and good idea to put all database
	// operations in this class instead of directly making the queries.
	
};

function botBattleDatabaseUnitTest() {
  console.log("1");
  var db = new BotBattleDatabase("127.0.0.1", "27017", "testDB", "testUser", "testPass");
  
  db.connect(function(err) {
    console.log("9");
    console.log(err);
  });
  
  function testdatabase()
  {
    if (this.database == null)
      {
        console.log("not ready");
        
      }
    else {
      this.database.createCollection('simple_query', function(err, collection) {
        assert.equal(null, err);
  
        // Insert a bunch of documents for the testing
        collection.insert([{a:1}, {a:2}, {a:3}], {w:1}, function(err, result) {
          assert.equal(null, err);
  
          // Peform a simple find and return all the documents
          collection.find().toArray(function(err, docs) {
            assert.equal(null, err);
            assert.equal(3, docs.length);
            
            console.log(docs);
  
            db.close();
          });
        });
      });
    }
  }
  setInterval(testdatabase.bind(db), 1000);
  
  
}

module.exports = botBattleDatabaseUnitTest();


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
