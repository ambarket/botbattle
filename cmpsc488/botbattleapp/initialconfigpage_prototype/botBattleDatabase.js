function BotBattleDatabase(host, port, dbName, uName, pass) {
    // Private variables
    var database = null;
    var url = "mongodb://" + host + ":" + port + "/" + dbName;
    console.log("2");
    // Public Methods
    
    this.getDatabase = function() { return database;}
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
                //console.log(this);
                database = db;
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
    var datab = db.getDatabase();
    if (datab == null)
      {
        console.log("not ready");
        
      }
    else {
      ////datab.createCollection('simple_query', function(err, collection) {
     //   assert.equal(null, err);
  
        // Insert a bunch of documents for the testing
        datab.simple_query.insert([{a:1}, {a:2}, {a:3}], {w:1}, function(err, result) {
          assert.equal(null, err);
  
          // Peform a simple find and return all the documents
          datab.simple_query.find().toArray(function(err, docs) {
            assert.equal(null, err);
            //assert.equal(3, docs.length);
            
            console.log(docs);
            datab.simple_query.drop()
            //db.close();
         
        });
      });
    }
  }
  setInterval(testdatabase, 1000);
  
  
}

BotBattleDatabase.unitTest = botBattleDatabaseUnitTest;

module.exports = BotBattleDatabase;


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
