//--------------------------Drawable Objects------------------------------------
var drawableObject = function(x, y) {
  this.x = x;
  this.y = y;
};

drawableObject.prototype.draw = function(context) {
  context.fillRect(this.x,this.y,1,1);
};

var drawableRectangle = function(x, y, width, height, borderWidth) {
  drawableObject.call(this, x, y);
  this.width = width;
  this.height = height;
  this.borderWidth = borderWidth;

};

drawableRectangle.prototype = Object.create(drawableObject.prototype);
drawableRectangle.prototype.constructor = drawableRectangle;
drawableRectangle.prototype.draw = function(context) {
  context.beginPath();
  context.rect(this.x, this.y, this.width, this.height);
  context.fillStyle = '#8ED6FF';
  context.fill();
  context.lineWidth = this.borderWidth;
  context.strokeStyle = 'black';
  context.stroke();
};

var drawableImage = function(imgsrc, x, y, width, height, loadedCallback) {
  drawableObject.call(this, x, y);
  this.width = width;
  this.height = height;
  this.imgsrc = imgsrc;
  this.img = new Image();
  this.img.onload = loadedCallback;
  this.img.src = imgsrc;
}

drawableImage.prototype = Object.create(drawableObject.prototype);
drawableImage.prototype.constructor = drawableRectangle;
drawableImage.prototype.draw = function(context) {
  context.drawImage(this.img, this.x, this.y, this.height, this.width);
};

//--------------------------Animatable Events------------------------------------
var AnimatableEvent = function(event, objectName) {
  this.objectName = objectName;
  this.event = event;
}
AnimatableEvent.prototype.animationComplete = function() {
  return true;
}

var MoveEvent = function(objectName, endingX, endingY) {
  AnimatableEvent.call(this, 'move', objectName);
  this.endingX = endingX;
  this.endingY = endingY;
}
MoveEvent.prototype = Object.create(AnimatableEvent.prototype);
MoveEvent.prototype.animationComplete = function(drawableObject) {
  return drawableObject.x == this.endingX && drawableObject.y == this.endingY;
}

//--------------------------The GameBoard (Model)------------------------------------
var GameBoard = function(readyCallback) {
  // Implements the singleton pattern so animator and drawer share the same GameBoard
  if ( arguments.callee._singletonInstance )
    readyCallback(null, arguments.callee._singletonInstance);
  arguments.callee._singletonInstance = this;

  var self = this;
  this.drawableObjects = {
    backgroundImg : new drawableImage('static/images/SaveTheIslandBackGround.png', 0,0,400,640, imageLoadedCallback),
    player1 : new drawableImage('static/images/botImageRight.png', 120,220,50,50, imageLoadedCallback),
    player2 : new drawableImage('static/images/botImageLeft.png', 400,220,50,50, imageLoadedCallback),
    /*myRectangle: new drawableRectangle(120, 200, 100, 50, 5)*/
  }
  this.backgroundElements = {
      trees : {
        tree1 : new drawableImage('static/images/tree.png', 10,110,20,20, imageLoadedCallback),
        tree2 : new drawableImage('static/images/tree.png', 75,100,20,20, imageLoadedCallback),
        tree3 : new drawableImage('static/images/tree.png', 150,114,20,20, imageLoadedCallback),
        tree4 : new drawableImage('static/images/tree.png', 250,120,20,20, imageLoadedCallback),
        tree5 : new drawableImage('static/images/tree.png', 350,125,20,20, imageLoadedCallback),
      }
  }
  
  var imagesLoaded= 0, expectedImagesLoaded=8;
  function imageLoadedCallback() {
    imagesLoaded++;
    if (imagesLoaded == expectedImagesLoaded) {
      readyCallback(null, self);
    }
  }
}

