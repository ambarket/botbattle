(function() {
  window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
  })();
  
  // add click listener to canvas to get distances between two clicked points
  (function() {
    var x1, x2, y1, y2;
    var clickCount = 0;
    var rect;
    canvas.addEventListener('click', function(event) {
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
      } 
    });
  });

  
  // Define global TEST_ARENA namespace to be shared throughout client side code
  var canvas = 
  TEST_ARENA = {
      'canvas' : document.getElementById("GameCanvas"),
      'context' : document.getElementById("GameCanvas").getContext('2d'),
      'scale' : 1, // set by resizeCanvas
      'resizeCanvas' : function(){
        this.canvas.width = Math.min(this.canvas.parentNode.getBoundingClientRect().width, 1050);
        this.canvas.height = this.canvas.width * 0.619047619;  // 650/1050 = 0.619047619
        this.scale = document.getElementById("GameCanvas").width / 1050;
      },
 
  }
  
  GAME.resetGameboard(function(err) {
    var drawer = new Drawer();

    TEST_ARENA.resizeCanvas();
    //resize();
    
    window.onresize = function() {
      console.log("resize");
      console.log(TEST_ARENA);
      TEST_ARENA.resizeCanvas();
      //resize();
      drawer.drawBoard();
    }
    
    var time;
    //var drawer = new Drawer(gameboard);

    (function draw() {
      requestAnimFrame(draw);
      var now = new Date().getTime(), dt = now - (time || now);

      time = now;
      //console.log("drawing");
      drawer.drawBoard();
    })();
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
      // Just use each turn object as a gamestate.
      // Each gamestate must have an animatableEvents array, gameData object, and debugData object
      for (var turnIndex in response){
        animator.addNewGameState(response[turnIndex]);
      }
      
      document.getElementById("send_move").disabled = false;
    } 
    else {
      console.log("error onload");
    }
  };
  ev.preventDefault();
}, false);