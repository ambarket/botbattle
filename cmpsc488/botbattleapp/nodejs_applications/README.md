  
#YUIDoc 
http://yui.github.io/yuidoc/

I needed to do this on ubuntu to get YUIDoc to find node

    sudo ln -s /usr/bin/nodejs /usr/bin/node
  
To get YUIDoc to work (from website above)

    npm -g install yuidocjs  //install yuidoc globally
    yuidoc .                 // Run at the top of your JS source tree

    
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

Then exit shell and start again passing the new credentials

    mongo --port 27017 -u siteUserAdmin -p password --authenticationDatabase admin

Then run this to create and associate the user that the app should connect with in the database it should connect to

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



##windows mongodb 
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/

    mongod.exe --dbpath K:\mongodb\data



#Install Eclipse Luna by following instrustions on website

Install OpenJDK from Ubuntu Software Center or 
        Oracle Java from http://ubuntuhandbook.org/index.php/2013/07/install-oracle-java-6-7-8-on-ubuntu-13-10/ or
        Follow one of the many other ways <a href="https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=how%20to%20install%20java%20jdk%20on%20ubuntu%2014.04">Search</a>

Install Eclipse Luna according to http://ubuntuhandbook.org/index.php/2014/06/install-latest-eclipse-ubuntu-14-04/

Install Nodeclipse plugin according to http://www.nodeclipse.org/updates/

How to <a href="http://www.lennu.net/import-git-project-into-eclipse/>Import git project into eclipse</a>

May have tell eclipse the path to my nodejs executable (/usr/bin/nodejs) in preferences -> nodeclipse

Can change formatter settings under 
    Preferences -> Javascript -> Code Style -> Formatter

    Can change formatter settings under Preferences -> Java -> Code Style -> Formatter

Google provides a formatter xml file that can be imported here for java 
  
  



