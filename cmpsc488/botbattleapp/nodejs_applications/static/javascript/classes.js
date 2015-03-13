// Define global TEST_ARENA namespace to be shared throughout client side code
TEST_ARENA = {
    'myId' : null, // will probably be used
    'canvas' : null, // Set in testArena.js after page has loaded
    'context' : null, // Set in testArena.js after page is loaded
    'scale' : 1, // set by resizeCanvas
    'resizeCanvas' : function(){
      this.canvas.width = Math.min(this.canvas.parentNode.getBoundingClientRect().width, 1050);
      this.canvas.height = this.canvas.width * 0.619047619;  // 650/1050 = 0.619047619
      this.scale = document.getElementById("GameCanvas").width / 1050;
    },
    'gameStateQueue' : null //Set by resetGameStateQueue
}

TEST_ARENA.resetGameStateQueue = function() {
  // Stop it if its running since were about to lose reference to it.
  if (TEST_ARENA.gameStateQueue) {TEST_ARENA.gameStateQueue.stop()}
  TEST_ARENA.gameStateQueue = new (function(){
    var self = this;
    var gameStateQueue = [];
    var imRunning = false;
    
    this.addNewGameState = function(gamestate) {
      gameStateQueue.push(gamestate);
  
      if (!imRunning) {
        imRunning = true;
        processNextGameState();
      }
    }
    
    this.stop = function() {
      imRunning = false;
    }
  
    var processNextGameState = function() {
      var nextGameState = gameStateQueue.splice(0, 1)[0];
  
      if (!nextGameState) {
        imRunning = false;
      } else {
        // TODO: Handle errors, also not sure if its better to output gameData and debugging before or after the animations
        async.eachSeries(nextGameState.animatableEvents, GAME.processAnimatableEvent, function(err) {
          GAME.processGameData(nextGameState.gameData, function(err) {
            GAME.processDebugData(nextGameState.debugData, function(err) {
              processNextGameState();
            });        
          });
        });
      }
    }
  })();
}

//--------------------------Drawable Objects------------------------------------
var drawableObject = function(x, y, width, height) {
	this.x = x || 0;
	this.y = y || 0;
	this.width = width || 0;
	this.height = height || 0;
};

drawableObject.prototype.draw = function(context) {
  context.fillRect(this.x,this.y,1,1);
};

/*
var drawableRectangle = function(x, y, width, height, borderWidth) {
  drawableObject.call(this, x, y);
  this.sourceWidth = width;
  this.sourceHeight = height;
  this.borderWidth = borderWidth;
};

drawableRectangle.prototype = Object.create(drawableObject.prototype);
drawableRectangle.prototype.constructor = drawableRectangle;
drawableRectangle.prototype.draw = function(context) {
  context.beginPath();
  context.rect(this.x, this.y, this.destWidth, this.destHeight);
  context.fillStyle = '#8ED6FF';
  context.fill();
  context.lineWidth = this.borderWidth;
  context.strokeStyle = 'black';
  context.stroke();
};
*/
/**
 * options : {
 *  imageSrc,   //required
 *  sourceX, 
 *  sourceY, 
 *  sourceWidth, 
 *  sourceHeight, 
 *  x,          //required
 *  y,           //required
 *  width,      //required
 *  height,         //required
 *  loadedCallback
 * }
 */
var drawableImage = function(options) {
  if (!options.imageSrc || 
      !options.x && !(options.x === 0) ||
      !options.y && !(options.y === 0) ||
      !options.width && !(options.width === 0) ||
      !options.height && !(options.height === 0)) {
    console.log("Error in drawableImage constructor, missing required arguments, returning null now");
    return null;
  }
  
  drawableObject.call(this, options.x, options.y, options.width, options.height);

  this.sourceX = options.sourceX || options.x;
  if (options.sourceX === 0) {this.sourceX = 0}
  this.sourceY = options.sourceY || options.y;
  if (options.sourceY === 0) {this.sourceY = 0}
  this.sourceWidth = options.sourceWidth || options.width;
  if (options.sourceWidth === 0) {this.sourceWidth = 0}
  this.sourceHeight = options.sourceHeight || options.height;
  if (options.sourceHeight === 0) {this.sourceWidth = 0}
  
  // Note image starts loading as soon as the src attribute is set
  this.img = new Image();
  this.img.onload = options.loadedCallback;
  this.img.src = options.imageSrc;
};

drawableImage.prototype = Object.create(drawableObject.prototype);
drawableImage.prototype.constructor = drawableImage;
drawableImage.prototype.draw = function(context) {
	if(this.visible){		  
	  this.update();
	  context.drawImage(this.img, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, 
	      this.x * TEST_ARENA.scale, this.y * TEST_ARENA.scale, this.width * TEST_ARENA.scale,  this.height * TEST_ARENA.scale); 
	}
};

