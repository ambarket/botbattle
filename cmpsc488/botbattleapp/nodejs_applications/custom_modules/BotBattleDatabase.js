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
    
    var ObjectFactory = require(paths.custom_modules.ObjectFactory);
    /**
     * Getter for the MongoDB client.
     * @method getDatabaseClient
     * @return A reference to the MongoDB client of this BotBattleDatabase.
     */
    this.getDatabaseClient = function() { return databaseClient;};
    
    /**
     * Upon successful completion, this object will contain a connected and 
     * authenticated MongoClient object, the database will have been cleared of
     * all collections used by BotBattleApp, and initialized with any initial
     * records required.
     * @method initializeFreshDatabase
     * @param {Function} callback with the form function(err)
     */
    this.initializeFreshDatabase = function(connectCallback){
      var async = require('async');
      async.waterfall(
        [
          connectToDatabaseTask,
          authenticateConnectionTask,
          clearDatabaseTask,
          insertInitialRecordsTask
        ], 
        
        function(err){
          connectCallback(err);
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
     * Upon successful completion, the database connection will be authenticated
     * And the private databaseClient property will be set to a connected and authenticated MongoClient object.
     * @method authenticateConnectionTask
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
         // callback(null);
        }
        //else{
        //	callback(err);
        //}
        callback(err);
      });
    }
    
    /**
     * Upon successful completion, database will be completely cleared of previous data.
     * @method connectToDatabaseTask
     * @param {Function} callback used by async.waterfall(...). 
     * @private
     */
    function clearDatabaseTask(callback)
    {
      var collections = ['SystemParameters', 'AdminUsers', 'GameModules', 'Tournaments', 'TestArena'];
      var async = require('async');
      async.each(collections, dropCollection, callback);
    }
    
    /**
     * Upon successful completion, database will contain any initial records needed for the
     * completion of the initialConfiguration and operation of the system
     * @method connectToDatabaseTask
     * @param {Function} callback used by async.waterfall(...). 
     * @private
     */
    function insertInitialRecordsTask(callback) {
      // Not sure if we even need/want this and not use yet because it required file manager to 
      //   have a reference to the DB, which I'm not convinced is necessary yet.
      //self.setLocalStorageCreatedFlag(false, callback);
      
      //TODO: Either delete this or find a purpose for it. Seems like we may need to seed the DB
      //    with some initial records at some point
      callback(null);
    }
    
    
    
    this.close = function () {
      databaseClient.close();
    };
    
    
    
    
    function dropCollection(collectionName, callback) {
      databaseClient.collection(collectionName, function(err, collection) {
        //console.log(collection);
        collection.drop(function (err, result) {
          //TODO This is not very clean but we actually want to allow this to fail in the case that
          //    the collection to drop didnt exist. In this case the result === false, which is checked below
          //    maybe revisit this if we have time, but works for now.
          if (err && !err.toString().indexOf("ns not found")) {
            console.log(err.toString());
            callback(err);
          }
          else {
            //console.log(result);
            console.log((result===false) ? "Tryed to drop " + collectionName + " but it didn't exist" : collectionName + " collection dropped successfully");
            callback(null);
          }
        });

      });
    }
    
    /**
     * Inserts the specified object into the AdminUsers collection of the DB.
     * @param {Object} userObject An object created with ObjectFactory.User, will be inserted into the AdminUsers collection
     * @param {Function} callback Function to call after insertion. Will be passed any error that occurs as first argument. No second argument.
     * @method insertAdminUser
     * @public
     */
    this.insertAdminUser = function(userObject, callback) {
      //TODO Check if its a valid userObject
      insertSingleDocumentByKeyFieldInCollection(userObject, objectFactory.User.keyFieldName, 'AdminUsers', callback );
    }
    
    /**
     * Queries for specified username into the AdminUsers collection of the DB.
     * @param {String} username A username to query for
     * @param {Function} callback Function to call after insertion. Will be passed any error that occurs as first argument. 
     * Second argument will be the document found to match the key. If multiple documents were found an error will be returned
     * and the second argument will be null. If no documents were found, both the first and second arguments will be null.
     * @method queryAdminUser
     * @public
     */
    this.queryAdminUser = function(username, callback) {
      //TODO Check if its a valid userObject and make keyFIeld a static property in the ObjectFactory
      //    so that you don't need an instance to find out what it is.
      queryForSingleDocumentByKeyFieldInCollection(username, objectFactory.User.keyFieldName, 'AdminUsers', callback);
    }
       
    /**
     * Inserts the specified object into the GameModules collection of the DB.
     * @param {Object} gameModuleObject An object created with ObjectFactory.GameModule, will be inserted into the GameModules collection
     * @param {Function} callback Function to call after insertion. Will be passed any error that occurs as first argument.
     * @method insertGameModule
     * @public
     */
    this.insertGameModule = function(gameModuleObject, callback) {
    //TODO Check if its a valid gameModuleObject
      insertSingleDocumentByKeyFieldInCollection(gameModuleObject, objectFactory.GameModule.keyFieldName, 'GameModules', callback );
    }
    
    /**
     * Queries for specified gameName into the GameModules collection of the DB.
     * @param {String} gameName  The name of the game module to query for
     * @param {Function} callback Function to call after insertion. Will be passed any error that occurs as first argument. 
     * Second argument will be the document found to match the key. If multiple documents were found an error will be returned
     * and the second argument will be null. If no documents were found, both the first and second arguments will be null.
     * @method queryAdminUser
     * @public
     */
    this.queryGameModule = function(gameName, callback) {
      //TODO Check if its a valid userObject and make keyFIeld a static property in the ObjectFactory
      //    so that you don't need an instance to find out what it is.
      queryForSingleDocumentByKeyFieldInCollection(gameName, objectFactory.GameModule.keyFieldName, 'GameModules', callback);
    }
    
    
    this.queryTournament = function(tournamentName, callback) {
    	queryForSingleDocumentByKeyFieldInCollection(tournamentName, objectFactory.Tournament.keyFieldName, 'Tournaments', callback);
    };
    
     this.insertTournament = function(tournamentObject) {
    	 insertSingleDocumentByKeyFieldInCollection(tournamentObject, objectFactory.Tournament.keyFieldName, 'Tournaments', callback );
      };
    // ... and so on

    function insertSingleDocumentByKeyFieldInCollection(document, keyFieldName, collectionName, callback) {
      if (databaseClient === null) {
        callback(new Error("Database hasn't been initialized, cannot insert!"))
      } 
      else {
        queryForSingleDocumentByKeyFieldInCollection(document[keyFieldName], keyFieldName, collectionName, function(err, foundDocument) {
          if(err) {
            console.log(err);
            callback(err);
          }
          else {
            if (foundDocument !== null) {
              var err = new Error("Cannot insert because there is already a document matching '" + keyFieldName + ":" + keyValue 
                  + "' in the '" + collectionName + "' collection. \n");
              callback(err);
            }
            else {
              // Safe to perform the insert
              databaseClient.collection(collectionName, function(err, collection) {
                if (err) {
                  callback(err);
                } 
                else {
                  console.log(document);
                  collection.insert(document, {w:1}, function(err) {
                    if (err) {
                      err.message = "Failed to insert " + JSON.stringify(document)  +  " into the '" + collectionName + "' collection." ;
                      console.log(err);
                      callback(err);
                    }
                    else {
                      console.log("Success inserting " + JSON.stringify(document) + " into the '" + collectionName + "' collection.");
                      callback(null);
                    }
                  });
                }
              });
            }
          }
        });
      }
    }
    
    function queryForSingleDocumentByKeyFieldInCollection(keyValue, keyFieldName, collectionName, callback) {
      if (databaseClient === null) {
        callback(new Error("Database hasn't been initialized, cannot query!"))
      } 
      else {
        databaseClient.collection(collectionName, function(err, collection) {
            if (err) {
              callback(err);
            } 
            else {
              var query = {keyFieldName : keyValue};
              collection.find(query).toArray(function(err, items) {
                if (err) {
                  err.message = "Error when attempting to find '" + keyFieldName + ":" + keyValue 
                                  + "' in the '" + collectionName + "' collection.\n" + err.message;
                  console.log(err);
                  callback(err);
                }
                else {
                  if (items.length === 0) {
                    console.log("No document found matching '" + keyFieldName + ":" + keyValue 
                                + "' in the '" + collectionName + "' collection.");
                    callback(null, null);
                  }
                  else if (items.length === 1) {
                    console.log("Found document matching '" + keyFieldName + ":" + keyValue 
                        + "' in the '" + collectionName + "' collection.");
                    console.log("Here's the document: " + JSON.stringify(items[0]) );
                    callback(null, items[0]);
                  }
                  else {
                    var err = new Error("Error multiple documents found matching '" + keyFieldName + ":" + keyValue 
                                          + "' in the '" + collectionName + "' collection.\n");
                    callback(err);
                  }
                }
              })
            }
        });
      }
    }
    
    
    
     
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




