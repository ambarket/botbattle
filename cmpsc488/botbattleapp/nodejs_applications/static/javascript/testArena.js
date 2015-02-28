var drawableObject = function(x, y) {
  this.x = x;
  this.y = y;
};
drawableObject
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

var drawableSprite = function(x, y, width, height, imgsrc) {
  drawableObject.call(this, x, y);
  this.width = width;
  this.height = height;
  this.imgsrc = imgsrc;
}

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

var GameBoard = function() {
  // Implements the singleton pattern so animator and drawer share the same GameBoard
  if ( arguments.callee._singletonInstance )
    return arguments.callee._singletonInstance;
  arguments.callee._singletonInstance = this;

  this.drawableObjects = {
    player1 : new drawableObject(50, 50),
    player2 : new drawableObject(150, 50),
    myRectangle: new drawableRectangle(120, 200, 100, 50, 5)
  }

}

function Animator() {
  var self = this;
  var gameStateQueue = [];
  var imRunning = false;
  var gameboard = new GameBoard();
  var drawer = new Drawer();
  var animations = {
    move : function(moveEvent, lastUpdateTime, callback) {
      //console.log(gameboard.drawableObjects[moveEvent.objectName]);
      var drawableObject = gameboard.drawableObjects[moveEvent.objectName];
      
      var time = updateXPositionLinearlyWithTime(drawableObject, moveEvent, lastUpdateTime, 100);
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

  var animateIndividual = function(drawableObject, callback) {
    var startTime = (new Date()).getTime();
    animations[drawableObject.event](drawableObject, startTime, callback);
  }
  
  /**
   * Move the animated object at speed pixels/second from its current position towards
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
      var backwards = moveEvent.endingX - drawableObject.x < 0

      // pixels / second
      var linearSpeedX = (backwards) ? -1 * speed : speed;
      var linearDistEachFrameX = linearSpeedX * timeDiff / 1000;
      drawableObject.x += linearDistEachFrameX;

      if (backwards && drawableObject.x < moveEvent.endingX) {
        drawableObject.x = moveEvent.endingX;
      } else if (!backwards && drawableObject.x > moveEvent.endingX) {
        drawableObject.x = moveEvent.endingX;
      }

      //console.log('moved rectangle', drawableObject.x);

      return time;
    }
}

function Drawer() {
  var self = this;
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext('2d');
  var gameboard = new GameBoard();

  var backgroundImg = new Image();
  backgroundImg.onload = function() {
    self.drawBoard();
  };
  backgroundImg.src = 'static/images/SaveTheIslandBackGround.png';



  this.drawBoard = function() {
    context.drawImage(backgroundImg, 0, 0);

    for (object in gameboard.drawableObjects) {
      gameboard.drawableObjects[object].draw(context);
      //console.log(gameboard.drawableObjects[object].draw);
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

  var animator = new Animator();
  // var runAnimation = {
  //   value: false
  // };

  // add click listener to canvas
  document.getElementById('myCanvas').addEventListener('click', function() {

    var testGameState = {
      animationsList : 
        [ 
         new MoveEvent('myRectangle', 250, 200),
         new MoveEvent('myRectangle', 400, 200),
         new MoveEvent('myRectangle', 250, 200),
         new MoveEvent('myRectangle', 120, 200),
        ]
    }

    animator.addNewGameState(testGameState);
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

    //animator.animateGameState(testGameState, function() {console.log('animation done')});
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

