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
    this.connect = function(callback1){
      //do the task with waterfall
    	var async = require('async');
      async.waterfall(
        [
          connectToDatabaseTask,
          authenticateConnectionTask,
          clearDatabaseTask,
          insertInitialRecordsTask
        ], 
        //final fucntion (this is where we pass stuff to callback
        function(err, result){
        	callback1(err, result);
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
      callback(null, "Successfully Initialized the Database");
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
    
    /* Not sure we need this
    // will pass the document to the second arg of callback
    this.getLocalStorageCreatedFlag = function(callback) {
      if (databaseClient === null) {
        console.log("You haven't called connect yet!");
      } 
      else {
        databaseClient.collection('SystemParameters', function(err, collection) {
            if (err) {
              callback(err);
            } 
            else {
              var query = {'localStorageCreated':{ '$exists' : true, '$ne' : null }};
              collection.find(query).toArray(function(err, items) {
                if (err) {
                  callback(err);
                } 
                else {
                  if (items.length === 0 || items.length > 1) {
                    console.log("Somehow there is more than one localStorageCreated record in the DB");
                    callback('error');
                  }
                  else {
                    console.log(items[0]);
                    callback(null, items[0]);
                  }
                }
              });
            }
        });
      }
    }
    
    this.setLocalStorageCreatedFlag = function(value, callback) {
      if (databaseClient === null) {
        console.log("You haven't called connect yet!");
      } 
      else {
        databaseClient.collection('SystemParameters', function(err, collection) {
            if (err) {
              callback(err);
            } 
            else {
              var query = {'localStorageCreated':{ '$exists' : true, '$ne' : null }};
              var update = {$set: {'localStorageCreated': value}};
              collection.update(query, update, {w:1, upsert:true}, function(err) {
                if (err) {
                  console.log(err + "Error updating LocalstorageFlag");
                }
                else {
                  console.log("success setting localStorageCreatedFlag to " + value);
                }
                callback(err);
              });
            }
        });
      }
    }
    */

    /**
     * Inserts the specified object into the AdminUsers collection of the DB.
     * TODO Currently no checking whatsoever 
     * @param {Object} userObject An object created with ObjectFactory.createUserObject, will be inserted into the AdminUsers collection
     * @param {Function} callback Function to call after insertion. Will be passed any error that occurs as first argument.
     * @method insertAdminUser
     * @public
     */
    this.insertAdminUser = function(userObject, callback) {
      if (databaseClient === null) {
        console.log("You haven't called connect yet!");
      } 
      else {
        self.queryAdminUsers(userObject.username, function(err, user) {
          if(err) {
            console.log(err);
            callback(err);
          }
          else {
            if (user !== null) {
              console.log("Admin user '" + userObject.username + "' already exists, can't insert");
              console.log(user);
              callback(new Error("Admin user '" + userObject.username + "' already exists, can't insert"));
            }
            else {
              // Safe to perform the insert
              databaseClient.collection('AdminUsers', function(err, collection) {
                if (err) {
                  callback(err);
                } 
                else {
                  collection.insert(userObject, {w:1}, function(err) {
                    if (err) {
                      console.log(err + "Error inserting admin user: " + userObject.username);
                      err.message += "Error inserting admin user: " + userObject.username;
                      callback(err);
                    }
                    else {
                      console.log("Success inserting admin user '" + userObject.username + "'");
                      callback(null, "Success inserting admin user '" + userObject.username + "'");
                    }
                  });
                }
              });
            }
          }
        });
      }
    }
       
    /**
     * Inserts the specified object into the AdminUsers collection of the DB.
     * TODO Currently no checking whatsoever 
     * @param {String} username A string representing the username of the user you'd like to query for
     * @param {Function} callback Function to call after find. Will be passed any error that occurs as first argument.
     * if the user is found, the corresponding document will be returned as the second argument. If not, null will be passed as second argument
     * @method insertAdminUser
     * @public
     */
    this.queryAdminUsers = function(username, callback) {
      if (databaseClient === null) {
        console.log("You haven't called connect yet!");
      } 
      else {
        databaseClient.collection('AdminUsers', function(err, collection) {
            if (err) {
              callback(err);
            } 
            else {
              var query = {'username' : username};
              collection.find(query).toArray(function(err, items) {
                if (err) {
                  console.log(err + "Error finding admin user: " + username);
                  err.message += " Error finding admin user: " + username;
                  callback(err);
                }
                else {
                  if (items.length === 0) {
                    console.log("No admin user found with name: " + username);
                    callback(null, null);
                  }
                  else if (items.length === 1) {
                    console.log("Found admin user: " + username);
                    callback(null, items[0]);
                  }
                  else {
                    console.log(items.length, "Admin users were found with name '" + username + "' this should never happen!");
                    callback(new Error("More than one admin user with name '" + username + "' this should never happen!"));
                  }
                }
              })
            }
        });
      }
    }
    
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




