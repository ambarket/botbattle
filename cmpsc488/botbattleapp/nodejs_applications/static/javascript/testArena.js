function Animator() {
	var self = this;
	var gameboard = new GameBoard();
	
	this.animateGameState = function(gamestate, callback) {
		async.eachSeries(gamestate.animationsList, self.animateIndividual, callback);
	}

	this.animateIndividual = function(animation, callback) {
		gameboard.animations[animation.event](animation, callback);
	}
	
	
}



var GameBoard = function() {
	self = this;
	
    this.canvas = document.getElementById('myCanvas');
    this.context = self.canvas.getContext('2d');
    this.drawer = new Drawer(self.canvas, self.context);
    
    var backgroundImg = new Image();

    backgroundImg.onload = function() {
	  	self.context.drawImage(backgroundImg, 0, 0);
	  	self.drawer.drawRect();
    };
    
    backgroundImg.src = 'static/images/SaveTheIslandBackGround.png';
    
    this.sprites  = {
		player1: {
			currentX: 0
		},
		player2: {
			currentX: 0
		}
	}
    
    this.animations = {
		move: function(animation, callback) {
			var done = false;
			
			  self.drawer.updateRectPosition(1);
			
			  var done = self.drawer.isAtEnd();
	          // clear
	          self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);

	          // draw
	          self.context.drawImage(backgroundImg, 0, 0);
	          self.drawer.drawRect();
	          
	          if (!done) {
		          requestAnimFrame(function() {
		              self.animations.move(animation, callback);
		            });
		          }
	          else {
	        	  callback();
	          }
	          
	          
			// Change robotSprite.x 
			//var player = sprites[animation.player];
			//player.currentX = animation.nextPos;
		},
		attack: function(animation, callback) {
			
			
		},
		wasAttacked: function(animation, callback) {
			
			
		},
		defend: function(animation, callback) {
			
			
		},
		wasDefended: function(animation, callback) {
			
			
		},
		died: function(animation, callback) {
			
		
		}
    }
}

function Drawer(canvas, context) {
	
    var myRectangle = {
            x: 120,
            y: 200,
            width: 100,
            height: 50,
            borderWidth: 5
          };
    
    this.drawRect = function() {
        context.beginPath();
        context.rect(myRectangle.x, myRectangle.y, myRectangle.width, myRectangle.height);
        context.fillStyle = '#8ED6FF';
        context.fill();
        context.lineWidth = myRectangle.borderWidth;
        context.strokeStyle = 'black';
        context.stroke();
      }
    
    this.updateRectPosition = function(timeDiff) {
        // pixels / second
        var linearSpeedX = 100;
        var linearSpeedY = 0;
        var linearDistEachFrameX = linearSpeedX * timeDiff / 1000;
        var linearDistEachFrameY = linearSpeedY * timeDiff / 1000;
        var currentX = myRectangle.x;
        var currentY = myRectangle.y;
        if(currentX < canvas.width - myRectangle.width - myRectangle.borderWidth / 2) {
          var newX = currentX + linearDistEachFrameX;
          myRectangle.x = newX;
          
          var newY = currentY + linearDistEachFrameY;
          myRectangle.y = newY;
        }
        console.log('running');
    }
    
    this.isAtEnd = function() {
    	return myRectangle.x > 300;
    }
}
		
(function() {
    window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
      })();
     
     var animator = new Animator();
     // var runAnimation = {
     //   value: false
     // };

      // add click listener to canvas
     document.getElementById('myCanvas').addEventListener('click', function() {
    	 
    	 var testGameState = {
    			 animationsList: [
	    			        		  {
	    			        			  player:'player1',
	    			        			  event:'move',
	    			        			  currpos:5,
	    			        			  nextpos:10
	    			        		  },
	    			        		  {
	    			        			  player:'player1',
	    			        			  event:'move',
	    			        			  currpos:5,
	    			        			  nextpos:10
	    			        		  }
    			                  ]
    	 }
    	 /*
    	 animator.animateIndividual(
        		  {
        			  player:'player1',
        			  event:'move',
        			  currpos:5,
        			  nextpos:10
        		  }
        	  , function() {console.log('animation done')}
        	);
        */
    	 
    	animator.animateGameState(testGameState, function() {console.log('animation done')});
      });
})();

      //function animateBotMove()
      // p1 attack 5 2 - using a 4 if he's at 1
      // p1 move 5 1 - using a 4
      /*
      function animate(lastTime, drawer, runAnimation, canvas, context, backgroundImg) {
    	
        if(runAnimation.value) {
          // update
          var time = (new Date()).getTime();
          var timeDiff = time - lastTime;


          drawer.updateRectPosition(timeDiff);
          // clear
          context.clearRect(0, 0, canvas.width, canvas.height);

          // draw
          context.drawImage(backgroundImg, 0, 0);
          drawer.drawRect();
          
          // request new frame
          requestAnimFrame(function() {
            animate(time, drawer, runAnimation, canvas, context, backgroundImg);
          });
        }
      }
      */
      
      /*
      var canvas = document.getElementById('myCanvas');
      var context = canvas.getContext('2d');

      var backgroundImg = new Image();

      backgroundImg.onload = function() {
    	
    	context.drawImage(backgroundImg, 0, 0);
    	drawer.drawRect();
      };
      backgroundImg.src = 'static/images/SaveTheIslandBackGround.png';
     
      var drawer = new Drawer(canvas, context);

      drawer.drawRect();
      context.drawImage(backgroundImg, 0, 0);
      */
      
      /*
       * define the runAnimation boolean as an obect
       * so that it can be modified by reference
       */


//function 