//--------------------------The Animator (Controller)------------------------------------
function Animator(gameboard) {
  if ( arguments.callee._singletonInstance )
    return arguments.callee._singletonInstance;
  arguments.callee._singletonInstance = this;
  
  var self = this;
  var gameStateQueue = [];
  var imRunning = false;
  var drawer = new Drawer(gameboard);
  var animations = {
    move : function(moveEvent, lastUpdateTime, callback) {
      backgroundAnimations();
      //console.log(gameboard.drawableObjects[moveEvent.objectName]);
      var drawableObject = gameboard.drawableObjects[moveEvent.objectName];
      
      
      var time = updateXPositionLinearlyWithTime(drawableObject, moveEvent, lastUpdateTime, 100);
      time = updateYPositionLinearlyWithTime(drawableObject, moveEvent, lastUpdateTime, 100);
      
      var done = moveEvent.animationComplete(drawableObject);
      
      drawer.drawBoard();

      if (!done) {
        requestAnimFrame(function() {
          animations.move(moveEvent, time, callback);
        });
      } else {
        console.log('animation of', moveEvent, 'complete!')
        callback();
      }
    },
    attack : function(animation, callback) {

    },
    wasAttacked : function(animation, callback) {

    },
    defend : function(animation, callback) {

    },
    wasDefended : function(animation, callback) {

    },
    died : function(animation, callback) {

    }
  }

  this.addNewGameState = function(gamestate) {
    gameStateQueue.push(gamestate);

    if (!imRunning) {
      start();
    }
  }

  var start = function() {
    imRunning = true;
    processNextGameState();
  }

  var processNextGameState = function() {
    var nextGameState = gameStateQueue.splice(0, 1)[0];

    if (!nextGameState) {
      imRunning = false;
    } else {
      animateGameState(nextGameState, function() {
        processNextGameState()
      })
    }
  }

  var animateGameState = function(gamestate, callback) {
    async.eachSeries(gamestate.animationsList, animateIndividual, callback);
  };

  var animateIndividual = function(animatableEvent, callback) {
    var startTime = (new Date()).getTime();
    animations[animatableEvent.event](animatableEvent, startTime, callback);
  }
  
  // Stupid but shows we can add logic to update other elements every frame pretty easily here
  var backgroundAnimations = function(startTime) {
	var coin
    // Move the trees around
    for (treeIndex in gameboard.backgroundElements.trees){      
      coin = Math.random();
      if (coin <= .50) {
    	  gameboard.backgroundElements.trees[treeIndex].x+=1;
      }
      else {
    	  gameboard.backgroundElements.trees[treeIndex].x-=1;
      }
    }
   
  }
  
  /**
   * Move the animated object along x at speed pixels/second from its current position towards
   * drawableObject.endpos
   * 
   * @param {Object} drawableObject Must extend drawableObject class 
   * @param {Number} lastUpdateTime The time of the last frame update of this object
   * @param {Number} speed The speed in pixels/second to move the object
   */
  //TODO Create drawableObject class
  var updateXPositionLinearlyWithTime = function(drawableObject, moveEvent, lastUpdateTime, speed) {
      var time = (new Date()).getTime();
      var timeDiff = time - lastUpdateTime;
      //console.log('inUpdateXPosition', drawableObject, moveEvent);
      var backwards = moveEvent.endingX - drawableObject.x < 0;
      
      // pixels / second
      var linearSpeedX = (backwards) ? -1 * speed : speed;
      var linearDistEachFrameX = linearSpeedX * timeDiff / 1000;
      drawableObject.x += linearDistEachFrameX;

      if (backwards && drawableObject.x < moveEvent.endingX) {
        drawableObject.x = moveEvent.endingX;
      } else if (!backwards && drawableObject.x > moveEvent.endingX) {
        drawableObject.x = moveEvent.endingX;
      }

      console.log('moved rectangle', drawableObject.x);

      return time;
    }
  
  /**
   * Move the animated object along y at speed pixels/second from its current position towards
   * drawableObject.endpos
   * 
   * @param {Object} drawableObject Must extend drawableObject class 
   * @param {Number} lastUpdateTime The time of the last frame update of this object
   * @param {Number} speed The speed in pixels/second to move the object
   */
  //TODO Create drawableObject class
  var updateYPositionLinearlyWithTime = function(drawableObject, moveEvent, lastUpdateTime, speed) {
      var time = (new Date()).getTime();
      var timeDiff = time - lastUpdateTime;
      //console.log('inUpdateXPosition', drawableObject, moveEvent);
      var up = moveEvent.endingY - drawableObject.y < 0;
      
      // pixels / second
      var linearSpeedY = (up) ? -1 * speed : speed;
      var linearDistEachFrameY = linearSpeedY * timeDiff / 1000;
      drawableObject.y += linearDistEachFrameY;

      if (up && drawableObject.y < moveEvent.endingY) {
        drawableObject.Y = moveEvent.endingY;
      } else if (!up && drawableObject.y > moveEvent.endingY) {
        drawableObject.y = moveEvent.endingY;
      }

      console.log('moved rectangle', drawableObject.y);

      return time;
    }
}

//--------------------------The Drawer (View)------------------------------------
function Drawer(gameboard) {
  if ( arguments.callee._singletonInstance )
    return arguments.callee._singletonInstance;
  arguments.callee._singletonInstance = this;
  
  var self = this;
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext('2d');

  this.drawBoard = function() {

    for (object in gameboard.drawableObjects) {
      gameboard.drawableObjects[object].draw(context);
    }
    
    for (object in gameboard.backgroundElements.trees){
      gameboard.backgroundElements.trees[object].draw(context);
    }
  }
  
  var clearCanvas = function() {
    context.clearRect(0, 0, self.canvas.width, self.canvas.height);
  }
}

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
    // add click listener to canvas
    document.getElementById('myCanvas').addEventListener('click', function() {

      var testGameState = {
        animationsList : 
          [ 
           new MoveEvent('player1', 250, 220),
           new MoveEvent('player1', 400, 220),
           new MoveEvent('player1', 250, 220),
           new MoveEvent('player1', 120, 220),
           new MoveEvent('player2', 250, 220),
           new MoveEvent('player2', 400, 220),
           new MoveEvent('player2', 250, 220),
           new MoveEvent('player2', 400, 220),
          ]
      }
      
      animator.addNewGameState(testGameState);
      
    });
    
  });


})();