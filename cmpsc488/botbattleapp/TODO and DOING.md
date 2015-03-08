Initial config tasks

implement regular expression matching for all fields

remove and cleanup unecessary logging

_______________________________________________________________________________________________________________
<strike> Move file tests out of InitialConfigurationApp.js to a separate FileTestApp.js and out of  inititalConfiguration.html to fileTest.html </strike>
        
Finish FileManager after setting up initConfig html and wiring to know what is needed (add to after test arena also)

Look into Multer more for initConfig and testArena to see if necessary
        
Move Test Arena socket.io connection handshake proposal.txt from investigate io branch to master branch 
      then start a new branch to work on Test Arena
      
<strike> In test arena branch make a new testArena.html and use basicInOutErr.html as a template </strike> and
     modify botBattleApp.js to work with test arena 
     
Add other html pages and set up wiring by modifying botBattleApp.js (maybe new branches for each of these
      until they work)  
      
Test Arena
		Add idle animations
			standing, floating (thrust, shadow), running, water waves
		Fix pixel ratio
		add 25 cells for location on island of equal robot width (currently need 1250 px just for island with robots 
		    that are 50px wide + space to make it look like an island on both sides... (maybe add logic to scale by 
		    calling a transform after loading images and checking client screen size.)
      
******Keep Master as clean and functional as possible!!!

_____________________________________________________________________________________________________________

#Detailed sequence of events for client connects to public portal use case

      Client 
        opens browser and create GET request for /
      
      Server 
        Generates a new testArenaMetadata object.
        Inserts in into the DB
          On insert callback
            1) retrieve the _id field from the inserted document, this will be the client's id for this connection
            2) store this id in the session store for this connection (we can actually store session data in the mongodb if we want, not sure if this makes sense)
            3) send the public portal page to the client, with the client's id specified in the headers
              (or if we do add it to the session store it should be in a cookie so you can get it with document.cookie on client side)
      
      Client
        Receives the page, downloads the client side script
        Runs the script which initiates a socket.io connection
        register for the 'server_ready' event
          when it's fired enable all buttons that result in communication with the server
            
        in the 'connect' event callback,
          emit the 'myId' event to the server passing it the id it got from the initial page load (it's db entry _id field)
          
        on disconnect event callback,
          display a relevant message indicating temporary loss of connection with the server, and that the client should reconnect automatically
          disable any buttons on the page that result in communication with the server
          
          
        on browser close or unload or whatever it is (they are refreshing or closing the browser)
          send the 'im_disconnecting' message over socket.io 
          
        
      Server
        In the SocketIOCOnnectionTracker 
          On 'connection' event
            store a reference to the socket in the socketInfo.sockets map (socket's id -> socket object)
            register on('myId', callback) to the new socket
          On 'myId' event (socket specific)
            if (there isn't already a socket associated with this id)
              if (there is a database entry for this id)
                create a bidirectional mapping between the id sent from the client and the id of socket object
                emit the 'server_ready' event to the client telling them they are free to start communicating. 
                  NOTE: At this point we know there is a testArenaMetadata object in the database for this connection, and this is the only client claiming to own that database entry.
              else
                client must have changed their id by editing their script and changing it to an id that ISN'T in use by any other client. 
                Notify them and disconnect their socket
            else 
              client must have changed their id by editing their script and changing it to an id that IS in use by any other client. 
              Notify them and disconnect their socket
          
          On 'disconnect' event (socket specific)
            delete the socket object
            delete the bidirectional mapping
            
          On 'im_disconnecting' (socket specific)
            delete the database entry
            delete anything on the file system
            (don't delete the socket and bidirectional mapping, that will be handled by the 'disconnect' event)
        
      
            