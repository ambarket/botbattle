  
#YUIDoc (http://yui.github.io/yuidoc/)

I needed to do this on ubuntu to get YUIDoc to find node
sudo ln -s /usr/bin/nodejs /usr/bin/node
  
TO get YUIDoc to work (from website above)
    Download and install Node.js
    Run npm -g install yuidocjs. (can run it anywhere as -g installs it globally)
    Run yuidoc . at the top of your JS source tree.
    
    To get it to not only compile the documentation but also serve it on a simple webserver use
    yuidoc --server 5000 . 
    
    Then go to http://127.0.0.1:5000 to see the documentation

###Example Class Block

/**
* This is the description for my class.
*
* @class MyClass
* @constructor
*/

###Example Method Block

/**
* My method description.  Like other pieces of your comment blocks, 
* this can span multiple lines.
*
* @method methodName
* @param {String} foo Argument 1
* @param {Object} config A config object
* @param {String} config.name The name on the config object
* @param {Function} config.callback A callback function on the config object
* @param {Boolean} [extra=false] Do extra, optional work
* @return {Boolean} Returns true on success
*/

###Example Property Block

/**
* My property description.  Like other pieces of your comment blocks, 
* this can span multiple lines.
* 
* @property propertyName
* @type {Object}
* @default "foo"
*/

_______________________________________________________________________________________
#Installing mondodb
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/

##Commands used on mongodb shell to setup authentication
http://docs.mongodb.org/manual/tutorial/enable-authentication-without-bypass/

  use admin
  db.createUser(
    {
      user: "siteUserAdmin",
      pwd: "password",
      roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
    }
  )

// Then exit shell and start again passing the new credentials

  mongo --port 27017 -u siteUserAdmin -p password --authenticationDatabase admin

// Then run this to create the user that the app shoudl connect with
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



##windows mongodb http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/

C:\mongodb\bin\mongod.exe --dbpath d:\test\mongodb\data



#Install Eclipse Luna by following instrustions on website

Install Nodeclipse plugin according to http://www.nodeclipse.org/updates/

May have tell eclipse the path to my nodejs executable (/usr/bin/nodejs) in preferences -> nodeclipse

Can change formatter settings under Preferences -> Javascript -> Code Style -> Formatter
Can change formatter settings under Preferences -> Java -> Code Style -> Formatter
  Google provides a formatter xml file that can be imported here for java 
  
  



