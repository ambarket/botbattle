Installing mondodb
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/

Commands used on mongodb shell to setup authentication
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



windows mongodb http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/

C:\mongodb\bin\mongod.exe --dbpath d:\test\mongodb\data



Install Eclipse Luna by following instrustions on website

Install Nodeclipse plugin according to http://www.nodeclipse.org/updates/

May have tell eclipse the path to my nodejs executable (/usr/bin/nodejs) in preferences -> nodeclipse

Can change formatter settings under Preferences -> Javascript -> Code Style -> Formatter
Can change formatter settings under Preferences -> Java -> Code Style -> Formatter
  Google provides a formatter xml file that can be imported here for java 
  
  

