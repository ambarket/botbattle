var scale = 1;
//--------------------------Drawable Objects------------------------------------
var drawableObject = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};

drawableObject.prototype.draw = function(context) {
  context.fillRect(this.x,this.y,1,1);
};

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
// need to make this have optional parameters and multiple constructors so don't have to pass null and pass objects
var drawableImage = function(imageSrc, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, indexStart, ticksPer, numberOfFrames, loop, visible, loadedCallback) {
  drawableObject.call(this, destX, destY);
  var self = this;
  this.sourceX = sourceX || 0;
  this.sourceY = sourceY || 0;
  this.sourceWidth = sourceWidth;
  this.sourceHeight = sourceHeight;
  this.img = new Image();
  this.img.onload = loadedCallback;
  this.img.src = imageSrc;
  //this.y = (typeof destY === "undefined" || destY === "null") ? sourceY : destY; <--------------this won't work for some reason
  this.destWidth = destWidth || sourceWidth;
  this.destHeight = destHeight || sourceHeight;
  this.frameIndex = indexStart || 0;
  this.tickCount = 0;
  this.ticksPerFrame = ticksPer || 1;
  this.numberOfFrames = numberOfFrames || 1;
  this.loop = loop;
  this.visible = visible;
  this.done = false;
  this.update = function () {
      self.tickCount += 1;	
      if (self.tickCount > self.ticksPerFrame) {
      	self.tickCount = 0;
      	if(self.frameIndex < self.numberOfFrames - 1){
          self.frameIndex += 1; 
      	}
      	else{
      	  if (!loop) {
            self.done = true;
      	  }
      	  self.frameIndex = 0;
      	}
      }
  }; 
  
  //console.log(this);
};

drawableImage.prototype = Object.create(drawableObject.prototype);
drawableImage.prototype.constructor = drawableRectangle;
drawableImage.prototype.draw = function(context) {
  // temporary add to outline the boxes of objects for measureing purposes
	 /* context.beginPath();
	  context.rect(this.x, this.y, this.destWidth, this.destHeight);
	  context.fillStyle = '#8ED6FF';
	  context.fill();
	  context.lineWidth = this.borderWidth;
	  context.strokeStyle = 'black';
	  context.stroke(); */
	  
	if(this.visible){
	  this.update();
	  
	  if(this.numberOfFrames !== 1){
		  context.drawImage(this.img, 
				  			this.frameIndex * this.sourceWidth / this.numberOfFrames, // must use total image width not sprite width
				  			this.sourceY, 
				  			this.sourceWidth / this.numberOfFrames, // image width / frames
				  			this.sourceHeight, 
				  			this.x * scale,   // destination positionx
				  			this.y * scale,   // destination positiony
				  			this.destWidth * scale,    // width you want it to be in the end
				  			this.destHeight * scale);  // height you want it to be in the end
	  }
	  else{  
		  context.drawImage(this.img, 
				  			this.sourceX, 
				  			this.sourceY, 
				  			this.sourceWidth, 
				  			this.sourceHeight, 
				  			this.x * scale, 
				  			this.y * scale, 
				  			this.destWidth * scale, 
				  			this.destHeight * scale);
	  }
	}
};

/*function sprite (options) {
	
    var that = {};
					
    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.image = options.image;

    return that;
}*/

//--------------------------Animatable Events------------------------------------
var AnimatableEvent = function(event, objectName) {
  this.objectName = objectName;
  this.event = event;
}
AnimatableEvent.prototype.animationComplete = function() {
  return true;
}

var MoveEvent = function(objectName, endingX, endingY) {
	var gameboard = new GameBoard();
  AnimatableEvent.call(this, 'move', objectName);
  
  this.endingX = (endingX * gameboard.gridWidth) + gameboard.islandStart;
  this.endingY = endingY;
}

MoveEvent.prototype = Object.create(AnimatableEvent.prototype);
MoveEvent.prototype.animationComplete = function(drawableObject) {
  return drawableObject.x == this.endingX && drawableObject.y == this.endingY;
}

var DefendEvent = function(objectName) {
  var gameboard = new GameBoard();
  AnimatableEvent.call(this, 'defend', objectName);
}

DefendEvent.prototype = Object.create(AnimatableEvent.prototype);
DefendEvent.prototype.animationComplete = function(drawableObject) {
  if (drawableObject.done) {
    drawableObject.done = false;
    return true;
  }
}

