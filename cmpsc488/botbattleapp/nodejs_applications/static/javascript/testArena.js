//Wrap everything in a function, so local variables dont become globals
(function() {
  var id = "defaultIdValue";
  console.log("InitialId: ", id);

  function leave() {
    return "Leaving the page will stop your program from running!";
  }

  // TODO: guess this doesn't work sometimes
  // https://xhr.spec.whatwg.org/
  var unloadHandler = function() {
    $.ajax({
      async : false,
      data : {
        id : id
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

  var resetValueAttrributeById = function(id) {
    document.getElementById(id).value = "";
  }

  $('#player1_bot_upload').click(function() {
    document.getElementById("status").innerHTML = "";
  });

  $('#player2_bot_upload').click(function() {
    document.getElementById("status").innerHTML = "";
  });

  // Listen for radio checks
  $('#human').click(function() {
    $('#uploadBotButton').val("Upload Bot");
    $('#player2FileChoose').hide();
    $('#humanInput').show();
    $('#playGameDiv').hide();
    resetValueAttrributeById('player2_bot_upload');
    resetValueAttrributeById('player1_bot_upload');
    document.getElementById("status").innerHTML = "";
    document.getElementById("player2_bot_upload").required = false;
  });

  $('#bot').click(function() {
    $('#uploadBotButton').val("Upload Bots");
    $('#player2FileChoose').show();
    $('#humanInput').hide();
    $('#playGameDiv').hide();
    resetValueAttrributeById('player2_bot_upload');
    resetValueAttrributeById('player1_bot_upload');
    document.getElementById("status").innerHTML = "";
    document.getElementById("player2_bot_upload").required = true;
  });

  //TODO:  add a box and button to send text for echo test
  document.getElementById("echo_send_move").addEventListener('click', function(ev) {
    var req = new XMLHttpRequest();
    req.open("GET", "echoTest/?id=" + id + "&echo_stdin=" + document.getElementById("echo_stdin").value, true);
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

  document.getElementById("playGame").addEventListener('click', function(ev) {
    var req = new XMLHttpRequest();
    var output = document.getElementById("playGameStatus");
    req.open("GET", "startGame/?id=" + id, true);
    req.onload = function(event) {
      if (req.status == 200) {
        var response = JSON.parse(req.responseText);
        console.log("Good status " + JSON.stringify(response));
        if (response.status) {
          output.innerHTML = response.status;
        } else {
          output.innerHTML = "Valid response but no status to display";
        }
        startGameStateListener();
      } else {
        console.log("Bad status " + JSON.stringify(response));
        if (response.error) {
          output.innerHTML = response.error;
        } else {
          output.innerHTML = "Error " + req.status + " occured";
        }
      }
    }
    req.send();
    ev.preventDefault();
  }, false);
  
  var gameStateListener = null;
  function startGameStateListener() {
    gameStateListener = setInterval(requestLatestGameStates, 200);
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
    req.open("GET", "getLatestGameStates/?id=" + id, true);
    req.onload = function(event) {
      if (req.status == 200) {
        response = JSON.parse(req.responseText);
        console.log(response);
        for ( var turnIndex in response) {
          TEST_ARENA.gameStateQueue.addNewGameState(response[turnIndex]);
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
  
  var uploadBotsform = document.forms.namedItem("uploadBotForm");
  uploadBotsform.addEventListener('submit', function(ev) {
    var output = document.getElementById("status");
    var data = new FormData(document.forms.namedItem("uploadBotForm"));
    var req = new XMLHttpRequest();
    req.open("POST", "processBotUploads/?oldId=" + id, true);
    req.onload = function(event) {
      if (req.status == 200) {
        response = JSON.parse(req.responseText);
        console.log("Good status " + JSON.stringify(response));
        if (response.error) {
          output.innerHTML = response.error;
          $('#playGameDiv').hide();
        } else {
          output.innerHTML = response.status;
          $('#playGameDiv').show();
          id = response.id;
        }
        // then should stay disabled until game is over or change to restart game button
      } else {
        output.innerHTML = "Error " + req.status + " occurred uploading your file.<br \/>";
        console.log("Bad status " + JSON.stringify(response));
        if (response.error) {
          output.innerHTML = response.error;
        }
        //disable play game button
      }
      // enable upload button in each case
    };
    req.send(data);
    ev.preventDefault();
  }, false);

  window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
  })();

  // TODO: Maybe extend this into a button that when clicked would reset the entire canvas
  //    and all object back to default so another game could be played
  /*(*/function resetTestArena() {
    TEST_ARENA.canvas = document.getElementById("GameCanvas");
    TEST_ARENA.prevCanvas = TEST_ARENA.canvas;
    TEST_ARENA.context = TEST_ARENA.canvas.getContext('2d');
    TEST_ARENA.resetGameStateQueue();
    registerClickListeners();

    GAME.resetGameboard(function(err) {

      TEST_ARENA.resizeCanvas();

      window.onresize = function() {
        TEST_ARENA.resizeCanvas();
      }

      function draw() {
        GAME.drawer.drawBoard();
        requestAnimFrame(draw);
      }
      ;

      draw();

    })
  }//)();

  function registerClickListeners() {

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

          sendMoveOverAjax(event);
        }
      });
    })();

    function sendMoveOverAjax(ev) {
      console.log("here");
      document.getElementById("send_move").disabled = true;
      var req = new XMLHttpRequest();
      req.open("POST", "testArenaUpdate", true);
      try {
        req.send(TEST_ARENA.myId); // my.Id is not used.
        //TODO I think onReadyStateChange may allow us to detect if the request failed to post,
        //  need to do something about this because otherwise button just remains disabled.
        // Test by shutting down server then clicking it.
        req.onload = function(event) {
          if (req.status === 200) {
            TEST_ARENA.helpers.appendDivToHtmlElementById('send_move_message', "GameState received");
            console.log(req.responseText);

            // Parse into JSON
            var response = JSON.parse(req.responseText);
            // Just use each turn object as a gamestate.
            // Each gamestate must have an animatableEvents array, gameData object, and debugData object
            for ( var turnIndex in response) {
              TEST_ARENA.gameStateQueue.addNewGameState(response[turnIndex]);
            }
          } else {
            TEST_ARENA.helpers.appendDivToHtmlElementById('send_move_message', "Failed to get GameState");
          }
          document.getElementById("send_move").disabled = false;
        };
      } catch (err) {
        TEST_ARENA.helpers.appendDivToHtmlElementById('send_move_message', err.message);
        document.getElementById("send_move").disabled = false;
      }

      ev.preventDefault();
    }

    document.getElementById("send_move").addEventListener('click', sendMoveOverAjax, false);
  }
})();
