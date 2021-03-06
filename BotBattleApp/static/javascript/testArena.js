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
   
   //----------------------------------GameState Queue------------------------------------

   TEST_ARENA.resetGameStateQueue = function() {
     // Stop it if its running since were about to lose reference to it.
     if (TEST_ARENA.gameStateQueue) {TEST_ARENA.gameStateQueue.stop()}
     TEST_ARENA.gameStateQueue = new (function(){
       var self = this;
       var gameStateQueue = [];
       var imRunning = false;
       var nextGameState = null;    // Closure variable, updated at beginning of processNextGameState
       var animateGameStates = true;
       document.getElementById("disableAnimations").addEventListener('click', function(ev) {
         $('#disableAnimations').hide();
         animateGameStates = false;
       });
       
       this.addNewGameState = function(gamestate) {
         if (gamestate.messageType === 'finalGamestate') {
           $('#disableAnimations').show();
         }
         
         gameStateQueue.push(gamestate);
     
         if (!imRunning) {
           imRunning = true;
           processNextGameState();
         }
       }
       
       this.stop = function() {
         imRunning = false;
         gameStateQueue = [];
       }
       
       var processNextGameState = function() {
         nextGameState = gameStateQueue.splice(0, 1)[0];
     
         if (!nextGameState) {
           imRunning = false;           
         } 
         else {
           if (!imRunning) {
             
             return;
           }
           
           if (nextGameState.messageType === 'initialGamestate') {
             TEST_ARENA.transitionPageToState('gameStarted');
             GAME.resetGameboard(function(err) {
               var draw = function() {
                 GAME.drawBoard();
                 if (TEST_ARENA.state === 'gameStarted' || imRunning) {
                   requestAnimFrame(draw);
                 }
               };
               draw();
               passGameStateToGAME();
             });
           }
           else if (nextGameState.messageType === 'midGamestate') {
             //GLOBAL.eventLog.logMessage('status', "We got a midGame game state");
             passGameStateToGAME();
           }
           else if (nextGameState.messageType === 'finalGamestate') {
             //GLOBAL.eventLog.logMessage('status', "We got the final game state");
             passGameStateToGAME();
             TEST_ARENA.transitionPageToState('gameFinished');
           }
           else if (nextGameState.messageType === 'invalidMove') {
             GLOBAL.eventLog.logMessage('error', 
                 "Invalid move received from " + nextGameState.player + "<br>" + 
                 "Move: " + nextGameState.move + "<br>" +
                 "Reason: " + nextGameState.reason);
             GAME.setHumanInputElements();
             document.getElementById("humanInput").style.display = "block";
             GLOBAL.appendDivToHtmlElementById('stdout', nextGameState.move);
             GLOBAL.appendArrayOfDivsToHtmlElementById('stderr', nextGameState.stderr);
             processNextGameState();
           }
           else {
             console.log("Invalid gameState type: " + nextGameState.messageType + " not sure how to process this");
           }
         }
       }
       
       var passGameStateToGAME = function() {
         var seriesOfEvents = null;
         if (animateGameStates || gameStateQueue.length === 0) {
           seriesOfEvents = [passGameDataToGAME, passDebugDataToGAME, passAnimatableEventsToGAME, checkEnableHumanInput];
         }
         else {
           seriesOfEvents = [passGameDataToGAME, passDebugDataToGAME, checkEnableHumanInput];
         }
         
         async.series(seriesOfEvents, function(err) {
           setTimeout(function() {
             if (err) {
               GLOBAL.handleClientError("passGameStateToGAME", err);
               TEST_ARENA.transitionPageToState('pageLoaded');
               imRunning = false;
               gameStateQueue = [];
             }
             else {
               processNextGameState();
             }
           }, 50); // short delay to make it look nicer

         });
       }
       
       var passGameDataToGAME = function(gameDataCallback) {
         if (nextGameState.gameData) {
           GAME.processGameData(nextGameState.messageType, nextGameState.gameData, gameDataCallback);
         }
         else {
           console.log("No game data to process, moving on to debugData and animatable events");
           gameDataCallback(null);
         }
       }
           
       var passDebugDataToGAME = function(debugDataCallback) {
         if (nextGameState.debugData) {
           GAME.processDebugData(nextGameState.messageType, nextGameState.debugData, debugDataCallback);
         }
         else {
           debugDataCallback(null);
         }
       }

       var passAnimatableEventsToGAME = function(animatableEventsCallback) {
         if (nextGameState.animatableEvents) {
           async.eachSeries(nextGameState.animatableEvents, GAME.processAnimatableEvent, animatableEventsCallback);
         }
         else {
           animatableEventsCallback(null);
         }
       }
       
       var checkEnableHumanInput = function(enableHumanInputCallback) {
           // If the game manager is waiting for human input 
           if (nextGameState.enableHumanInput) {
             GAME.setHumanInputElements();
             document.getElementById("humanInput").style.display = "block";
           }
           else {
             document.getElementById("humanInput").style.display = "none";
             document.getElementById("humanInputElements").innerHTML = "";
           }
           enableHumanInputCallback();
       }
     })();
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
       
       TEST_ARENA.state = 'pageLoaded';
       stopGameStateRequester();
       TEST_ARENA.resetGameStateQueue();
       TEST_ARENA.canvas = document.getElementById("GameCanvas");
       TEST_ARENA.context = TEST_ARENA.canvas.getContext('2d');
       TEST_ARENA.canvasMessage = "Upload Bots to Continue...";
       TEST_ARENA.drawCanvasMessage();
       TEST_ARENA.resizeCanvas();
       setGameControlDiv("hide");
       GAME.setExtraGameControls();
     }
     else if (state === 'uploaded') {
       TEST_ARENA.state = 'uploaded';
       stopGameStateRequester();
       TEST_ARENA.resetGameStateQueue();
       
       TEST_ARENA.canvasMessage = "Press Start Game to continue...";
       TEST_ARENA.drawCanvasMessage();
       setGameControlDiv("startGame");
       GAME.setExtraGameControls();
     }
     else if (state === 'loadingGame') {
       TEST_ARENA.state = 'loading';
       TEST_ARENA.resetGameStateQueue();
       startGameStateRequester();
       
       TEST_ARENA.canvasMessage = "Loading...";
       TEST_ARENA.drawCanvasMessage();
       
       setGameControlDiv('killGame');
       GAME.setExtraGameControls();

     }
     else if (state === 'gameStarted') {
       // The draw function will continue drawing until the state is no longer 'gameStarted'
    	 //	or there are still game states in the game state queue and the user hasn't clicked
    	 // kill game.
       
       TEST_ARENA.state = 'gameStarted';
       GAME.setExtraGameControls();
     }
     else if (state === 'gameFinished') {
       stopGameStateRequester();
       TEST_ARENA.resetGameStateQueue();
       setGameControlDiv("startGame");
       TEST_ARENA.canvasMessage = "The game has ended, press start game to play again, or upload to try new bots...";
       TEST_ARENA.state = 'gameFinished';
       GAME.setExtraGameControls();
     }
   }
   
   TEST_ARENA.transitionPageToState('pageLoaded');
 
 //----------------------------------Page Unload Handling------------------------------------ 
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
  
   

   //--------------------------Play Or Share Radio------------------------------------
   $('#playRadio').click(playRadioClick);
   function playRadioClick() {
     $("#playRadio").prop("checked", true);
     $('#uploadBotForm').show();
     $('#shareBotForm').hide();
     
     document.getElementById("userID").innerHTML = "";
     
     botRadioClick();
     customPlayer1Click();
     customPlayer2Click();
   }
   playRadioClick();    // Also clicks others so this is the only default we should need.
   
   $('#shareRadio').click(shareRadioClick);
   function shareRadioClick() {
     $("#shareRadio").prop("checked", true);
     $('#uploadBotForm').hide();
     $('#shareBotForm').show();
   }
     
 //--------------------------Custom Bot Radio Buttons------------------------------------
   $('#custom_player1_bot_select').click(customPlayer1Click);
   function customPlayer1Click() {
     $("#custom_player1_bot_select").prop("checked", true);
     
     $('#player1_shared_bot_div').hide();
     $('#player1FileChoose').show();
     
     GLOBAL.resetValueAttrributeById('player1_shared_bot_id');
     GLOBAL.resetValueAttrributeById('player1_bot_upload');

     document.getElementById("player1_shared_bot_id").required = false;
     document.getElementById("player1_bot_upload").required = true;
   }
   
   $('#custom_player2_bot_select').click(customPlayer2Click);
   function customPlayer2Click() {
     $("#custom_player2_bot_select").prop("checked", true);
     
     $('#player2_shared_bot_div').hide();
     $('#player2FileChoose').show();
     
     GLOBAL.resetValueAttrributeById('player2_shared_bot_id');
     GLOBAL.resetValueAttrributeById('player2_bot_upload');

     document.getElementById("player2_shared_bot_id").required = false;
     document.getElementById("player2_bot_upload").required = true;
   } 
   
 //--------------------------Preloaded Bot Radio Buttons------------------------------------
   $('#preloaded_player1_bot_select').click(preloadedPlayer1Click);
   function preloadedPlayer1Click() {
     $("#preloaded_player1_bot_select").prop("checked", true);
     
     $('#player1_shared_bot_div').hide();
     $('#player1FileChoose').hide();
     
     GLOBAL.resetValueAttrributeById('player1_shared_bot_id');
     GLOBAL.resetValueAttrributeById('player1_bot_upload');

     document.getElementById("player1_shared_bot_id").required = false;
     document.getElementById("player1_bot_upload").required = false;
   }

   $('#preloaded_player2_bot_select').click(preloadedPlayer2Click);
   function preloadedPlayer2Click() {
     $("#preloaded_player2_bot_select").prop("checked", true);
     
     $('#player2_shared_bot_div').hide();
     $('#player2FileChoose').hide();
     
     GLOBAL.resetValueAttrributeById('player2_shared_bot_id');
     GLOBAL.resetValueAttrributeById('player2_bot_upload');

     document.getElementById("player2_shared_bot_id").required = false;
     document.getElementById("player2_bot_upload").required = false;
   }
   
   //--------------------------Shared Bot Radio Buttons------------------------------------
   $('#shared_player1_bot_select').click(sharedPlayer1Click);
   function sharedPlayer1Click() {
     $("#shared_player1_bot_select").prop("checked", true);
     
     $('#player1_shared_bot_div').show();
     $('#player1FileChoose').hide();
     
     GLOBAL.resetValueAttrributeById('player1_shared_bot_id');
     GLOBAL.resetValueAttrributeById('player1_bot_upload');

     document.getElementById("player1_shared_bot_id").required = true;
     document.getElementById("player1_bot_upload").required = false;
   }
   
   $('#shared_player2_bot_select').click(sharedPlayer2Click);
   function sharedPlayer2Click() {
     $("#shared_player2_bot_select").prop("checked", true);
     
     $('#player2_shared_bot_div').show();
     $('#player2FileChoose').hide();
     
     GLOBAL.resetValueAttrributeById('player2_shared_bot_id');
     GLOBAL.resetValueAttrributeById('player2_bot_upload');

     document.getElementById("player2_shared_bot_id").required = true;
     document.getElementById("player2_bot_upload").required = false;
   }
   
   //-----------------------------Player 2 Type Radio (Human or Bot) --------------------------------
   // Listen for radio checks of the Player 2 Type radio
   $('#bot').click(botRadioClick);
   function botRadioClick() {
     $("#bot").prop("checked", true);
     $('#uploadBotButton').val("Upload Bots");
     $('#gameControlDiv').hide();
     
     $('#player_2_bot_select_div').show();
     customPlayer2Click();
   };
   
   
   $('#human').click(humanRadioClick);    
   function humanRadioClick() {
     $("#human").prop("checked", true);
     $('#uploadBotButton').val("Upload Bots");
     $('#gameControlDiv').hide();
     
     $('#player_2_bot_select_div').hide();
     $('#player2_shared_bot_div').hide();
     $('#player2FileChoose').hide();
     
     $("#custom_player2_bot_select").prop("checked", true);
     GLOBAL.resetValueAttrributeById('player2_shared_bot_id');
     GLOBAL.resetValueAttrributeById('player2_bot_upload');

     document.getElementById("player2_shared_bot_id").required = false;
     document.getElementById("player2_bot_upload").required = false;
   };
   
   var uploadBotsform = document.forms.namedItem("uploadBotForm");
   uploadBotsform.addEventListener('submit', function(ev) {
     var data = new FormData(document.forms.namedItem("uploadBotForm"));
     var req = new XMLHttpRequest();
     var response = null;
     req.open("POST", "processBotUploads/?oldId=" + TEST_ARENA.myId, true);
     req.onreadystatechange=function() {
       if (req.readyState==4) {
         if (req.status==200) {
           try {
             response = JSON.parse(req.responseText);
           }
           catch (e) {
             GLOBAL.handleUnexpectedResponse('processBotUploads', req.responseText);
             TEST_ARENA.transitionPageToState('pageLoaded');
             return; // Don't continue unless it was a json response.
           }
           try {
             if (response.status) {
               TEST_ARENA.myId = response.id;
               document.getElementById("userID").innerHTML = "";
               GLOBAL.eventLog.logMessage('status', response.status);
               TEST_ARENA.transitionPageToState('uploaded');
             }
             else if (response.error) {
               GLOBAL.eventLog.logMessage('error', response.error);
               TEST_ARENA.transitionPageToState('pageLoaded');
             } 
             else {
               GLOBAL.handleUnexpectedResponse('processBotUploads', response);
               TEST_ARENA.transitionPageToState('pageLoaded');
             }
           }
           catch(err) {
             GLOBAL.handleClientError('processBotUploads', err);
             TEST_ARENA.transitionPageToState('pageLoaded');
           }
         } else {
           GLOBAL.handleNonSuccessHttpStatus('processBotUploads', req.status, req.responseText);
           TEST_ARENA.transitionPageToState('pageLoaded');
         }
       }
     };
     req.send(data);
     ev.preventDefault();
   }, false);
   
 //---------------------------------Share a Bot Form------------------------------------
   var shareBotForm = document.forms.namedItem("shareBotForm");
   shareBotForm.addEventListener('submit', function(ev) {
     var data = new FormData(document.forms.namedItem("shareBotForm"));
     var req = new XMLHttpRequest();
     var response = null;
     
     req.open("POST", "processSharedBot/?oldId=" + TEST_ARENA.myId,  true);
     req.onreadystatechange=function() {
       if (req.readyState==4) {
         if (req.status==200) {
           try {
             response = JSON.parse(req.responseText);
           }
           catch (e) {
             GLOBAL.handleUnexpectedResponse('processBotShare', req.responseText);
             TEST_ARENA.transitionPageToState('pageLoaded');
             return; // Don't continue unless it was a json response.
           }
           try {
             if (response.status) {
               TEST_ARENA.myId = response.id;
               document.getElementById("userID").innerHTML = "Your Id: " + response.id;
               GLOBAL.eventLog.logMessage('status', response.status);
               TEST_ARENA.transitionPageToState('pageLoaded');
               console.log(response);
               if (response.expirationDate) {
                 GLOBAL.eventLog.logMessage('status', "Your bot will be available until " + (new Date(response.expirationDate)).toLocaleString() + " with id " + response.id );
               }
             }
             else if (response.error) {
               GLOBAL.eventLog.logMessage('error', response.error);
               TEST_ARENA.transitionPageToState('pageLoaded');
             } 
             else {
               GLOBAL.handleUnexpectedResponse('processBotShare', response);
               TEST_ARENA.transitionPageToState('pageLoaded');
             }
           }
           catch(err) {
             GLOBAL.handleClientError('processBotShare', err);
             TEST_ARENA.transitionPageToState('pageLoaded');
           }
         } else {
           GLOBAL.handleNonSuccessHttpStatus('processBotShare', req.status, req.responseText);
           TEST_ARENA.transitionPageToState('pageLoaded');
         }
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
     req.onreadystatechange=function() {
       if (req.readyState==4) {
         if (req.status==200) {
           try {
             response = JSON.parse(req.responseText);
           }
           catch (e) {
             GLOBAL.handleUnexpectedResponse('startNewGame', req.responseText);
             TEST_ARENA.transitionPageToState('pageLoaded');
             return; // Don't continue unless it was a json response.
           }
           try {
             switch(response.event) {
               case 'expiredID':
                 GLOBAL.handleExpiredID();
                 TEST_ARENA.transitionPageToState('pageLoaded');
                 break;
               case 'gameAlreadyRunning':
                 GLOBAL.eventLog.logMessage('error', "A running game is already associated with your ID, please kill the existing game before starting a new one.");
                 break;
               case 'gameManagerNotFound':
                 GLOBAL.handleServerError('startNewGame', response);
                 TEST_ARENA.transitionPageToState('pageLoaded');
                 break;
               case 'success':
                 GLOBAL.eventLog.logMessage('status', "The game is loading, please wait.");
                 TEST_ARENA.transitionPageToState('loadingGame');
                 break;
               default:
                 GLOBAL.handleUnexpectedResponse('startNewGame', response);
                 TEST_ARENA.transitionPageToState('pageLoaded');
                 break;
             }
           }
           catch(err) {
             GLOBAL.handleClientError('startNewGame', err);
             TEST_ARENA.transitionPageToState('pageLoaded');
           }
         } else {
           GLOBAL.handleNonSuccessHttpStatus('startNewGame', req.status, req.responseText);
           TEST_ARENA.transitionPageToState('pageLoaded');
         }
       }
     }
     req.send();
     ev.preventDefault();
   }, false);
   
   //----------------------------------Send Move------------------------------------
// Valid events are 'success', 'expiredID', and 'noGameRunning' anything else will be treated as unexpected
   document.getElementById("send_move").addEventListener('click', function(ev) {     
     var req = new XMLHttpRequest();
     req.open("GET", "sendMove/?id=" + TEST_ARENA.myId + "&move=" + GAME.getMoveFromHumanInputElements(), true);
     document.getElementById("humanInput").style.display = "none";
     document.getElementById("humanInputElements").innerHTML = "";
     req.onreadystatechange=function() {
       if (req.readyState==4) {
         if (req.status==200) {
           try {
             response = JSON.parse(req.responseText);
           }
           catch (e) {
             GLOBAL.handleUnexpectedResponse('sendMove', req.responseText);
             TEST_ARENA.transitionPageToState('pageLoaded');
             return; // Don't continue unless it was a json response.
           }
           try {
             switch(response.event) {
               case 'expiredID':
                 GLOBAL.handleExpiredID();
                 TEST_ARENA.transitionPageToState('pageLoaded');
                 break;
               case 'notExpectingHumanInput':
                 GLOBAL.eventLog.logMessage('error', "The game is not expecting human input, stop spamming us.");
                 break;
               case 'noGameRunning':
                 GLOBAL.eventLog.logMessage('error', "The game is no longer running, please start a new game to continue.");
                 TEST_ARENA.transitionPageToState('uploaded');
                 break;
               case 'success':
                 GLOBAL.eventLog.logMessage('status', "Your move has been submitted.");
                 break;
               default:
                 GLOBAL.handleUnexpectedResponse('sendMove', response);
                 TEST_ARENA.transitionPageToState('pageLoaded');
                 break;
             }
           }
           catch(err) {
             GLOBAL.handleClientError('sendMove', err);
             TEST_ARENA.transitionPageToState('pageLoaded');
           }
         } else {
           GLOBAL.handleNonSuccessHttpStatus('sendMove', req.status, req.responseText);
           TEST_ARENA.transitionPageToState('pageLoaded');
         }
       }
     }
     req.send();
     ev.preventDefault();
   }, false);
   
   //----------------------------------Get other IDs--------------------------------
   document.getElementById("player1_shared_bot_id").addEventListener('keypress', getAllSharedInstanceIds);
   document.getElementById("player2_shared_bot_id").addEventListener('keypress', getAllSharedInstanceIds);
       
    // Valid events are 'success', 'expiredID', and 'noGameRunning' anything else will be treated as unexpected
   function getAllSharedInstanceIds(ev) {     
         var req = new XMLHttpRequest();
         req.open("GET", "getAllSharedInstanceIds", true);

         req.onreadystatechange=function() {
           if (req.readyState==4) {
             if (req.status==200) {
               try {
                 response = JSON.parse(req.responseText);
               }
               catch (e) {
                 GLOBAL.handleUnexpectedResponse('getAllSharedInstanceIds', req.responseText);
                 TEST_ARENA.transitionPageToState('pageLoaded');
                 return; // Don't continue unless it was a json response.
               }
               try {
                 switch(response.event) {
                   case 'success':
                     if (response.data) {
                       var dataList = document.getElementById('shared_bot_id_list');
                       dataList.innerHTML = "";
                       for (var index in response.data) {
                         var option = document.createElement('option');
                         option.value = response.data[index];
                         dataList.appendChild(option);
                       }
                     }
                     else {
                       GLOBAL.handleUnexpectedResponse('getAllSharedInstanceIds', response);
                       TEST_ARENA.transitionPageToState('pageLoaded');
                     }
                     break;
                   default:
                     GLOBAL.handleUnexpectedResponse('getAllSharedInstanceIds', response);
                     TEST_ARENA.transitionPageToState('pageLoaded');
                     break;
                 }
               }
               catch(err) {
                 GLOBAL.handleClientError('sendMove', err);
                 TEST_ARENA.transitionPageToState('pageLoaded');
               }
             } else {
               GLOBAL.handleNonSuccessHttpStatus('sendMove', req.status, req.responseText);
               TEST_ARENA.transitionPageToState('pageLoaded');
             }
           }
         }
         req.send();
       };
   
   //----------------------------------Kill Game------------------------------------
   document.getElementById("killCurrentGame").addEventListener('click', function(ev) {
     var req = new XMLHttpRequest();
     var response = null;

     req.open("GET", "killCurrentGame/?id=" + TEST_ARENA.myId, true);
     req.onreadystatechange=function() {
       if (req.readyState==4) {
         if (req.status==200) {
           try {
             response = JSON.parse(req.responseText);
           }
           catch (e) {
             GLOBAL.handleUnexpectedResponse('killCurrentGame', req.responseText);
             TEST_ARENA.transitionPageToState('pageLoaded');
             return; // Don't continue unless it was a json response.
           }
           try {
             switch(response.event) {
               case 'expiredID':
                 GLOBAL.handleExpiredID();
                 TEST_ARENA.transitionPageToState('pageLoaded');
                 break;
               case 'success':
                 GLOBAL.eventLog.logMessage('status', "The game has been killed, start a new game or upload new bots to continue...");
                 TEST_ARENA.transitionPageToState('uploaded');
                 break;
               default:
                 GLOBAL.handleUnexpectedResponse('killCurrentGame', response);
                 TEST_ARENA.transitionPageToState('pageLoaded');
                 break;
             }
           } 
           catch(err) {
             GLOBAL.handleClientError('killCurrentGame', err);
             TEST_ARENA.transitionPageToState('pageLoaded');
           }
         }
         else {
           GLOBAL.handleNonSuccessHttpStatus('killCurrentGame', req.status, req.responseText);
           TEST_ARENA.transitionPageToState('pageLoaded');
         }
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
     
     req.onreadystatechange=function() {
       if (req.readyState==4) {
         if (req.status==200) {
           try {
             response = JSON.parse(req.responseText);
           }
           catch (e) {
             GLOBAL.handleUnexpectedResponse('sendMove', req.responseText);
             TEST_ARENA.transitionPageToState('pageLoaded');
             return; // Don't continue unless it was a json response.
           }
           try {
             if (response.millisecondsUntilExpiration < 60000 * 5) {
               var date = new Date(response.millisecondsUntilExpiration);
               var str = '';
               str += date.getUTCMinutes() + " minutes, ";
               str += date.getUTCSeconds() + " seconds";
               GLOBAL.messageFlasher.flashMessage('warning', "Your game session will expire in " + str);
             }
             switch(response.event) {
               case 'expiredID':
                 GLOBAL.handleExpiredID();
                 TEST_ARENA.transitionPageToState('pageLoaded');
                 break;
               case 'noStatesRemaining':
                 console.log("Game is no longer running on server and game state queue is empty, stopping the requester");
                 stopGameStateRequester();
                 break;
               case 'success':  // Its valid json
                 if(response.data /*not just gamestates anymore*/) {
                   for ( var index in response.data) {
                     console.log("gameState or humanInputValidation message /n",response.data[index]);
                     TEST_ARENA.gameStateQueue.addNewGameState(response.data[index]);
                   }
                 }
                 else {
                   console.log("Expected gamestates on successful response to getLatestGameStates",
                       "but received this reponse intead: " + response);
                 }
                 break;
               default:
                 GLOBAL.handleUnexpectedResponse('getLatestGameStates', response);
                 TEST_ARENA.transitionPageToState('pageLoaded');
                 break;
             }
           }
           catch(err) {
             GLOBAL.handleClientError('getLatestGameStates', err);
             TEST_ARENA.transitionPageToState('pageLoaded');
           }
         } else {
           GLOBAL.handleNonSuccessHttpStatus('getLatestGameStates', req.status, response);
           TEST_ARENA.transitionPageToState('pageLoaded');
         }
       }
     }
     req.send();
   };
   
   //----------------------------------Helper Stuff------------------------------------     
     TEST_ARENA.coinFlip = function(weight){
       var coin = Math.random();
       if(weight){
           return (coin + weight <= .50);
       }
       else{
           return (coin <= .50);
       }
     }

     
     function setGameControlDiv(startGame_or_killGame_or_hide) {
       if (startGame_or_killGame_or_hide === "startGame") {
         $('#gameControlDiv').show();
         $('#startNewGame').show();
         $('#killCurrentGame').hide();
         $('#humanInput').hide();
         $('#disableAnimations').hide();
         
         $('#upload_and_share_form_container').show();
       }
       else if (startGame_or_killGame_or_hide === "killGame") {
         $('#gameControlDiv').show();
         $('#startNewGame').hide();
         $('#killCurrentGame').show();
         $('#humanInput').hide();
         $('#moveList').html("");
         $('#stdout').html("");
         $('#stderr').html("");
         $('#boardList').html("");
         $('#disableAnimations').hide();
         
         $('#upload_and_share_form_container').hide();
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
         $('#boardList').html("");
         $('#disableAnimations').hide();
         
         $('#upload_and_share_form_container').show();
       }
       else {
         console.log("Invalid Argument to setGameControlDiv");
       }
     }
   
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