# Bot! Battle!
Bot!Battle! is an application designed to support and encourage students to gain an early enthusiasm for computer science and programming. Students will write small “bots”, or simple programs that are designed to play a game. Bot!Battle! will host tournaments in which the students’ bots will compete for the title of most awesome bot. In addition, students will be able to test their bots, both against themselves or against another bot, via a publically accessible portal where they can watch their bots play the game.  Also, Bot!Battle! is extensible in that it allows new games to be developed and then uploaded for use in new tournaments.


# System Requirements
A mongo db server must be available with authentication enabled and a database and user ready for Bot!Battle! to use.

java 1.8 for GameManager -- uses some 1.8 features for process management

g++ must be in the PATH. Used to compile c++ bots.

javac must be in the PATH. Used to compile the GameManager and java bots.

unzip must be in the PATH. Used to unzip the game resources.zip file during initial configuration.

# Install and set up authentication for mongodb

	# Source: https://seshagiriprabhu.wordpress.com/2012/11/25/installing-mongodb-in-ubuntu-12-04-and-securing/

	sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
	sudo touch /etc/apt/sources.list.d/10gen.list
	echo "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen" >> /etc/apt/sources.list.d/10gen.list
	sudo apt-get update
	sudo apt-get install mongodb-10gen

	# open shell
	mongo

	# create database admin user
	use admin
	db.addUser("admin", "ADMIN_PASSWORD")

	# create a r/w user on a new database named botbattle
	use botbattle
	db.addUser("botbattle", "BOTBATTLE_PASSWORD")
	
	# Note by default mongodb listens only on 127.0.0.1:27017
	# This listen address and port can be changed if desired in the /etc/mongodb.conf file.
	edit /etc/mongodb.conf to set auth=true

	sudo service mongodb restart
	
	# Can test that authentication works on command line by attempting to log in to the shell with these commands.
	# mongo localhost:27017/admin --username "admin" -password "ADMIN_PASSWORD"
	# mongo localhost:27017/botbattle --username "botbattle" -password "BOTBATTLE_PASSWORD"
	
	# mongodb log is found at /var/log/mongodb/mongodb.log
	
#Install Eclipse Luna and the NodeEclipse Plugin

	Install Java 1.8
	
	Intall Eclipse Luna
	
	Install Nodeclipse plugin according to http://www.nodeclipse.org/updates/
	
	May have tell eclipse the path to my nodejs executable (/usr/bin/nodejs) in preferences -> nodeclipse
	
	How to <a href="http://www.lennu.net/import-git-project-into-eclipse/">Import git project into eclipse</a>
	
	Can change formatter settings under 
	    Preferences -> Javascript -> Code Style -> Formatter
	
	    Can change formatter settings under Preferences -> Java -> Code Style -> Formatter
	
	Google provides a formatter xml file that can be imported here for java 
  
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


