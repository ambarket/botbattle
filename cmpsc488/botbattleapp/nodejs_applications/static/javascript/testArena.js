(function() {
  window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
  })();

  // maybe turn this into a game loop

  // Simulate the arrival of a new game state by clicking the mouse
  var gameboard = new GameBoard();
  gameboard.loadImages(function(err) {
    var animator = new Animator(gameboard);
    var drawer = new Drawer(gameboard);

    var x1, x2, y1, y2;
    var clickCount = 0;
    var rect;

    var canvas = document.getElementById('GameCanvas');

    gameboard.resize();
    
    window.onresize = function() {
      gameboard.resize();
      //drawer.drawBoard();
    }
    
    var time;
    //var drawer = new Drawer(gameboard);

    (function draw() {
      requestAnimFrame(draw);
      var now = new Date().getTime(), dt = now - (time || now);

      time = now;

      drawer.drawBoard();
    })();

    // add click listener to canvas
    canvas.addEventListener('click', function(event) {

      var testGameState = {
        animationsList : [ 
                          //new DefendEvent('player1'), 
            new MoveEvent('player1', 10, gameboard.drawableObjects['player1'].y), 
            new MoveEvent('player2', 11, gameboard.drawableObjects['player2'].y),
            new DefendEvent('player1'), 
            new DefendEvent('player2'), 
            new MoveEvent('player1', 0, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player2', 24, gameboard.drawableObjects['player2'].y),
            new DefendEvent('player1'), 
            new DefendEvent('player2')
       ]
            
      }
      console.log("Someone Clicked");
      if (event.ctrlKey) {
        rect = canvas.getBoundingClientRect();
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
        animator.addNewGameState(testGameState);
      }

    });
  })
})();

var myId = null;


document.getElementById("send_move").addEventListener('click', function(ev) {
  document.getElementById("send_move").disabled = true;
  var req = new XMLHttpRequest();
  req.open("POST", "testArenaUpdate", true);
  req.send(myId);
  //console.log("onload");
  var gameState = {
      animationsList : []
  }
  req.onload = function(event) {
    if (req.status === 200) {
      console.log("onload");
      console.log(req.responseText);
      var gameboard = new GameBoard();
      var animator = new Animator();
      // Parse into JSON
      var response = JSON.parse(req.responseText);
      // Parse into GameState Object
      for (var turnIndex in response){
          for (var animationObjectIndex in response[turnIndex]['animations']){
            var animationObject = response[turnIndex]['animations'][animationObjectIndex];
            switch(animationObject.event) {
              case 'move': 
                gameState.animationsList.push(new MoveEvent(animationObject.player, animationObject.data, 
                    gameboard.drawableObjects[animationObject.player].y));
                break;
              case 'defend':
                gameState.animationsList.push(new DefendEvent(animationObject.player));
                break;
            }
          }
          var player1Tiles = response[turnIndex]['player1Tiles'];
          var player2Tiles = response[turnIndex]['player2Tiles'];
          var move = response[turnIndex]['move'];
          var debug = response[turnIndex]['debug'];
      }
      animator.addNewGameState(gameState);
      document.getElementById("send_move").disabled = false;
    } 
    else {
      console.log("error onload");
    }
  };
  ev.preventDefault();
}, false);