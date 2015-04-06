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
         this.drawCanvasMessage();
       },
       'canvasMessage' : null,
       'drawCanvasMessage' : function() {
         if (TEST_ARENA.canvasMessage) {
           TEST_ARENA.context.clearRect ( 0 , 0 , TEST_ARENA.canvas.width, TEST_ARENA.canvas.height );
           TEST_ARENA.context.font= 30  * TEST_ARENA.scale + 'px Arial';
           TEST_ARENA.context.fillStyle="black";
           TEST_ARENA.context.fillText(TEST_ARENA.canvasMessage, 1050/2 * TEST_ARENA.scale - 100, 650/2 * TEST_ARENA.scale); 
         }
       },
       'gameStateQueue' : null, //Set by resetGameStateQueue
       'state' : 'pageLoaded',

   }
   
   //----------------------------------TEST_ARENA State Transitions------------------------------------   
   TEST_ARENA.transitionPageToState = function(state) {
     if (state === 'pageLoaded') {
       window.requestAnimFrame = (function(callback) {
         return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
             || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
               window.setTimeout(callback, 1000 / 60);
             };
       })();
       window.onresize = function() {
         TEST_ARENA.resizeCanvas();
       }
       TEST_ARENA.canvas = document.getElementById("GameCanvas");
       TEST_ARENA.context = TEST_ARENA.canvas.getContext('2d');
       TEST_ARENA.canvasMessage = "Upload Bots to Continue...";
       TEST_ARENA.resizeCanvas();
       setGameControlDiv("hide");
       TEST_ARENA.state = 'pageLoaded';
       stopGameStateRequester();
     }
     else if (state === 'uploaded') {
       TEST_ARENA.canvasMessage = "Press Start Game to continue...";
       TEST_ARENA.drawCanvasMessage();
       setGameControlDiv("startGame");
       TEST_ARENA.state = 'uploaded';

       stopGameStateRequester();
     }
     else if (state === 'loadingGame') {
       TEST_ARENA.resetGameStateQueue();
       TEST_ARENA.canvasMessage = "Loading...";
       TEST_ARENA.drawCanvasMessage();
       TEST_ARENA.state = 'loading';
       
       setGameControlDiv('killGame');
       startGameStateRequester();
     }
     else if (state === 'gameStarted') {
       // Currently not necessary but may be (this is after the initial game state is received.
       TEST_ARENA.state = 'gameStarted';
     }
     else if (state === 'gameFinished') {
       stopGameStateRequester();
       setGameControlDiv("startGame");
       TEST_ARENA.canvasMessage = "The game has ended, press start game to play again, or upload to try new bots...";
       TEST_ARENA.state = 'gameFinished';
     }
   }
   
   TEST_ARENA.transitionPageToState('pageLoaded');
 
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
         id : TEST_ARENA.myId
       },
       error : function() {
         alert('Close notification error');
       },
       url : '/deleteTestArenaInstance'
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
 
   function handleUnexpectedResponse(from, response) {
     flashStatusOrErrorMessage('error', "Unexpected response received, if this problem persists see your administrator.");

     TEST_ARENA.transitionPageToState('pageLoaded');
     console.log("Unexpected response from", from, ":", response);
   }
   
   function handleExpiredID() {
     console.log("Handle expiredID");
     flashStatusOrErrorMessage('error', "The record associated with your id has expired. Please upload new bots to continue.");
     TEST_ARENA.transitionPageToState('pageLoaded');
   }
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
     var data = new FormData(document.forms.namedItem("uploadBotForm"));
     var req = new XMLHttpRequest();
     var response = null;
     req.open("POST", "processBotUploads/?oldId=" + TEST_ARENA.myId, true);
     req.onload = function(event) {
       try {
         response = JSON.parse(req.responseText);
         if (req.status == 200) {
           if (response.status) {
             TEST_ARENA.myId = response.id;
             flashStatusOrErrorMessage('status', response.status);
             TEST_ARENA.transitionPageToState('uploaded');
           }
           else if (response.error) {
             flashStatusOrErrorMessage('error', response.error);
             TEST_ARENA.transitionPageToState('pageLoaded');
           } 
           else {
             handleUnexpectedResponse('processBotUploads', response);
           }
         } 
         else {
           handleUnexpectedResponse('processBotUploads', response);
         }
       }
       catch (e) {
         handleUnexpectedResponse('processBotUploads', req.responseText);
       }
     };
     req.send(data);
     ev.preventDefault();
   }, false);
   
   
 //----------------------------------Start Game------------------------------------
 // Valid events are 'success', 'expiredID', anything else will be treated as unexpected
   document.getElementById("startNewGame").addEventListener('click', function(ev) {
     var req = new XMLHttpRequest();
     var response = null;
     req.open("GET", "startGame/?id=" + TEST_ARENA.myId, true);
     req.onload = function(event) {
       try {
         response = JSON.parse(req.responseText);
         if (req.status == 200) {
           if (response.millisecondsUntilExpiration) {
             flashStatusOrErrorMessage('warning', "Your game session will expire in " + response.millisecondsUntilExpiration / 1000 + " seconds.");
           }
           if (response.event === 'success') {
             flashStatusOrErrorMessage('status', "The game is loading, please wait.");
             TEST_ARENA.transitionPageToState('loadingGame');
           } 
           else if (response.event === 'expiredID') {
             handleExpiredID();
           }
           else {
             handleUnexpectedResponse('startNewGame', response);
           }
         } 
         else {
           handleUnexpectedResponse('startNewGame', response);
         }
       }
       catch (e) {
         handleUnexpectedResponse('startNewGame', req.responseText);
       }
     }
     req.send();
     ev.preventDefault();
   }, false);
   
   //----------------------------------Send Move------------------------------------
