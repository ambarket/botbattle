/**
* Provides a convienient interface to a MongoDB database. This class will implement application specific
* insert, find, update, and delete methods to abstract away the lower level database queries from the rest
* of the application logic
* @class BotBattleDatabase
* @param {String} host The domain name or ip address of the database server.
* @param {String} port The TCP port number of the database server.
* @param {String} databaseName The name of the database to connect to.
* @param {String} username The username to authenticate the database connection with.
* @param {String} password The password to authenticate the database connection with.
* @constructor 
*/

module.exports = function BotBattleDatabase(host, port, dbName, uName, pass) {
    // Private variables
    var self = this;
    var databaseClient = null;
    var url = "mongodb://" + host + ":" + port + "/" + dbName;
    
    /**
     * Getter for the MongoDB client.
     * @method getDatabaseClient
     * @return A reference to the MongoDB client of this BotBattleDatabase.
     */
    this.getDatabaseClient = function() { return databaseClient;};
    
    /**
     * Upon successful completion, a reference to this BotBattleDatabase object, containing a
     * connected and authenticated MongoClient object, will be returned as the second argument to the callback. 
     * @method connect
     * @param {Function} callback with the form function(error, botBattleDatabase)
     */
    this.connect = function(callback){
      var async = require('async');
      async.waterfall(
        [
          connectToDatabaseTask,
          authenticateConnectionTask
        ], 
        function (err) {
          // If there was an error, don't return any data, otherwise return a reference to this object
          callback(err, (err) ? null : self);
        }
      );              
    };
    
    /**
     * Upon successful completion, a connected MongoClient object will be passed as an argument
     * into the authenticateConnectionTask.
     * @method connectToDatabaseTask
     * @param {Function} callback used by async.waterfall(...). 
     * @private
     */
    function connectToDatabaseTask(callback)
    {
      var MongoClient = require('mongodb').MongoClient;
      MongoClient.connect(url, {native_parser:true}, callback);
    }
    
    /**
     * Upon successful completion, the private databaseClient property will be set to a
     * connected and authenticated MongoClient object.
     * @method connectToDatabaseTask
     * @param {Function} callback used by async.waterfall(...). 
     * @private
     */
    function authenticateConnectionTask(connectedDBClient, callback)
    {
      connectedDBClient.authenticate(uName, pass, function(err, result) {
        if (!err && result)
        {
          // Store a reference to the authenticated db instance
          databaseClient = connectedDBClient;
        }
        callback(err);
      });
    }
    
    this.close = function () {
      databaseClient.close();
    };
    
    this.queryTournament = function(tournamentName) {
      if (databaseClient)
      {
        // Perform the query
      }
    };
    
     this.insertTournament = function(tournamentMetadata) {
        if (databaseClient)
        {
          // Perform the insert
        }
      };
    // ... and so on
    
     
     this.insertThenFindUnitTest = function(collectionName) {
       console.log("Running simple unit test of DB connection, insertion, and retrieval...");
       if (databaseClient === null) {
         console.log("You haven't called connect yet!");
       }
       else {
         databaseClient.collection(collectionName, function(err, collection) {
             console.log("fetch results");
             console.log("\terr: " + err);
             console.log("\tcollection:" + collection);
             console.log("end fetch of testCollection");
             if (!err) {
               collection.insert([{a:1}, {a:2}, {a:3}], {w:1}, function(err, result) {
                 console.log("insertion results");
                 console.log("\terr: " + err);
                 console.log("\tresult:" + result);
                 console.log("end insertion results");
                 if (result) {
                   // Peform a simple find and return all the documents
                   collection.find().toArray(function(err, docs) {
                     console.log("find results");
                     console.log("\terr: " + err);
                     console.log("\tdocs:" + JSON.stringify(docs));
                     console.log("end find results");
                     collection.drop();
                     console.log("Collection dropped, test complete");
                   });
                 }
                 else {
                   console.log("Cant call find, the insertion result was false");
                 }
               });
             }
             else {
               console.log("Cant call insert, there was an error retriving the collection");
             }
           });
         }
     };
};




