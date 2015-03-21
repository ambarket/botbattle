// Define global TEST_ARENA namespace to be shared throughout client side code
TEST_ARENA = {
    'myId' : null, // will probably be used
    'canvas' : null, // Set in testArena.js after page has loaded
    'prevWidth' : null, // Set in testArena.js after page has loaded
    'context' : null, // Set in testArena.js after page is loaded
    'scale' : 1, // set by resizeCanvas     CHANGE in size from ORIGINAL size of canvas
    'scaleFactor' : 1, // set by resizeCanvas   CHANGE in size from PREVIOUS size of canvas since last resize was called 
    'resizeCanvas' : function(){
      this.prevWidth = this.canvas.width;
      console.log(this.prevCanvas);
      this.canvas.width = Math.min(this.canvas.parentNode.getBoundingClientRect().width, 1050);
      this.canvas.height = this.canvas.width * 0.619047619;  // 650/1050 = 0.619047619
      this.scale = document.getElementById("GameCanvas").width / 1050;
      
      this.scaleFactor = this.canvas.width / this.prevWidth;
      console.log(this.scaleFactor, this.scale);
      // Anything that uses scale needs to be updated here.
      for (object in GAME.gameboard.drawableObjects) {
        GAME.gameboard.drawableObjects[object].scale(this.scaleFactor);
      }
      for (list in GAME.gameboard.backgroundElements){
          for(object in GAME.gameboard.backgroundElements[list]){
              GAME.gameboard.backgroundElements[list][object].scale(this.scaleFactor);
          }
      }
      GAME.gameboard.backGroundWidth *= this.scaleFactor;
      GAME.gameboard.backGroundHeight *= this.scaleFactor;
      GAME.gameboard.islandWidth *= this.scaleFactor;
      GAME.gameboard.islandStart *= this.scaleFactor;
      GAME.gameboard.islandCenterHeight *= this.scaleFactor;
      GAME.gameboard.fontSize *= this.scaleFactor;
      GAME.gameboard.gridWidth = GAME.gameboard.islandWidth/25;
      GAME.gameboard.gridCenter = GAME.gameboard.gridWidth/2;
      //console.log(self.gridCenter);
      GAME.gameboard.player1StartX = (0 * GAME.gameboard.gridWidth) + GAME.gameboard.islandStart;// - (self.robotWidth/2) + self.gridCenter;
      GAME.gameboard.player2StartX = (24 * GAME.gameboard.gridWidth) + GAME.gameboard.islandStart;// - (self.robotWidth/2) + self.gridCenter;
      GAME.gameboard.player1StartY = GAME.gameboard.islandCenterHeight - GAME.gameboard.robotHeight;
      GAME.gameboard.player2StartY = GAME.gameboard.islandCenterHeight - GAME.gameboard.robotHeight;  
      GAME.gameboard.player1PositionX = GAME.gameboard.player1StartX;
      GAME.gameboard.player1PositionY = GAME.gameboard.player1StartY;
      GAME.gameboard.player2PositionX = GAME.gameboard.player2StartX;
      GAME.gameboard.player2PositionY = GAME.gameboard.player2StartY;
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

//TODO: Make these members of the TEST_ARENA object instead of global
//--------------------------Drawable Objects------------------------------------
var drawableObject = function(x, y, width, height) {
	this.x = x || 0;
	this.y = y || 0;
	this.width = width || 0;
	this.height = height || 0;
};

drawableObject.prototype.draw = function(context) {
  context.fillRect(this.x,this.y, this.width, this.height);
};


drawableObject.prototype.scale = function(scale) {
  this.x = this.x * scale;
  this.y = this.y * scale;
  this.width = this.width * scale;
  this.height = this.height * scale;
  //console.log('Called scale on', this);
};

var ScaleTest = function(scale) {
  
  for (object in GAME.gameboard.drawableObjects) {
    GAME.gameboard.drawableObjects[object].scale(scale);
  }
  for (list in GAME.gameboard.backgroundElements){
      for(object in GAME.gameboard.backgroundElements[list]){
          GAME.gameboard.backgroundElements[list][object].scale(scale);
      }
  }
}

/** options
 *  {
 *      x: Number
 *      y: number
 *      width:
 *      height:
 *      borderWidth:
 *      fillStyle:
 *      strokeStyle:
 */
var drawableRectangle = function(options) {
  drawableObject.call(this, options.x, options.y, options.width, options.height);
  this.borderWidth = options.borderWidth || 1;
  this.fillStyle = options.fillStyle || '#FFFFFF';
  this.strokeStyle = options.strokeStyle || 'black';
};

drawableRectangle.prototype = Object.create(drawableObject.prototype);
drawableRectangle.prototype.constructor = drawableRectangle;
drawableRectangle.prototype.draw = function(context) {
  context.beginPath();
  context.rect(this.x, this.y, this.width, this.height);
  context.fillStyle = this.fillStyle;
  context.fill();
  context.lineWidth = this.borderWidth;
  context.strokeStyle = this.strokeStyle;
  context.stroke();
};

drawableRectangle.prototype.scale = drawableObject.prototype.scale;

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
  if (options.visible !== false) {options.visible = true} // enforce default of true this way
  this.visible = options.visible;
  
  // Note image starts loading as soon as the src attribute is set
  this.img = new Image();
  this.img.onload = options.loadedCallback;
  this.img.src = options.imageSrc;
};

drawableImage.prototype = Object.create(drawableObject.prototype);
drawableImage.prototype.constructor = drawableImage;
drawableImage.prototype.draw = function(context) {
	if(this.visible){
	  context.drawImage(this.img, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, 
	      this.x, this.y, this.width,  this.height); 
	}
};

drawableImage.prototype.scale = drawableObject.prototype.scale;

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
drawableSprite.prototype.draw = function(context) {  // TODO According to the profiler this is 10% cpu
    if(this.visible){
      if(this.numberOfFrames !== 1){
        this.update();
        context.drawImage(this.img, 
                          this.frameIndex * this.sourceWidth / this.numberOfFrames, // must use total image width not sprite width
                          this.sourceY, 
                          this.sourceWidth / this.numberOfFrames, // image width / frames
                          this.sourceHeight, 
                          this.x,   // destination positionx
                          this.y,   // destination positiony
                          this.width,    // width you want it to be in the end
                          this.height);  // height you want it to be in the end
    }
    else{  
        context.drawImage(this.img, 
                          this.sourceX, 
                          this.sourceY, 
                          this.sourceWidth, 
                          this.sourceHeight, 
                          this.x, 
                          this.y, 
                          this.width, 
                          this.height);
    }
  }
}

drawableSprite.prototype.scale = drawableObject.prototype.scale;

//----------------------------------------------------------------------------------------------
// Put generic functions here that manipulate the position of drawable objects and other stuff
TEST_ARENA.helpers = new (function() {
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
   
   
   this.appendArrayOfDivsToHtmlElementById = function(id, contentArray) {
     for (var i = 0; i < contentArray.length; i++) {
       this.appendDivToHtmlElementById(id, contentArray[i]);
     }
   }

   this.appendDivToHtmlElementById = function(id, content) {
     //Add debugging data to the page
     var element =  document.getElementById(id);
     var html = [];
     html.push(element.innerHTML);
     html.push('<div>' + content + '</div>');
     element.innerHTML = html.join('');
     element.scrollTop = element.scrollHeight;
   }
})();





