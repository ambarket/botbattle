
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
    var paths = require("./BotBattlePaths");
    var objectFactory = require(paths.custom_modules.ObjectFactory);
    var logger = require(paths.custom_modules.Logger).newInstance('console');
    
    
    /**
     * Upon successful completion, this object will contain a connected and 
     * authenticated MongoClient object, the database will have been cleared of
     * all collections used by BotBattleApp, and initialized with any initial
     * records required.
     * @method initializeFreshDatabase
     * @param {Function} callback with the form function(err)
     */
    this.initializeFreshDatabase = function(initializeFreshDatabaseCallback){
      var async = require('async');
      async.waterfall(
        [
          connectToDatabaseTask,
          authenticateConnectionTask,
          clearDatabaseTask,
          insertInitialRecordsTask
        ], 
        
        function(err){
          initializeFreshDatabaseCallback(err);
        }
      );              
    };
    
    this.connectToExistingDatabase = function(connectCallback) {
      var async = require('async');
      async.waterfall(
        [
          connectToDatabaseTask,
          authenticateConnectionTask
        ], 
        
        function(err){
          connectCallback(err);
        }
      );    
    }
    
    /**
     * Note close is apparently synchronous, or at least doesn't accept a callback
     */
    this.disconnectFromDatabase = function () {
      databaseClient.close();
      databaseClient = null;
    };
    
    /**
     * The reverse of initializeFreshDatabase
     * Will drop the database, disconnect, then set databaseClient = null
     * Database url is maintained so calling initializeFreshDatabase after 
     * calling this method will work as expected.
     */
    this.dropDatabaseAndDisconnect = function(callback) {
      if (databaseClient != null) {
        databaseClient.dropDatabase(function(err) {
          databaseClient.close();
          databaseClient = null;
          callback(err);
        })
      }
      else {
        process.nextTick(function() {callback(null)});
      }
    }
    
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
        }
        callback(err);
      });
    }
    
    /**
     * Upon successful completion, database will be completely cleared of previous data.
     * @method clearDatabaseTask
     * @param {Function} callback used by async.waterfall(...). 
     * @public
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
    
    function dropCollection(collectionName, callback) {
      databaseClient.collection(collectionName, function(err, collection) {
        //logger.log('database', collection);
        collection.drop(function (err, result) {
          //TODO This is not very clean but we actually want to allow this to fail in the case that
          //    the collection to drop didnt exist. In this case the result === false, which is checked below
          //    maybe revisit this if we have time, but works for now.
          if (err && !err.toString().indexOf("ns not found")) {
            logger.log('database', err.toString());
            callback(err);
          }
          else {
            //logger.log('database', result);
            logger.log('database', (result===false) ? "Tryed to drop " + collectionName + " but it didn't exist" : collectionName + " collection dropped successfully");
            callback(null);
          }
        });
      });
    }
    
    
    /**
     * Queries for the specified username, first in admin users, then in tournament users
     */
    this.queryAllUsers = function(username, callback) {
      self.queryAdminUsers(username, function(err, user) {
        if (err) { return callback(err); }
        else {
          if (user) {
            return callback(null, user);
          }
          else {
            self.queryForStudentInSystemTournament(username, function(err, user) {
              if (err) { return done(err); }
              else {
                if (user) {
                  return callback(null, user);
                }
                else {
                  return callback(null, null);
                }
              }
            });
          }
        }
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
      insertSingletonDocumentByKeyFieldInCollection(userObject, objectFactory.User.keyFieldName, 'AdminUsers', callback );
    }
    
    /**
     * Queries for specified username into the AdminUsers collection of the DB.
     * @param {String} username A username to query for
     * @param {Function} callback Function to call after querying. Will be passed any error that occurs as first argument. 
     * Second argument will be the document found to match the key. If multiple documents were found an error will be returned
     * and the second argument will be null. If no documents were found, both the first and second arguments will be null.
     * @method queryAdminUsers
     * @public
     */
    //TODO: Maybe change query to allow for multiples to be returned. I'm questioning this right now
    this.queryAdminUsers = function(username, callback) {
      //TODO Check if its a valid userObject and make keyFIeld a static property in the ObjectFactory
      //    so that you don't need an instance to find out what it is.
      queryForSingletonDocumentByKeyFieldInCollection(username, objectFactory.User.keyFieldName, 'AdminUsers', callback);
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
      insertSingletonDocumentByKeyFieldInCollection(gameModuleObject, objectFactory.GameModule.keyFieldName, 'GameModules', callback );
    }
    
    /**
     * Queries for specified gameName into the GameModules collection of the DB.
     * @param {String} gameName:  The name of the game module to query for
     * @param {Function} callback: Function to call after insertion. Will be passed any error that occurs as first argument. 
     * Second argument will be the document found to match the key. If multiple documents were found an error will be returned
     * and the second argument will be null. If no documents were found, both the first and second arguments will be null.
     * @method queryGameModule
     * @public
     */
    this.queryGameModule = function(gameName, callback) {
      //TODO Check if its a valid userObject and make keyFIeld a static property in the ObjectFactory
      //    so that you don't need an instance to find out what it is.
      queryForSingletonDocumentByKeyFieldInCollection(gameName, objectFactory.GameModule.keyFieldName, 'GameModules', callback);
    }
    
    /**
     * Queries for a list of gameNames in the GameModules collection of the DB.
     * @param {Function} callback: (err, ListOfGameNames)
     * @method queryListOfGameNames
     * @public
     */
    this.queryListOfGameNames = function(callback) {
      queryCollectionAttributeList("GameModules", objectFactory.GameModule.keyFieldName, callback);
    }
    
    /**
     * Queries for a list of values from an attribute (field) from a specified collection
     * @param {String} collection: The name of the collection to query
     * @param {String} field: The name of the field to query values of in the collection
     * @param {Function} callback: callback(err, listOfFieldValues)
     * @method queryCollectionAttributeList
     * @private
     */
    function queryCollectionAttributeList(collectionName, field, callback) {
      // get all of the objects in the collection then loop through it and create a list of values of the field
      queryForAllDocumentsInCollection(collectionName, function(err, collectionItems){
        if(err){
          logger.log("database",new Error("Error in queryCollectionAttributeList " + err));
          callback(err,null);
        } 
        else {   
          var listOfFieldValues = [];
          for(var item in collectionItems){
            listOfFieldValues.push(collectionItems[item][field]);
          }
          logger.log("database", "queryCollectionAttributeList completed");
          callback(null,listOfFieldValues);
        }
      });
    }
    
    /**
     * Queries for the specified username amongst all tournaments in the system. And returns the first one found.
     * WARNING: This method makes sense for a single tournament system. THe tournaments collection and the methods that 
     * operate on it are more generic than that. If multiple tournaments are used in the future, another method will
     * have to be used for this purpose.
     * 
     * If found, user object will be returned as second argument, null otherwise.
     */
    this.queryForStudentInSystemTournament = function(username, callback) {
      self.queryTournaments(function(err, tournaments) {
        if (err) { 
          // Saw this method in the passport module. Just shorthand for having return/break on the next line as
          //    we've done in the past. callback doesn't actually return a value.
          return callback(err);
        }
        else {
          
          // Maybe even through an error because there must always be one tournament
          if (tournaments == null) {
            return callback(null, null);
          }
          
          // Kind of silly to have this when we know its going to be one tournament.
          for (var tournamentIndex = 0; tournamentIndex < tournaments.length; tournamentIndex++) {
            for(var userIndex = 0; userIndex < tournaments[tournamentIndex].usersArray.length; userIndex++) {
              if (tournaments[tournamentIndex].usersArray[userIndex].username === username) {
                return callback(null, tournaments[tournamentIndex].usersArray[userIndex]);
              }
            }
          }
          // No user found, return null.
          logger.log('database', "No user named '" + username + "' found in the system tournament");
          return callback(null, null);
        }
      });
    }
    
    
    /**
     * Returns an array of all objects found in the tournaments collection as second argument to callback
     */
    this.queryTournaments = function(callback) {
    	queryForAllDocumentsInCollection('Tournaments', callback);
    };
    
     this.insertTournament = function(tournamentObject, callback) {
    	 insertSingletonDocumentByKeyFieldInCollection(tournamentObject, objectFactory.Tournament.keyFieldName, 'Tournaments', callback );
      };
      
      
    // ... and so on

    function insertSingletonDocumentByKeyFieldInCollection(document, keyFieldName, collectionName, callback) {
    	// maybe break all of these up into smaller functions and others like Dr. Blum suggested in class
      if (databaseClient === null) {
        callback(new Error("Database hasn't been initialized, cannot insert!"))
      } 
      else {
        queryForSingletonDocumentByKeyFieldInCollection(document[keyFieldName], keyFieldName, collectionName, function(err, foundDocument) {
          if(err) {
            logger.log('database', err);
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

                  collection.insert(document, {w:1}, function(err, result) {
                    if (err) {
                      err.message = "Failed to insert " + JSON.stringify(document)  +  " into the '" + collectionName + "' collection." ;
                      logger.log('database', err);
                      callback(err);
                    }
                    else {
                      logger.log('database', "Success inserting " + JSON.stringify(document) + " into the '" + collectionName + "' collection.");
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
    
    function queryForAllDocumentsInCollection(collectionName, callback) {
      if (databaseClient === null) {
        callback(new Error("Database hasn't been initialized, cannot query!"))
      } 
      else {
        databaseClient.collection(collectionName, function(err, collection) {
            if (err) {
              callback(err);
            } 
            else {
              collection.find({}).toArray(function(err, items) {
                if (err) {
                  err.message = "Error when attempting to find all documents in the '" 
                    + collectionName + "' collection.\n" + err.message;
                  logger.log('database', err);
                  callback(err);
                }
                else {
                  if (items.length === 0) {
                    logger.log('database', "No documents found in the '" + collectionName + "' collection.");
                    callback(null, null);
                  }
                  else {
                    logger.log('database', "Found " + items.length + " documents in the '" + collectionName + "' collection.");
                    callback(err, items);
                  }
                }
              })
            }
        });
      }
    }
    
    function queryForSingletonDocumentByKeyFieldInCollection(keyValue, keyFieldName, collectionName, callback) {      
      if (databaseClient === null) {
        callback(new Error("Database hasn't been initialized, cannot query!"))
      } 
      else {
        databaseClient.collection(collectionName, function(err, collection) {
            if (err) {
              callback(err);
            } 
            else {
              var query = {};
              query[keyFieldName] = keyValue;
              
              collection.find(query).toArray(function(err, items) {
                if (err) {
                  err.message = "Error when attempting to find '" + keyFieldName + ":" + keyValue 
                                  + "' in the '" + collectionName + "' collection.\n" + err.message;
                  logger.log('database', err);
                  callback(err);
                }
                else {
                  if (items.length === 0) {
                    logger.log('database', "No document found matching '" + keyFieldName + ":" + keyValue 
                                + "' in the '" + collectionName + "' collection.");
                    callback(null, null);
                  }
                  else if (items.length === 1) {
                    logger.log('database', "Found document matching '" + keyFieldName + ":" + keyValue 
                        + "' in the '" + collectionName + "' collection.");
                    logger.log('database', "Here's the document: " + JSON.stringify(items[0]) );
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
       logger.log('database', "Running simple unit test of DB connection, insertion, and retrieval...");
       if (databaseClient === null) {
         logger.log('database', "You haven't called connect yet!");
       }
       else {
         databaseClient.collection(collectionName, function(err, collection) {
             logger.log('database', "fetch results");
             logger.log('database', "\terr: " + err);
             logger.log('database', "\tcollection:" + collection);
             logger.log('database', "end fetch of testCollection");
             if (!err) {
               collection.insert([{a:1}, {a:2}, {a:3}], {w:1}, function(err, result) {
                 logger.log('database', "insertion results");
                 logger.log('database', "\terr: " + err);
                 logger.log('database', "\tresult:" + result);
                 logger.log('database', "end insertion results");
                 if (result) {
                   // Peform a simple find and return all the documents
                   collection.find().toArray(function(err, docs) {
                     logger.log('database', "find results");
                     logger.log('database', "\terr: " + err);
                     logger.log('database', "\tdocs:" + JSON.stringify(docs));
                     logger.log('database', "end find results");
                     collection.drop();
                     logger.log('database', "Collection dropped, test complete");
                   });
                 }
                 else {
                   logger.log('database', "Cant call find, the insertion result was false");
                 }
               });
             }
             else {
               logger.log('database', "Cant call insert, there was an error retriving the collection");
             }
           });
         }
     };
     
    
};




