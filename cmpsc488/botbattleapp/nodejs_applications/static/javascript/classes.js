
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
  var self = this;
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
 *  ticksPer, 
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
    console.log("Error in drawableImage constructor, missing required arguments, returning null now");
    return null;
  }
  
  drawableImage.call(this, options);

  this.frameIndex = options.indexStart || 0;
  this.ticksPerFrame = options.ticksPerFrame || 1;
  this.numberOfFrames = options.numberOfFrames || 1;
  this.loop = options.loop || false;
  if (options.visible !== false) {options.visible = true} // enforce default of true this way
  this.visible = options.visible;
  
  
  //must use total image width not sprite width, force this here instead of in draw
  if(this.numberOfFrames !== 1) {
    this.sourceX = this.frameIndex * this.sourceWidth / this.numberOfFrames;
    this.sourceWidth = this.sourceWidth / this.numberOfFrames; // image width / frames
  }
    
  this.done = false;
  this.tickCount = 0;
  this.update = function () {
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
  }; 
};

drawableSprite.prototype = Object.create(drawableImage.prototype);
drawableSprite.prototype.constructor = drawableSprite;
drawableSprite.prototype.draw = function(context) {
    if(this.visible){
      this.update();
      context.drawImage(this.img, this.sourceX, this.sourceY, this.sourceWidth, 
          this.sourceHeight, this.x * TEST_ARENA.scale, this.y * TEST_ARENA.scale, this.width * TEST_ARENA.scale,  this.height * TEST_ARENA.scale); 
    }
};





//--------------------------The Animator (Controller)------------------------------------
function Animator(gameboard) {
  if ( arguments.callee._singletonInstance )
    return arguments.callee._singletonInstance;
  arguments.callee._singletonInstance = this;
  
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

  var processNextGameState = function() {
    var nextGameState = gameStateQueue.splice(0, 1)[0];

    if (!nextGameState) {
      imRunning = false;
    } else {
      // TODO: Handle errors
      GAME.processGameData(nextGameState.gameData, function(err) {
        GAME.processDebugData(nextGameState.debugData, function(err) {
          async.eachSeries(nextGameState.animatableEvents, GAME.processAnimatableEvent, function(err) {
            processNextGameState();
          });
        });        
      });
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
  this.updateXPositionLinearlyWithTime = function(drawableObject, moveEvent, lastUpdateTime, speed) {
      var time = (new Date()).getTime();
      var timeDiff = time - lastUpdateTime;
      var backwards = moveEvent.endingX - drawableObject.x < 0;
      
      // pixels / second
      var linearSpeedX = (backwards) ? -1 * speed : speed;
      var linearDistEachFrameX = linearSpeedX * timeDiff / 1000;
      drawableObject.x += linearDistEachFrameX;

      if (backwards && drawableObject.x <= moveEvent.endingX) {
        drawableObject.x = moveEvent.endingX;
      } else if (!backwards && drawableObject.x >= moveEvent.endingX) {
        drawableObject.x = moveEvent.endingX;
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
}

//-----------------Coin Flip---------------------------
var coinFlip = function(weight){
	  var coin = Math.random();
	  if(weight){
		  return (coin + weight <= .50);
	  }
	  else{
		  return (coin <= .50);
	  }
}