// Valid events are 'success', 'expiredID', and 'noGameRunning' anything else will be treated as unexpected
   document.getElementById("send_move").addEventListener('click', function(ev) {
     var req = new XMLHttpRequest();
     req.open("GET", "sendMove/?id=" + TEST_ARENA.myId + "&move=" + document.getElementById("humanInput_stdin").value, true);
    
     req.onload = function(event) {
       console.log(req.responseText);
       try {
         response = JSON.parse(req.responseText);
         if (req.status == 200) {
           if (response.millisecondsUntilExpiration) {
             flashStatusOrErrorMessage('warning', "Your game session will expire in " + response.millisecondsUntilExpiration / 1000 + " seconds.");
           }
           if (response.event === 'success') {
             flashStatusOrErrorMessage('status', "Your move has been submitted.");
           }
           else if (response.event === 'noGameRunning') {
             flashStatusOrErrorMessage('error', "The game is not running, press Start Game or upload new bots to continue.");
             TEST_ARENA.transitionPageToState('uploaded');
           }
           else if (response.event === 'expiredID') {
             handleExpiredID();
           }
           else {
             handleUnexpectedResponse('send_move', response);
           }
         } 
         else {
           handleUnexpectedResponse('send_move', response);
         }
       }
       catch (e) {
         handleUnexpectedResponse('send_move', req.responseText);
       }
     }
     req.send();
     ev.preventDefault();
   }, false);
   
   //----------------------------------Kill Game------------------------------------
   document.getElementById("killCurrentGame").addEventListener('click', function(ev) {
     var req = new XMLHttpRequest();
     var response = null;

     req.open("GET", "killCurrentGame/?id=" + TEST_ARENA.myId, true);
     
     req.onload = function(event) {
       try {
         response = JSON.parse(req.responseText);
         if (req.status == 200) {
           if (response.millisecondsUntilExpiration) {
             flashStatusOrErrorMessage('warning', "Your game session will expire in " + response.millisecondsUntilExpiration / 1000 + " seconds.");
           }
           if (response.event === 'success') {
             flashStatusOrErrorMessage('status', "The game has been killed, start a new game or upload new bots to continue...");
             TEST_ARENA.transitionPageToState('uploaded');
           } 
           else if (response.event === 'expiredID') {
             handleExpiredID();
           }
           else {
             handleUnexpectedResponse('killCurrentGame', response);
           }
         } 
         else {
           handleUnexpectedResponse('killCurrentGame', response);
         }
       }
       catch (e) {
         handleUnexpectedResponse('killCurrentGame', req.responseText);
       }
     }
     req.send();
     ev.preventDefault();
   }, false);
   
 //----------------------------------GameState Requester------------------------------------
   var GameStateRequester = null;
   function startGameStateRequester() {
     GameStateRequester = setInterval(requestLatestGameStates, 1000);
   }
   
   function stopGameStateRequester() {
     console.log("Stopping gameStateRequester");
     if (GameStateRequester) {
       clearInterval(GameStateRequester);
       GameStateRequester = null;
     }
   }
   
   function requestLatestGameStates() {
     var req = new XMLHttpRequest();
     var response = null;
     req.open("GET", "getLatestGameStates/?id=" + TEST_ARENA.myId, true);
     
     req.onload = function(event) {
       try {
         response = JSON.parse(req.responseText);
         if (req.status == 200) {
           if (response.millisecondsUntilExpiration) {
             flashStatusOrErrorMessage('warning', "Your game session will expire in " + response.millisecondsUntilExpiration / 1000 + " seconds.");
           }
           
           if (response.event === 'success') {
             if(response.gamestates){
               for ( var turnIndex in response.gamestates) {
                 console.log("gameState /n",response.gamestates[turnIndex]);
                 TEST_ARENA.gameStateQueue.addNewGameState(response.gamestates[turnIndex]);
               }
             }
             else {
               console.log("Expected gamestates on successful response to getLatestGameStates",
                   "but received this reponse intead: " + response);
             }
           }
           else if (response.event === 'noGameRunning') {
             //flashStatusOrErrorMessage('error', "The game is not running, press Start Game or upload new bots to continue.");
             flashStatusOrErrorMessage('error', "The game has stopped unexpectedly, if this problem persists see your administrator");
             TEST_ARENA.transitionPageToState('uploaded');
           }
           else if (response.event === 'expiredID') {
             handleExpiredID();
           }
           else {
             handleUnexpectedResponse('getLatestGameStates', response);
           }
         } 
         else {
           handleUnexpectedResponse('getLatestGameStates', response);
         }
       }
       catch (e) {
         handleUnexpectedResponse('getLatestGameStates', req.responseText);
       }
     }
     req.send();
   };
   
   //----------------------------------GameState Queue------------------------------------

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
             TEST_ARENA.transitionPageToState('gameStarted');
             flashStatusOrErrorMessage('status', "We got the initial game state");
             GAME.resetGameboard(function(err) {
               var draw = function() {
                 GAME.drawer.drawBoard();
                 if (TEST_ARENA.state === 'gameStarted') {
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
             TEST_ARENA.transitionPageToState('gameFinished');
             flashStatusOrErrorMessage('status', "We got the final game state");
             passGameStateToGAME(nextGameState);
           }
           else {
             console.log("Invalid gameState type: " + nextGameState.type + " not sure how to process this");
           }
          
         }
       }
       
     })();
   }
   
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
         $('#humanInput').hide();
       }
       else if (startGame_or_killGame_or_hide === "killGame") {
         $('#gameControlDiv').show();
         $('#startNewGame').hide();
         $('#killCurrentGame').show();
         $('#humanInput').show();
         $('#moveList').html("");
         $('#stdout').html("");
         $('#stderr').html("");
       }
       else if (startGame_or_killGame_or_hide === "hide") {
         $('#gameControlDiv').hide();
         $('#startNewGame').hide();
         $('#killCurrentGame').hide();
         $('#humanInput').hide();
         $('#gameControlStatus').html("");
         $('#moveList').html("");
         $('#stdout').html("");
         $('#stderr').html("");
       }
       else {
         console.log("Invalid Argument to setGameControlDiv");
       }
     }
     
     /*
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
     */

   
 //----------------------------------Old stuff------------------------------------
 
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
   }*/
 })();