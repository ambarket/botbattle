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
           new MoveEvent('player1', 1, gameboard.drawableObjects['player1'].y), // this y should be removed, but changes fly and limits other options
           new MoveEvent('player1', 2, gameboard.drawableObjects['player1'].y), // we need to decide how to handle this... the original idea was to 
           new MoveEvent('player1', 3, gameboard.drawableObjects['player1'].y), // have [player, event, curr. pos., next pos.]
           new MoveEvent('player1', 4, gameboard.drawableObjects['player1'].y), // need to write a parser that handles input on the server side to 
           new MoveEvent('player1', 5, gameboard.drawableObjects['player1'].y), // convert the input into something like this on the side
           new MoveEvent('player1', 6, gameboard.drawableObjects['player1'].y), // this is all overridable from the client though...
           new MoveEvent('player1', 7, gameboard.drawableObjects['player1'].y), // human input will be sent to server, verified by game, sent back as move to client
           new MoveEvent('player1', 8, gameboard.drawableObjects['player1'].y), // should minify all of this when we are done too
           new MoveEvent('player1', 9, 365),
           new MoveEvent('player1', 10, 365),
           new MoveEvent('player1', 11, 365),
           new MoveEvent('player1', 12, 365),
           new MoveEvent('player1', 13, 365),
           new MoveEvent('player1', 14, 365),
           new MoveEvent('player1', 15, 365),
           new MoveEvent('player1', 16, 365),
           new MoveEvent('player1', 17, 365),
           new MoveEvent('player1', 18, 365),
           new MoveEvent('player1', 19, 365),
           new MoveEvent('player1', 20, 365),
           new MoveEvent('player1', 21, 365),
           new MoveEvent('player1', 22, 365),
           new MoveEvent('player1', 23, 365),
           new MoveEvent('player1', 24, 365),
           new MoveEvent('player1', 21, 365),
           new MoveEvent('player1', 15, 365),
           new MoveEvent('player1', 7, 365),
           new MoveEvent('player1', 0, 365),
           
           new MoveEvent('player2', 23, 365),
           new MoveEvent('player2', 20, 365),
           new MoveEvent('player2', 8, 365),
           new MoveEvent('player2', 24, 365),
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