/**
 * options : {
 *  imageSrc,   //required
 *  sourceX, 
 *  sourceY, 
 *  sourceWidth, 
 *  sourceHeight, 
 *  x,          //required
 *  y,           //required
 *  width,      //required
 *  height,         //required
 *  indexStart, 
 *  ticksPerFrame, 
 *  numberOfFrames,
 *  loop, 
 *  visible, 
 *  loadedCallback
 * }
 */
var drawableSprite = function(options) {
  var self = this;
  if (!options.imageSrc || 
      !options.x && !(options.x === 0) ||
      !options.y && !(options.y === 0) ||
      !options.width && !(options.width === 0) ||
      !options.height && !(options.height === 0)) {
    console.log("Error in drawableSprite constructor, missing required arguments, returning null now");
    return null;
  }
  
  drawableImage.call(this, options);

  this.frameIndex = options.indexStart || 0;
  this.ticksPerFrame = options.ticksPerFrame || 1;
  this.numberOfFrames = options.numberOfFrames || 1;
  this.loop = options.loop || false;
  if (options.visible !== false) {options.visible = true} // enforce default of true this way
  this.visible = options.visible;

  this.done = false;
  this.tickCount = 0;
  this.update = function () {
        if(!self.done){
          self.tickCount += 1;  
          if (self.tickCount > self.ticksPerFrame) {
            self.tickCount = 0;
            if(self.frameIndex < self.numberOfFrames - 1){
              self.frameIndex += 1; 
            }
            else{
              if (!self.loop) {
                self.done = true;
              }
              self.frameIndex = 0;
            }
          }
        }
  }; 
}
drawableSprite.prototype = Object.create(drawableImage.prototype);
drawableSprite.prototype.constructor = drawableSprite;
drawableSprite.prototype.draw = function(context) {
    if(this.visible){
      this.update();
      if(this.numberOfFrames !== 1){
        context.drawImage(this.img, 
                          this.frameIndex * this.sourceWidth / this.numberOfFrames, // must use total image width not sprite width
                          this.sourceY, 
                          this.sourceWidth / this.numberOfFrames, // image width / frames
                          this.sourceHeight, 
                          this.x * TEST_ARENA.scale,   // destination positionx
                          this.y * TEST_ARENA.scale,   // destination positiony
                          this.width * TEST_ARENA.scale,    // width you want it to be in the end
                          this.height * TEST_ARENA.scale);  // height you want it to be in the end
    }
    else{  
        context.drawImage(this.img, 
                          this.sourceX, 
                          this.sourceY, 
                          this.sourceWidth, 
                          this.sourceHeight, 
                          this.x * TEST_ARENA.scale, 
                          this.y * TEST_ARENA.scale, 
                          this.width * TEST_ARENA.scale, 
                          this.height * TEST_ARENA.scale);
    }
  }
}

//----------------------------------------------------------------------------------------------
// Put generic functions here that manipulate the position of drawable objects
TEST_ARENA.animationHelpers = new (function() {
  /**
   * Move the animated object along x at speed pixels/second from its current position towards
   * drawableObject.endpos
   * 
   * @param {Object} drawableObject Must extend drawableObject class 
   * @param {Number} lastUpdateTime The time of the last frame update of this object
   * @param {Number} speed The speed in pixels/second to move the object
   */
  this.updateXPositionLinearlyWithTime = function(drawableObject, endingX, lastUpdateTime, speed) {
      var time = (new Date()).getTime();
      var timeDiff = time - lastUpdateTime;
      var backwards = endingX - drawableObject.x < 0;
      
      // pixels / second
      var linearSpeedX = (backwards) ? -1 * speed : speed;
      var linearDistEachFrameX = linearSpeedX * timeDiff / 1000;
      drawableObject.x += linearDistEachFrameX;

      if (backwards && drawableObject.x <= endingX) {
        drawableObject.x = endingX;
      } else if (!backwards && drawableObject.x >= endingX) {
        drawableObject.x = endingX;
      }

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
  /* TODO: Refactor as done with the X one above
  this.updateYPositionLinearlyWithTime = function(drawableObject, moveEvent, lastUpdateTime, speed) {
      var time = (new Date()).getTime();
      var timeDiff = time - lastUpdateTime;
      var up = moveEvent.endingY - drawableObject.y < 0;
      
      // pixels / second
      var linearSpeedY = (up) ? -1 * speed : speed;
      var linearDistEachFrameY = linearSpeedY * timeDiff / 1000;
      drawableObject.y += linearDistEachFrameY;

      if (up && drawableObject.y <= moveEvent.endingY) {
        drawableObject.Y = moveEvent.endingY;
      } else if (!up && drawableObject.y >= moveEvent.endingY) {
        drawableObject.y = moveEvent.endingY;
      }

      return time;
    }
    */
  //-----------------Coin Flip---------------------------
   this.coinFlip = function(weight){
      var coin = Math.random();
      if(weight){
          return (coin + weight <= .50);
      }
      else{
          return (coin <= .50);
      }
  }
})();





