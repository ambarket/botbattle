//Wrap everything in a function, so local variables don't become globals
 (function() {
   // Define global TEST_ARENA namespace to be shared throughout client side code
   TEST_ARENA = {
       'myId' : "defaultIdValue", 
       'canvas' : null, // Set in testArena.js after page has loaded
       'context' : null, // Set in testArena.js after page is loaded
       'scale' : 1, // set by resizeCanvas
       'resizeCanvas' : function(){
         this.canvas.width = Math.min(this.canvas.parentNode.getBoundingClientRect().width, 1050);
         this.canvas.height = this.canvas.width * 0.619047619;  // 650/1050 = 0.619047619
         this.scale = document.getElementById("GameCanvas").width / 1050;
      },
       'gameStateQueue' : null //Set by resetGameStateQueue
   }

   TEST_ARENA.resetGameStateQueue = function() {
     // Stop it if its running since were about to lose reference to it.
     if (TEST_ARENA.gameStateQueue) {TEST_ARENA.gameStateQueue.stop()}
     TEST_ARENA.gameStateQueue = new (function(){
       var self = this;
       var gameStateQueue = [];
       var imRunning = false;
       
       this.addNewGameState = function(gamestate) {
         gameStateQueue.push(gamestate);
     
         if (!imRunning) {
           imRunning = true;
           processNextGameState();
         }
       }
       
       this.stop = function() {
         imRunning = false;
       }
     
       var passGameStateToGAME = function(nextGameState) {
         // TODO: Handle errors, also not sure if its better to output gameData and debugging before or after the animations
         GAME.processGameData(nextGameState.gameData, function(err) {
           GAME.processDebugData(nextGameState.debugData, function(err) {
             async.eachSeries(nextGameState.animatableEvents, GAME.processAnimatableEvent, function(err) {
               processNextGameState();
             });        
           });
         });
       }
       
       var processNextGameState = function() {
         var nextGameState = gameStateQueue.splice(0, 1)[0];
     
         if (!nextGameState) {
           imRunning = false;
         } 
         else {
           if (nextGameState.type === 'initial') {
             setGameControlDiv('killGame');
             console.log("initial");
             flashStatusOrErrorMessage('status', "We got the initial game state");
             GAME.resetGameboard(function(err) {
               TEST_ARENA.state = 'playing';
               var draw = function() {
                 GAME.drawer.drawBoard();
                 if (TEST_ARENA.state === 'playing') {
                   requestAnimFrame(draw);
                 }
               };
               draw();
               passGameStateToGAME(nextGameState);
             });
           }
           else if (nextGameState.type === 'midGame') {
             flashStatusOrErrorMessage('status', "We got a midGame game state");
             passGameStateToGAME(nextGameState);
           }
           else if (nextGameState.type === 'final') {
             flashStatusOrErrorMessage('status', "We got the final game state");
             passGameStateToGAME(nextGameState);
             TEST_ARENA.state = 'ended';
             setGameControlDiv('startGame');
           }
           else {
             console.log("Invalid gameState type: " + nextGameState.type + " not sure how to process this");
           }
          
         }
       }
       
     })();
   }
 
 //----------------------------------Page Unload Handling------------------------------------
   function leave() {
     return "Leaving the page will stop your program from running!";
   }
 
   // TODO: guess this doesn't work sometimes
   // https://xhr.spec.whatwg.org/
   var unloadHandler = function() {
     $.ajax({
       async : false,
       data : {
         id : TEST_ARENAARENA.myId
       },
       error : function() {
         alert('Close notification error');
       },
       url : '/killGame'
     });
   }
 
   $(function() {
     $(window).unload(function() {
       unloadHandler();
     });
     $('a.outlink').click(function() {
       unloadHandler = function() {
       };
     });
   });
 
 //----------------------------------Helper Stuff------------------------------------
   var resetValueAttrributeById = function(id) {
     document.getElementById(id).value = "";
   }
 
   TEST_ARENA.appendArrayOfDivsToHtmlElementById = function(id, contentArray) {
     for (var i = 0; i < contentArray.length; i++) {
       TEST_ARENA.appendDivToHtmlElementById(id, contentArray[i]);
     }
   }

   TEST_ARENA.appendDivToHtmlElementById = function(id, content) {
     //Add debugging data to the page
     var element =  document.getElementById(id);
     var html = [];
     html.push(element.innerHTML);
     html.push('<div>' + content + '</div>');
     element.innerHTML = html.join('');
     element.scrollTop = element.scrollHeight;
   }
   
   TEST_ARENA.coinFlip = function(weight){
     var coin = Math.random();
     if(weight){
         return (coin + weight <= .50);
     }
     else{
         return (coin <= .50);
     }
   }
   
   $('#player1_bot_upload').click(function() {
     document.getElementById("uploadBotStatus").innerHTML = "";
   });
 
   $('#player2_bot_upload').click(function() {
     document.getElementById("uploadBotStatus").innerHTML = "";
   });
   
   function setGameControlDiv(startGame_or_killGame_or_hide) {
     if (startGame_or_killGame_or_hide === "startGame") {
       $('#gameControlDiv').show();
       $('#startNewGame').show();
       $('#killCurrentGame').hide();
       $('#gameControlStatus').html("Press Start Game to play a new game with the uploaded bots");
     }
     else if (startGame_or_killGame_or_hide === "killGame") {
       console.log("killGame");
       $('#gameControlDiv').show();
       $('#startNewGame').hide();
       $('#killCurrentGame').show();
       $('#gameControlStatus').html("The game is running");
     }
     else if (startGame_or_killGame_or_hide === "hide") {
       $('#gameControlDiv').hide();
       $('#startNewGame').hide();
       $('#killCurrentGame').hide();
       $('#gameControlStatus').html("");
     }
     else {
       console.log("Invalid Argument to setGameControlDiv");
     }
   }
   
   document.getElementById("echo_send_move").addEventListener('click', function(ev) {
     var req = new XMLHttpRequest();
     req.open("GET", "echoTest/?id=" + TEST_ARENA.myId + "&echo_stdin=" + document.getElementById("echo_stdin").value, true);
     req.onload = function(event) {
       var response = JSON.parse(req.responseText);
       if (response.error) {
         document.getElementById("echo_status").innerHTML = response.error;
       } else if (response.status) {
         document.getElementById("echo_status").innerHTML = response.status;
       } else {
         // Something else
         document.getElementById("echo_status").innerHTML = response;
       }
     };
     req.send();
     ev.preventDefault();
   }, false);
 
 //----------------------------------Upload Bots Form------------------------------------
   // Listen for radio checks
   $('#human').click(function() {
     $('#uploadBotButton').val("Upload Bot");
     $('#player2FileChoose').hide();
     $('#humanInput').show();
     $('#gameControlDiv').hide();
     resetValueAttrributeById('player2_bot_upload');
     resetValueAttrributeById('player1_bot_upload');
     document.getElementById("uploadBotStatus").innerHTML = "";
     document.getElementById("player2_bot_upload").required = false;
   });
 
   $('#bot').click(function() {
     $('#uploadBotButton').val("Upload Bots");
     $('#player2FileChoose').show();
     $('#humanInput').hide();
     $('#gameControlDiv').hide();
     resetValueAttrributeById('player2_bot_upload');
     resetValueAttrributeById('player1_bot_upload');
     document.getElementById("uploadBotStatus").innerHTML = "";
     document.getElementById("player2_bot_upload").required = true;
   });
   
   var uploadBotsform = document.forms.namedItem("uploadBotForm");
   uploadBotsform.addEventListener('submit', function(ev) {
     var output = document.getElementById("uploadBotStatus");
     var data = new FormData(document.forms.namedItem("uploadBotForm"));
     var req = new XMLHttpRequest();
     var response = null;
     req.open("POST", "processBotUploads/?oldId=" + TEST_ARENA.myId, true);
     req.onload = function(event) {
       try {
         response = JSON.parse(req.responseText);
       }
       catch (e) {
         response = req.responseText;
         console.log("Response to processBotUploads was not valid json " + response)
       }
       if (req.status == 200) {
         console.log("Good status " + JSON.stringify(response));
         if (response.status) {
           flashStatusOrErrorMessage('status', response.status);
           setGameControlDiv("startGame");
           TEST_ARENA.myId = response.id;
         }
         // On the server side we should probably send errors with a different status code
         else if (response.error) {
           flashStatusOrErrorMessage('error', response.error);
           setGameControlDiv("hide");
         } 
         else {
           console.log("Valid response to processBotUploads but no status to display");
         }
       } 
       else {
         console.log("Bad status " + JSON.stringify(response));
         if (response.error) {
           flashStatusOrErrorMessage('error', response.error);
         }
         else {
           flashStatusOrErrorMessage('error', "Error " + req.status + " occured while uploading your bots.");
         }
         //disable play game button
         setGameControlDiv("hide");
       }
       // enable upload button in each case
     };
     req.send(data);
     ev.preventDefault();
   }, false);
   
   
 //----------------------------------Start and Kill Game------------------------------------
 
   document.getElementById("startNewGame").addEventListener('click', function(ev) {
     var req = new XMLHttpRequest();
     var response = null;
     req.open("GET", "startGame/?id=" + TEST_ARENA.myId, true);
     req.onload = function(event) {
       try {
         response = JSON.parse(req.responseText);
       }
       catch (e) {
         response = req.responseText;
         console.log("Response to startGame was not valid json " + response)
       }
       if (req.status == 200) {
         console.log("Good status " + JSON.stringify(response));
         if (response.status) {
           flashStatusOrErrorMessage('status', response.status);
         } 
         else if (response.error) {
           flashStatusOrErrorMessage('error', response.error);
         }
         else {
           console.log("Valid response to startNewGame but no status to display");
         }
         setGameControlDiv('killGame');
         startGameStateListener();
       } 
       else {
         console.log("Bad status " + JSON.stringify(response));
         if (response.error) {
           flashStatusOrErrorMessage('error', response.error);
         } 
         else {
           flashStatusOrErrorMessage('error', "Error " + req.status + " occured while attempting to start the game");
         }
         setGameControlDiv('startGame');
         stopGameStateListener();
       }
     }
     req.send();
     ev.preventDefault();
   }, false);
   
   document.getElementById("killCurrentGame").addEventListener('click', function(ev) {
     var req = new XMLHttpRequest();
     var response = null;
     stopGameStateListener();
     req.open("GET", "killCurrentGame/?id=" + TEST_ARENA.myId, true);
     req.onload = function(event) {
       try {
         response = JSON.parse(req.responseText);
       }
       catch (e) {
         response = req.responseText;
         console.log("Response to killCurrentGame was not valid json " + response)
       }
       if (req.status == 200) {
         console.log("Good status " + JSON.stringify(response));
         if (response.status) {
           flashStatusOrErrorMessage('status', response.status);
         } 
         else if (response.error){
           flashStatusOrErrorMessage('error', response.error);
         }
         else {
           console.log("Valid response to killCurrentGame but no status to display");
         }
         setGameControlDiv('startGame');
       } 
       else {
         console.log("Bad status " + JSON.stringify(response));
         if (response.error) {
           flashStatusOrErrorMessage('error', response.error);
         } 
         else {
           flashStatusOrErrorMessage('error', "Error " + req.status + " occured while attempting to start the game");
         }
         // Not really sure what to do at this point.
         setGameControlDiv('killGame');
       }
     }
     req.send();
     ev.preventDefault();
   }, false);
   
 //----------------------------------GameState Listener/Requester or whatever------------------------------------
   var gameStateListener = null;
   function startGameStateListener() {
     gameStateListener = setInterval(requestLatestGameStates, 1000);
   }
   
   function stopGameStateListener() {
     if (gameStateListener) {
       clearInterval(gameStateListener);
       gameStateListener = null;
     }
   }
 
   function requestLatestGameStates() {
     console.log("here");
     var output = document.getElementById("stdout");
     var req = new XMLHttpRequest();
     req.open("GET", "getLatestGameStates/?id=" + TEST_ARENA.myId, true);
     req.onload = function(event) {
       if (req.status == 200) {
         response = JSON.parse(req.responseText);
         console.log("response", response);
         if(response.gamestates){
           for ( var turnIndex in response.gamestates) {
             console.log("gameState /n",response.gamestates[turnIndex]);
             TEST_ARENA.gameStateQueue.addNewGameState(response.gamestates[turnIndex]);
           }
         }
       } 
       else {
         output.innerHTML = "Error " + req.status + " occurred getting latest game states.<br \/>";
         console.log("Bad status " + JSON.stringify(response));
         stopGameStateListener();
       }
     };
     req.send();
   }
   
   function requestLatestGameStates() {
     var req = new XMLHttpRequest();
     var response = null;
     req.open("GET", "getLatestGameStates/?id=" + TEST_ARENA.myId, true);
     req.onload = function(event) {
       try {
         response = JSON.parse(req.responseText);
       }
       catch (e) {
         response = req.responseText;
         console.log("Response to requestLatestGameStates was not valid json " + response)
       }
       if (req.status == 200) {
         console.log("Good status " + JSON.stringify(response));
         if(response.gamestates){
           for ( var turnIndex in response.gamestates) {
             console.log("gameState /n",response.gamestates[turnIndex]);
             TEST_ARENA.gameStateQueue.addNewGameState(response.gamestates[turnIndex]);
           }
         }
         
         if (response.status) {
           flashStatusOrErrorMessage('status', response.status);
         } 
         else if (response.error){
           flashStatusOrErrorMessage('error', response.error);
         }
         else {
           console.log("Valid response to getLatestGameStates but no status to display");
         }
       } 
       else {
         console.log("Bad status " + JSON.stringify(response));
         if (response.error) {
           flashStatusOrErrorMessage('error', response.error);
         } 
         else {
           flashStatusOrErrorMessage('error', "Error " + req.status + " occured while attempting to get latest game states");
         }
         stopGameStateListener();
       }
     }
     req.send();
   };
   
 //----------------------------------Old stuff------------------------------------
 
   window.requestAnimFrame = (function(callback) {
     return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
         || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
           window.setTimeout(callback, 1000 / 60);
         };
   })();
 
   // TODO: Maybe extend this into a button that when clicked would reset the entire canvas
   //    and all object back to default so another game could be played
   (function resetTestArena() {
     TEST_ARENA.canvas = document.getElementById("GameCanvas");
     TEST_ARENA.context = TEST_ARENA.canvas.getContext('2d');
     TEST_ARENA.resetGameStateQueue();
     //registerClickListeners();
 
     GAME.resetGameboard(function(err) {
 
       TEST_ARENA.resizeCanvas();
 
       window.onresize = function() {
         TEST_ARENA.resizeCanvas();
       }
 
       function draw() {
         GAME.drawer.drawBoard();
         requestAnimFrame(draw);
       };
 
       draw();
 
     })
   })();
 
   /*function registerClickListeners() {
 
     // add click listener to canvas to get distances between two clicked points
     (function() {
       var x1, x2, y1, y2;
       var clickCount = 0;
       var rect;
       TEST_ARENA.canvas.addEventListener('click', function(event) {
         console.log("Someone Clicked");
         if (event.ctrlKey) {
           rect = TEST_ARENA.canvas.getBoundingClientRect();
           clickCount++;
           if (clickCount % 2 === 1) {
             x1 = event.clientX - Math.floor(rect.left);
             y1 = event.clientY - Math.floor(rect.top);
           } else {
             x2 = event.clientX - Math.floor(rect.left);
             y2 = event.clientY - Math.floor(rect.top);
           }
           if (x1 && x2) {
             document.getElementById("distance").innerHTML = "X dist = " + Math.abs(x1 - x2) + "  Y dist = "
                 + Math.abs(y1 - y2) + "<hr> point1 = X: " + x1 + " Y: " + y1 + "<hr> point2 = X: " + x2 + " Y: " + y2;
             x1 = x2 = y1 = y2 = null;
           }
         } else {
 
           //sendMoveOverAjax(event);
         }
       });
     })();
 
     function sendMoveOverAjax(ev) {
       document.getElementById("send_move").disabled = true;
       var req = new XMLHttpRequest();
       req.open("POST", "testArenaUpdate", true);
       try {
         req.send(TEST_ARENA.myId); 
         //TODO I think onReadyStateChange may allow us to detect if the request failed to post,
         //  need to do something about this because otherwise button just remains disabled.
         // Test by shutting down server then clicking it.
         req.onload = function(event) {
           if (req.status === 200) {
             TEST_ARENA.appendDivToHtmlElementById('send_move_message', "GameState received");
             console.log(req.responseText);
 
             // Parse into JSON
             var response = JSON.parse(req.responseText);
             // Just use each turn object as a gamestate.
             // Each gamestate must have an animatableEvents array, gameData object, and debugData object
             for ( var turnIndex in response) {
               TEST_ARENA.gameStateQueue.addNewGameState(response[turnIndex]);
             }
           } else {
             TEST_ARENA.appendDivToHtmlElementById('send_move_message', "Failed to get GameState");
           }
           document.getElementById("send_move").disabled = false;
         };
       } catch (err) {
         TEST_ARENA.appendDivToHtmlElementById('send_move_message', err.message);
         document.getElementById("send_move").disabled = false;
       }
 
       ev.preventDefault();
     }
 
     document.getElementById("send_move").addEventListener('click', sendMoveOverAjax, false);
   }*/
 })();