//--------------------------The GameBoard (Model)------------------------------------
var GameBoard = function() {
  // Implements the singleton pattern so animator and drawer share the same GameBoard
  if ( arguments.callee._singletonInstance ){
    	return arguments.callee._singletonInstance;
  }
  arguments.callee._singletonInstance = this;
  
  var canvas = document.getElementById("GameCanvas");
  var context = canvas.getContext('2d');
  
  var fontSize = 30 * scale;
  context.font= fontSize + 'px Arial';
  context.fillStyle="black";
      context.fillText("Loading...", 1050/2 * scale - 300, 650/2 * scale);
  
  var self = this;
  
  this.player1SpriteSheet = 'static/images/FullSpriteSheetRight.png';
  this.player2SpriteSheet = 'static/images/FullSpriteSheetLeft.png';
  
  this.resize = function(){

	  var canvasContainer = document.getElementsByClassName('col_9')[0].getBoundingClientRect();
	  //console.log(canvasContainer);
  	  canvas.width = Math.min(canvasContainer.width, 1050);
  	  canvas.height = canvas.width * 0.619047619;  // 650/1050 = 0.619047619
  	  scale = document.getElementById("GameCanvas").width / 1050;
  }
  
  this.backGroundWidth = 1050;
  this.backGroundHeight = 650;
  this.islandWidth = 870;
  this.islandStart = 83;
  this.islandCenterHeight = 468;
  this.robotWidth = 43;
  this.robotHeight = 79;
  this.numberOfGrids = 25;
  this.gridWidth = self.islandWidth/25;
  this.gridCenter = self.gridWidth/2;
  console.log(self.gridCenter);
  this.player1StartX = (0 * self.gridWidth) + self.islandStart;// - (self.robotWidth/2) + self.gridCenter;
  this.player2StartX = (24 * self.gridWidth) + self.islandStart;// - (self.robotWidth/2) + self.gridCenter;
  this.player1StartY = self.islandCenterHeight - self.robotHeight;
  this.player2StartY = self.islandCenterHeight - self.robotHeight;  
  this.player1StandingSpriteSheetX = 2107;
  this.player1StandingSpriteSheetY = 22;
  this.player2StandingSpriteSheetY = 22;
  this.player2StandingSpriteSheetX = 687;
  this.player1PositionX = self.player1StartX;
  this.player1PositionY = self.player1StartY;
  this.player2PositionX = self.player2StartX;
  this.player2PositionY = self.player2StartY;
  
  this.loadImages = function(callback) {
    // can get the image width property automatically
    this.drawableObjects = {
      backgroundImg : new drawableImage('static/images/SaveTheIslandBackGround3.png', 0, 0, self.backGroundWidth, self.backGroundHeight, 0, 0, self.backGroundWidth, self.backGroundHeight, null, null, null, false, true, imageLoadedCallback),
      player1 : new drawableImage(self.player1SpriteSheet, 
      							self.player1StandingSpriteSheetX, 
      							self.player1StandingSpriteSheetY, 
      							self.robotWidth, 
      							self.robotHeight, 
      							self.player1PositionX, 
      							self.player1PositionY, 
      							self.robotWidth, 
      							self.robotHeight, null, null, null, false, true, imageLoadedCallback),
      player2 : new drawableImage(self.player2SpriteSheet, 
      							self.player2StandingSpriteSheetX, 
      							self.player2StandingSpriteSheetY, 
      							self.robotWidth, 
      							self.robotHeight, 
      							self.player2PositionX, 
      							self.player2PositionY, 
      							self.robotWidth, 
      							self.robotHeight, null, null, null, false, true, imageLoadedCallback),
      player1Running : new drawableImage('static/images/RunningRight.png', 
      							0, 
      							self.player1StandingSpriteSheetY, 
      							592, 
      							self.robotHeight, 
      							self.player1PositionX, 
      							self.player1PositionY, 
      							74, 
      							self.robotHeight, null, 8, 8, true, false, imageLoadedCallback),
  	player2Running : new drawableImage('static/images/RunningLeft.png', 
  								0, 
  								self.player2StandingSpriteSheetY, 
  								592, 
  								self.robotHeight, 
  								self.player2PositionX, 
  								self.player2PositionY, 
  								74, 
  								self.robotHeight, null, 8, 8, true, false, imageLoadedCallback),
  	player1Blocking : new drawableImage('static/images/BlockingRight.png', 
  								0, 
  								self.player1StandingSpriteSheetY, 
  								518, 
  								self.robotHeight, 
  								self.player1PositionX, 
  								self.player1PositionY, 
  								74, 
  								self.robotHeight, null, 8, 7, false, false, imageLoadedCallback),
  	player2Blocking : new drawableImage('static/images/BlockingLeft.png', 
  								0, 
  								self.player2StandingSpriteSheetY, 
  								518, 
  								self.robotHeight, 
  								self.player2PositionX, 
  								self.player2PositionY, 
  								74, 
  								self.robotHeight, null, 8, 7, false, false, imageLoadedCallback),
    }
    
    this.playerAnimations = {
  		  player1 : {
  			  current : self.drawableObjects.player1,
  			  standing : self.drawableObjects.player1,
  			  move : self.drawableObjects.player1Running,
  			  //attack : "player1Attack",
  			  defend : self.drawableObjects.player1Blocking,
  			  //hit : "player1Falling",
  			  //lose : "player1Lost"
  		  },
  		  player2 : {
  			  current : self.drawableObjects.player2,
  			  standing : self.drawableObjects.player2,
  			  move : self.drawableObjects.player2Running,
  			  //attack : "player2Attack",
  			  defend : self.drawableObjects.player2Blocking,
  			  //hit : "player2Falling",
  			  //lose : "player2Lost"
  		  }
    }
    
      this.backgroundElements = {
        trees1 : {
          tree1 : new drawableImage('static/images/tree.png', 0, 0, 32, 49, 10, 110, 20, 20, null, null, null, false, true, imageLoadedCallback),
          tree2 : new drawableImage('static/images/tree.png', 0, 0, 32, 49, 75, 100, 20, 20, null, null, null, false, true, imageLoadedCallback),
        },
        trees2 : {
            tree3 : new drawableImage('static/images/tree.png', 0, 0, 32, 49, 150, 154, 20, 20, null, null, null, false, true, imageLoadedCallback),
            tree4 : new drawableImage('static/images/tree.png', 0, 0, 32, 49, 250, 160, 20, 20, null, null, null, false, true, imageLoadedCallback),
            tree5 : new drawableImage('static/images/tree.png', 0, 0, 32, 49, 350, 125, 20, 20, null, null, null, false, true, imageLoadedCallback),
        }
      }
      
      var imagesLoaded= 0, expectedImagesLoaded=12;
      function imageLoadedCallback() {
        imagesLoaded++;
        if (imagesLoaded == expectedImagesLoaded) {
          callback();
        }
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
        //backgroundAnimations();
        gameboard.playerAnimations[moveEvent.objectName].standing.visible = false;
        gameboard.playerAnimations[moveEvent.objectName].move.visible = true;
        
        var drawableObject = gameboard.playerAnimations[moveEvent.objectName].move;
        gameboard.playerAnimations[moveEvent.objectName].current = drawableObject;
        var time;
        var done;
        
        time = updateXPositionLinearlyWithTime(drawableObject, moveEvent, lastUpdateTime, gameboard.islandWidth * 0.183908046); // 0.183908046 is 160/870 
        time = updateYPositionLinearlyWithTime(drawableObject, moveEvent, lastUpdateTime, gameboard.islandWidth * 0.183908046);
        
        done = moveEvent.animationComplete(drawableObject);
        
        //drawer.drawBoard();

        if (!done) {
          requestAnimFrame(function() {
            animations.move(moveEvent, time, callback);
          });
        } 
        else {   // maybe make just current instead of changing visible...
      	  gameboard.playerAnimations[moveEvent.objectName].move.visible = false;
      	  gameboard.playerAnimations[moveEvent.objectName].standing.visible = true;
            gameboard.playerAnimations[moveEvent.objectName].current = gameboard.playerAnimations[moveEvent.objectName].standing;
            gameboard.playerAnimations[moveEvent.objectName].current.x = drawableObject.x;
            gameboard.playerAnimations[moveEvent.objectName].current.y = drawableObject.y;
            callback();
        }
    },
    /*fly : function(moveEvent, lastUpdateTime, callback) { // break this up to ascendHover and descendHover
        backgroundAnimations();
        var drawableObject = gameboard.drawableObjects[moveEvent.objectName];
        var time;
        
        var endX = moveEvent.endingX;
        moveEvent.endingX = drawableObject.x;
        
        moveEvent.event = 'move';
        
        animations.move(moveEvent, (new Date()).getTime(), function(){
        	moveEvent.endingX = endX;
        	animations.move(moveEvent, (new Date()).getTime(),function(){
        		moveEvent.endingY = drawableObject.y + 100 * gameboard.scale; // this needs to be height * scale
        		animations.move(moveEvent, (new Date()).getTime() , callback)
        	})
        });
    },*/
    attack : function(animation, callback) {

    },
    wasAttacked : function(animation, callback) {
    	
    },
    defend : function(moveEvent, time, callback) {
      gameboard.playerAnimations[moveEvent.objectName].defend.x = gameboard.playerAnimations[moveEvent.objectName].standing.x;
      gameboard.playerAnimations[moveEvent.objectName].defend.y = gameboard.playerAnimations[moveEvent.objectName].standing.y;  
      
      gameboard.playerAnimations[moveEvent.objectName].standing.visible = false;
      gameboard.playerAnimations[moveEvent.objectName].defend.visible = true;
      
      var drawableObject = gameboard.playerAnimations[moveEvent.objectName].defend;
      gameboard.playerAnimations[moveEvent.objectName].current = drawableObject;

      var done = moveEvent.animationComplete(drawableObject);
      if (!done) {
        requestAnimFrame(function() {
          animations.defend(moveEvent, time, callback);
        });
      } 
      else {   // maybe make just current instead of changing visible...
    	    gameboard.playerAnimations[moveEvent.objectName].defend.visible = false;
    	    gameboard.playerAnimations[moveEvent.objectName].standing.visible = true;
          gameboard.playerAnimations[moveEvent.objectName].current = gameboard.playerAnimations[moveEvent.objectName].standing;
          gameboard.playerAnimations[moveEvent.objectName].current.x = drawableObject.x;
          gameboard.playerAnimations[moveEvent.objectName].current.y = drawableObject.y;
          callback();
      }
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
  
  /*var setFlyHeight = function(animatableEvent, height){
	  animatableEvent.event = 'fly';
	  animatableEvent.endingY = gameboard.drawableObjects[animatableEvent.objectName].y - height;
  }*/
  
  var treeMove = 1;
  this.upDateBackground = function(startTime) {
    
	//requestAnimationFrame(self.backgroundAnimations);
	//drawer.drawBoard();
	
	treeMove *= -1;
	
	// Move the trees around
    for (treeIndex in gameboard.backgroundElements.trees1){
    	gameboard.backgroundElements.trees1[treeIndex].x += (treeMove * 5 * scale);
    }
    for (treeIndex in gameboard.backgroundElements.trees2){
    	gameboard.backgroundElements.trees2[treeIndex].y += (treeMove * 5 * scale);
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
  var updateXPositionLinearlyWithTime = function(drawableObject, moveEvent, lastUpdateTime, speed) {
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
  var updateYPositionLinearlyWithTime = function(drawableObject, moveEvent, lastUpdateTime, speed) {
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

//--------------------------The Drawer (View)------------------------------------
function Drawer(gameboard) {
  if ( arguments.callee._singletonInstance )
    return arguments.callee._singletonInstance;
  arguments.callee._singletonInstance = this;
  
  var self = this;
  var canvas = document.getElementById('GameCanvas');
  var context = canvas.getContext('2d');
  var animator = new Animator(gameboard);
  
  this.drawBoard = function() {
	  
	//animator.upDateBackground();
	//console.log("Drawing gameboard");
    
	for (object in gameboard.drawableObjects) {
      gameboard.drawableObjects[object].draw(context);
    }
    for (list in gameboard.backgroundElements){
    	for(object in gameboard.backgroundElements[list]){
    		gameboard.backgroundElements[list][object].draw(context);
    	}
    }
    drawGridNumbers();
  }
  
  var drawGridNumbers = function(){
	  var player1PositionX = gameboard.playerAnimations["player1"].current.x;
	  var player1PositionY = gameboard.playerAnimations["player1"].current.y;
	  var player2PositionX = gameboard.playerAnimations["player2"].current.x;
	  var player2PositionY = gameboard.playerAnimations["player2"].current.y;
	  var p1Grid = Math.floor((player1PositionX - gameboard.islandStart)/ gameboard.gridWidth);
	  var p2Grid = Math.floor((player2PositionX - gameboard.islandStart)/ gameboard.gridWidth);
	  //console.log(p1Grid, p2Grid);
	  var distanceBetweenPlayers = Math.abs(p1Grid - p2Grid);
	  
	  var fontSize = 30 * scale;
	  context.font= fontSize + 'px Arial';
	  context.fillStyle="black";
	  if((p1Grid >= 0 && p1Grid <= 24) && (p2Grid >= 0 && p2Grid <= 24)){
		  context.fillText(Math.floor(distanceBetweenPlayers), 495 * scale, 550 * scale);
	  }
	  else{
		  if(p1Grid < 0){
			  context.fillText("Player 2 Wins", 405 * scale, 550 * scale);
		  }
		  if(p2Grid > 24){
			  context.fillText("Player 1 Wins", 405 * scale, 550 * scale);
		  }
	  }
  }
  
  var clearCanvas = function() {
    context.clearRect(0, 0, self.canvas.width, self.canvas.height); // not needed because background draws over old stuff
  }
}
