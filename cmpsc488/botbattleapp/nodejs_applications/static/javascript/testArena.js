(function() {
  window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame || function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
  })();


  // Simulate the arrival of a new game state by clicking the mouse
  var gameboard = new GameBoard(function(err, gameboard) {
    var animator = new Animator(gameboard);
    var drawer = new Drawer(gameboard);
    drawer.drawBoard();
    var x1,x2,y1,y2;
    var clickCount = 0;
    var rect;
    // add click listener to canvas
    var canvas = document.getElementById('myCanvas');
    canvas.addEventListener('click', function(event) {

      var testGameState = {
        animationsList : 
          [ 
           new MoveEvent('player1', 250, 365),
           new MoveEvent('player1', 400, 365),
           new MoveEvent('player1', 250, 365),
           new MoveEvent('player1', 85, 365),
           new MoveEvent('player2', 250, 365),
           new MoveEvent('player2', 400, 365),
           new MoveEvent('player2', 250, 365),
           new MoveEvent('player2', 885, 365),
          ]
      }
      console.log("Someone Clicked");
      if (event.ctrlKey) {
    	  rect = canvas.getBoundingClientRect();
		  clickCount++;
		  if(clickCount % 2 === 1){
			  x1 = event.clientX - rect.left;
			  y1 = event.clientY - rect.top;
		  }
		  else{
			  x2 = event.clientX - rect.left;
			  y2 = event.clientY - rect.top;
		  }
		  if(x1 && x2){
			  document.getElementById("distance").innerHTML = "X dist = " + Math.abs(x1-x2) + "  Y dist = " + Math.abs(y1-y2) + "<hr> point1 = X: " + x1 + " Y: " + y1 + "<hr> point2 = X: " + x2 + " Y: " + y2;
			  x1 = x2 = y1 = y2 = null;
		  }
      }
      else{
    	  animator.addNewGameState(testGameState);
      }
      
    });
    
  });


})();