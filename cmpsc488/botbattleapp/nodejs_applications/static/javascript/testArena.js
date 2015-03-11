(function() {
  window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
  })();

  // maybe turn this into a game loop

  // Simulate the arrival of a new game state by clicking the mouse
  var gameboard = new GameBoard(function(err, gameboard) {
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
                           new MoveEvent('player1', 1, gameboard.drawableObjects['player1'].y), 
        new MoveEvent('player1', 2, gameboard.drawableObjects['player1'].y), 
        new MoveEvent('player1', 3, gameboard.drawableObjects['player1'].y), 
        new MoveEvent('player1', 4, gameboard.drawableObjects['player1'].y), 
        new MoveEvent('player1', 5, gameboard.drawableObjects['player1'].y), 
        new MoveEvent('player1', 6, gameboard.drawableObjects['player1'].y), 
        new MoveEvent('player1', 7, gameboard.drawableObjects['player1'].y), 
        new MoveEvent('player1', 8, gameboard.drawableObjects['player1'].y), 
        new MoveEvent('player1', 9, gameboard.drawableObjects['player1'].y),
        new DefendEvent('player1'), 
            new MoveEvent('player1', 10, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 11, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 12, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 13, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 14, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 15, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 16, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 17, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 18, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 19, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 20, gameboard.drawableObjects['player1'].y),
            new DefendEvent('player1'), 
            new MoveEvent('player1', 21, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 22, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 23, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 24, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 21, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 15, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 7, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 0, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 0, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 0, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', -5, gameboard.drawableObjects['player1'].y),
            new MoveEvent('player1', 0, gameboard.drawableObjects['player1'].y),

            new MoveEvent('player2', 23, gameboard.drawableObjects['player2'].y),
            new MoveEvent('player2', 20, gameboard.drawableObjects['player2'].y),
            new MoveEvent('player2', 8, gameboard.drawableObjects['player2'].y),
            new MoveEvent('player2', 24, gameboard.drawableObjects['player2'].y),
            new MoveEvent('player2', 28, gameboard.drawableObjects['player2'].y),
            new MoveEvent('player2', 24, gameboard.drawableObjects['player2'].y), ]
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

  });



})();

var myId = null;

$(document).ready(function() {
  $('#send_move').click(function(e) {
    // do ajax request
    console.log("sent out move to" + socket.id);
    $('#stdin').text("");
    $('#send_move').hide();
  });
});
