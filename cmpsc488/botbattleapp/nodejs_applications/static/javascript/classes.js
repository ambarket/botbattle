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
  this.update = function () {
      self.tickCount += 1;	
      if (self.tickCount > self.ticksPerFrame) {
      	self.tickCount = 0;
      	if(self.frameIndex < self.numberOfFrames - 1){
          self.frameIndex += 1; 
      	}
      	else{
      		self.frameIndex = 0;
      	}
      }
  }; 
  
  console.log(this);
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
				  			this.x,   // destination positionx
				  			this.y,   // destination positiony
				  			this.destWidth,    // width you want it to be in the end
				  			this.destHeight);  // height you want it to be in the end
	  }
	  else{  
		  context.drawImage(this.img, 
				  			this.sourceX, 
				  			this.sourceY, 
				  			this.sourceWidth, 
				  			this.sourceHeight, 
				  			this.x, 
				  			this.y, 
				  			this.destWidth, 
				  			this.destHeight);
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

//--------------------------The GameBoard (Model)------------------------------------
var GameBoard = function(readyCallback) {
  // Implements the singleton pattern so animator and drawer share the same GameBoard
  if ( arguments.callee._singletonInstance ){
    if(!readyCallback || typeof(readyCallback) != "function" ){
    	console.log("No callback passed to GameBoard");
    }
    else{
    	readyCallback(null, arguments.callee._singletonInstance);
    }
  }
  arguments.callee._singletonInstance = this;
  
  var self = this;
  
  this.player1SpriteSheet = 'static/images/FullSpriteSheetRight.png';
  this.player2SpriteSheet = 'static/images/FullSpriteSheetLeft.png'
  this.scale = 1;
  
  this.backGroundWidth = 1050 * self.scale;
  this.backGroundHeight = 650 * self.scale;
  this.islandWidth = 870 * self.scale;
  this.islandStart = 83 * self.scale;
  this.islandCenterHeight = 468 * self.scale;
  this.robotWidth = 43 * self.scale;
  this.robotHeight = 79 * self.scale;
  this.numberOfGrids = 25;
  this.gridWidth = self.islandWidth/25;
  //this.gridCenter = self.gridWidth/2;
  //console.log(self.gridCenter);
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
  
  
  // can get the image width property automatically
  this.drawableObjects = {
    backgroundImg : new drawableImage('static/images/SaveTheIslandBackGround3.png', 0, 0, self.backGroundWidth, self.backGroundHeight, null, null, null, null, null, null, null, false, true, imageLoadedCallback),
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
  }
  
  this.playerAnimations = {
		  player1 : {
			  current : self.drawableObjects.player1,
			  standing : self.drawableObjects.player1,
			  move : self.drawableObjects.player1Running,
			  //attack : "player1Attack",
			  //defend : "player1Defend",
			  //hit : "player1Falling",
			  //lose : "player1Lost"
		  },
		  player2 : {
			  current : self.drawableObjects.player2,
			  standing : self.drawableObjects.player2,
			  move : self.drawableObjects.player2Running,
			  //attack : "player2Attack",
			  //defend : "player2Defend",
			  //hit : "player2Falling",
			  //lose : "player2Lost"
		  }
  }
  /*var canvas = document.getElementById("myCanvas");
  
  var player1Running = sprite({
	    context: canvas.getContext("2d"),
	    width: 100,
	    height: 100,
	    image: this.drawableObjects.player3
	});*/
  // add the boxes here for testing then make just two with a number in them from canvas text instead
  // add animations based on the tut http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/
  // look into tweening and base which splice based on distance traveled so it looks fluid
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
  
  var imagesLoaded= 0, expectedImagesLoaded=8;
  function imageLoadedCallback() {
    imagesLoaded++;
    if (imagesLoaded == expectedImagesLoaded) {
    	if(readyCallback && typeof readyCallback === "function"){
    		readyCallback(null, self);
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
      backgroundAnimations();
      //var drawableObject = gameboard.drawableObjects[moveEvent.objectName];
      gameboard.playerAnimations[moveEvent.objectName].standing.visible = false;
      gameboard.playerAnimations[moveEvent.objectName].move.visible = true;
      
      var drawableObject = gameboard.playerAnimations[moveEvent.objectName].move;
      gameboard.playerAnimations[moveEvent.objectName].current = drawableObject;
      var time;
      var done;
      
      // maybe add logic to change speed based on forward or backward or after hit or something
      // would be nice to have easing and acceleration but not possible like this
      // would like curves too, but this is all unnecessary right now
      time = updateXPositionLinearlyWithTime(drawableObject, moveEvent, lastUpdateTime, 160);
      time = updateYPositionLinearlyWithTime(drawableObject, moveEvent, lastUpdateTime, 220);
      
      done = moveEvent.animationComplete(drawableObject);
      
      drawer.drawBoard();

      if (!done) {
        requestAnimFrame(function() {
          animations.move(moveEvent, time, callback);
        });
      } else {
    	  gameboard.playerAnimations[moveEvent.objectName].move.visible = false;
    	  gameboard.playerAnimations[moveEvent.objectName].standing.visible = true;
          gameboard.playerAnimations[moveEvent.objectName].current = gameboard.playerAnimations[moveEvent.objectName].standing;
          gameboard.playerAnimations[moveEvent.objectName].current.x = drawableObject.x;
          gameboard.playerAnimations[moveEvent.objectName].current.y = drawableObject.y;
          callback();
      }
    },
    fly : function(moveEvent, lastUpdateTime, callback) { // break this up to ascendHover and descendHover
        backgroundAnimations();
        var drawableObject = gameboard.drawableObjects[moveEvent.objectName];
        var time;
        
        var endX = moveEvent.endingX;
        moveEvent.endingX = drawableObject.x;
        
        moveEvent.event = 'move';
        
        animations.move(moveEvent, (new Date()).getTime(), function(){
        	moveEvent.endingX = endX;
        	animations.move(moveEvent, (new Date()).getTime(),function(){
        		moveEvent.endingY = drawableObject.y + 100;
        		animations.move(moveEvent, (new Date()).getTime() , callback)
        	})
        });
    },
    attack : function(animation, callback) {

    },
    wasAttacked : function(animation, callback) {
    	backgroundAnimations();
        var drawableObject = gameboard.drawableObjects[moveEvent.objectName];
        var time;
        
        var endX = moveEvent.endingX;
        moveEvent.endingX = drawableObject.x;
        
        moveEvent.event = 'move';
        
        animations.move(moveEvent, (new Date()).getTime(), function(){
        	moveEvent.endingX = endX;
        	animations.move(moveEvent, (new Date()).getTime(),function(){
        		moveEvent.endingY = drawableObject.y + 100;
        		animations.move(moveEvent, (new Date()).getTime() , callback)
        	})
        });
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
    
    if(animatableEvent.event === 'move'){
        if (coinFlip(1)){  // stop the flying for now to test other things
        	// make the robot fly half the time
        	setFlyHeight(animatableEvent, 100)
    		animations[animatableEvent.event](animatableEvent, startTime, callback);
    	}
        else{
        	animations[animatableEvent.event](animatableEvent, startTime, callback);
        }
    }
    else{
    	animations[animatableEvent.event](animatableEvent, startTime, callback);
    }
  }
  
  var setFlyHeight = function(animatableEvent, height){
	  animatableEvent.event = 'fly';
	  animatableEvent.endingY = gameboard.drawableObjects[animatableEvent.objectName].y - height;
  }
  
  // Stupid but shows we can add logic to update other elements every frame pretty easily here
  var backgroundAnimations = function(startTime) {
    // Move the trees around
    for (treeIndex in gameboard.backgroundElements.trees1){
      if (coinFlip()) {
    	  gameboard.backgroundElements.trees1[treeIndex].x+=1;
      }
      else {
    	  gameboard.backgroundElements.trees1[treeIndex].x-=1;
      }
    }
    for (treeIndex in gameboard.backgroundElements.trees2){
        if (coinFlip()) {
      	  gameboard.backgroundElements.trees2[treeIndex].y+=1;
        }
        else {
      	  gameboard.backgroundElements.trees2[treeIndex].y-=1;
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
  //TODO Create drawableObject class
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
//------------------------------------------------------
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
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext('2d');

  this.drawBoard = function() {
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
	  console.log(p1Grid, p2Grid);
	  var distanceBetweenPlayers = Math.abs(p1Grid - p2Grid);
	  
	  context.font='30px Arial';
	  context.fillStyle="black";
	  if((p1Grid >= 0 && p1Grid <= 24) && (p2Grid >= 0 && p2Grid <= 24)){
		  context.fillText(Math.floor(distanceBetweenPlayers),495,550);
	  }
	  else{
		  if(p1Grid < 0){
			  context.fillText("Player 2 Wins",405,550);
		  }
		  if(p2Grid > 24){
			  context.fillText("Player 1 Wins",405,550);
		  }
	  }
  }
  
  var clearCanvas = function() {
    context.clearRect(0, 0, self.canvas.width, self.canvas.height);
  }
}
