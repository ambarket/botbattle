
//Wrap everything in a function, so local variables dont become globals
(function() {


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
      };
      
      draw();
      
    })
  })();
  
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
        }
        else {
          
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
        req.send(TEST_ARENA.myId);
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
            for (var turnIndex in response){
              TEST_ARENA.gameStateQueue.addNewGameState(response[turnIndex]);
            }
          } 
          else {
            TEST_ARENA.helpers.appendDivToHtmlElementById('send_move_message', "Failed to get GameState");
          }
          document.getElementById("send_move").disabled = false;
        };
      }
      catch(err) {
        TEST_ARENA.helpers.appendDivToHtmlElementById('send_move_message', err.message);
        document.getElementById("send_move").disabled = false;
      }


      ev.preventDefault();
    }
    
    document.getElementById("send_move").addEventListener('click', sendMoveOverAjax, false);
  }
})();
