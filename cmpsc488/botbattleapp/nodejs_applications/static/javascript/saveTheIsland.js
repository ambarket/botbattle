GAME = {
    'processGameData' : function(gameData, processGameDataCallback) {
      // Add tiles and turn description to the page
      processGameDataCallback();
    },

    'processDebugData' : function(debugData, processDebugDataCallback) {
      //Add debugging data to the page
      processDebugDataCallback();
    },
    
    'processAnimatableEvent' : function(animatableEvent, processAnimationCallback) {
      // Take an object past in the animatableEvents array from the game manager
      //    and animate it on the canvas.
      //    Each animatableEvent has an 'event' property naming the event
      //    and a 'data' object containing any necessary information for the animation
      var startTime = (new Date()).getTime();
      animations[animatableEvent.event](animatableEvent, startTime, processAnimationCallback);
    },
    
    // Run each time the drawer draws?
    'updateBackground' : function(startTime) {
      
      //requestAnimationFrame(self.backgroundAnimations);
      //drawer.drawBoard();
      var treeMove = 1;
      treeMove *= -1;
      
      // Move the trees around
      for (treeIndex in GAME.gameboard.backgroundElements.trees1){
          GAME.gameboard.backgroundElements.trees1[treeIndex].x += (treeMove * 5 * TEST_ARENA.scale);
      }
      for (treeIndex in GAME.gameboard.backgroundElements.trees2){
          GAME.gameboard.backgroundElements.trees2[treeIndex].y += (treeMove * 5 * TEST_ARENA.scale);
        }
    },
    
    'gameboard' : null, // will be set by the resetGAME.gameboard method
    'drawer' : new Drawer(),
    
    'resetGameboard' : function(readyCallback) {
      var gb = new GameBoard();
      // TODO: Add err argument if they can occur
      gb.loadResources(function() {
        GAME.gameboard = gb;
        console.log(GAME.gameboard);
        readyCallback();
      });
    }
}
  var animations = {
      move : function(event, lastUpdateTime, callback) {
          //backgroundAnimations();
        var finalPosition = (event.data.finalPosition * GAME.gameboard.gridWidth) + GAME.gameboard.islandStart;
        
        GAME.gameboard.playerAnimations[event.data.objectName].standing.visible = false;
        GAME.gameboard.playerAnimations[event.data.objectName].move.visible = true;
        
        var drawableObject = GAME.gameboard.playerAnimations[event.data.objectName].move;
        GAME.gameboard.playerAnimations[event.data.objectName].current = drawableObject;

        var time = TEST_ARENA.animationHelpers.updateXPositionLinearlyWithTime(drawableObject, finalPosition, lastUpdateTime, GAME.gameboard.islandWidth * 0.183908046); // 0.183908046 is 160/870 
        
        var done = drawableObject.x === finalPosition;
         
        if (!done) {
          requestAnimFrame(function() {
            animations.move(event, time, callback);
          });
        } 
        else {   // maybe make just current instead of changing visible...
            GAME.gameboard.playerAnimations[event.data.objectName].move.visible = false;
            GAME.gameboard.playerAnimations[event.data.objectName].standing.visible = true;
            GAME.gameboard.playerAnimations[event.data.objectName].current = GAME.gameboard.playerAnimations[event.data.objectName].standing;
            GAME.gameboard.playerAnimations[event.data.objectName].current.x = drawableObject.x;
            GAME.gameboard.playerAnimations[event.data.objectName].current.y = drawableObject.y;
            callback();
        }
      },
      attack : function(animation, callback) {

      },
      defend : function(event, time, callback) {
        var defendingPlayer = event.data.objectName;
        var attackingPlayer = null;
        if (moveEvent.objectName == 'player1') {
          attackingPlayer = 'player2';
        }
        else {
          attackingPlayer = 'player1';
        }
        // Set current state and position of defending player
        GAME.gameboard.playerAnimations[defendingPlayer].defend.x = GAME.gameboard.playerAnimations[defendingPlayer].standing.x;
        GAME.gameboard.playerAnimations[defendingPlayer].defend.y = GAME.gameboard.playerAnimations[defendingPlayer].standing.y;  
        GAME.gameboard.playerAnimations[defendingPlayer].standing.visible = false;
        GAME.gameboard.playerAnimations[defendingPlayer].defend.visible = true;
        var defendingSprite = GAME.gameboard.playerAnimations[defendingPlayer].defend;
        GAME.gameboard.playerAnimations[defendingPlayer].current = defendingSprite;
        
        // Set current state and position of attacking player
        GAME.gameboard.playerAnimations[attackingPlayer].defend.x = GAME.gameboard.playerAnimations[attackingPlayer].standing.x;
        GAME.gameboard.playerAnimations[attackingPlayer].defend.y = GAME.gameboard.playerAnimations[attackingPlayer].standing.y;  
        GAME.gameboard.playerAnimations[attackingPlayer].standing.visible = false;
        GAME.gameboard.playerAnimations[attackingPlayer].defend.visible = true;
        var attackingSprite = GAME.gameboard.playerAnimations[attackingPlayer].defend;
        GAME.gameboard.playerAnimations[attackingPlayer].current = attackingSprite;
        
        
        var done = moveEvent.animationComplete(defendingSprite);
        if (!done) {
          requestAnimFrame(function() {
            animations.defend(moveEvent, time, callback);
          });
        } 
        else {   // maybe make just current instead of changing visible...
            GAME.gameboard.playerAnimations[defendingPlayer].defend.visible = false;
            GAME.gameboard.playerAnimations[defendingPlayer].standing.visible = true;
            //GAME.gameboard.playerAnimations[defendingPlayer].current = GAME.gameboard.playerAnimations[moveEvent.objectName].standing;
            //GAME.gameboard.playerAnimations[defendingPlayer].current.x = defendingSprite.x;
            //GAME.gameboard.playerAnimations[defendingPlayer].current.y = defendingSprite.y;
            
            GAME.gameboard.playerAnimations[attackingPlayer].defend.visible = false;
            GAME.gameboard.playerAnimations[attackingPlayer].standing.visible = true;
            
            // Note attacking player will fall backwards as result of next event
            callback();
        }
      },
      died : function(animation, callback) {

      }
    }

//--------------------------The Drawer (View)------------------------------------
function Drawer() {
  if ( arguments.callee._singletonInstance )
    return arguments.callee._singletonInstance;
  arguments.callee._singletonInstance = this;
  
  var self = this;
  /*
  var canvas = document.getElementById('GameCanvas');
  var context = canvas.getContext('2d');
  */
  
  this.drawBoard = function() {
      
    // TODO Not going to be in animator any more, and animator wont be called that
    //animator.upDateBackground();
    //console.log("Drawing GAME.gameboard");
    
    for (object in GAME.gameboard.drawableObjects) {
      GAME.gameboard.drawableObjects[object].draw(TEST_ARENA.context);
    }
    for (list in GAME.gameboard.backgroundElements){
        for(object in GAME.gameboard.backgroundElements[list]){
            GAME.gameboard.backgroundElements[list][object].draw(TEST_ARENA.context);
        }
    }
    drawGridNumbers();
  }
  
  var drawGridNumbers = function(){
      var player1PositionX = GAME.gameboard.playerAnimations["player1"].current.x;
      var player1PositionY = GAME.gameboard.playerAnimations["player1"].current.y;
      var player2PositionX = GAME.gameboard.playerAnimations["player2"].current.x;
      var player2PositionY = GAME.gameboard.playerAnimations["player2"].current.y;
      var p1Grid = Math.floor((player1PositionX - GAME.gameboard.islandStart)/ GAME.gameboard.gridWidth);
      var p2Grid = Math.floor((player2PositionX - GAME.gameboard.islandStart)/ GAME.gameboard.gridWidth);
      //console.log(p1Grid, p2Grid);
      var distanceBetweenPlayers = Math.abs(p1Grid - p2Grid);
      
      var fontSize = 30 * TEST_ARENA.scale;
      TEST_ARENA.context.font= fontSize + 'px Arial';
      TEST_ARENA.context.fillStyle="black";
      if((p1Grid >= 0 && p1Grid <= 24) && (p2Grid >= 0 && p2Grid <= 24)){
        TEST_ARENA.context.fillText(Math.floor(distanceBetweenPlayers), 495 * TEST_ARENA.scale, 550 * TEST_ARENA.scale);
      }
      else{
          if(p1Grid < 0){
            TEST_ARENA.context.fillText("Player 2 Wins", 405 * TEST_ARENA.scale, 550 * TEST_ARENA.scale);
          }
          if(p2Grid > 24){
            TEST_ARENA.context.fillText("Player 1 Wins", 405 * TEST_ARENA.scale, 550 * TEST_ARENA.scale);
          }
      }
  }
}


//--------------------------The GAME.gameboard (Model)------------------------------------
var GameBoard = function() {
  // Implements the singleton pattern so animator and drawer share the same GAME.gameboard
  if ( arguments.callee._singletonInstance ){
        return arguments.callee._singletonInstance;
  }
  arguments.callee._singletonInstance = this;
  
  var canvas = document.getElementById("GameCanvas");
  var context = canvas.getContext('2d');
  
  var fontSize = 30 * TEST_ARENA.scale;
  context.font= fontSize + 'px Arial';
  context.fillStyle="black";
      context.fillText("Loading...", 1050/2 * TEST_ARENA.scale - 300, 650/2 * TEST_ARENA.scale);
  
  var self = this;
  
  this.player1SpriteSheet = 'static/images/FullSpriteSheetRight.png';
  this.player2SpriteSheet = 'static/images/FullSpriteSheetLeft.png';
 
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
  
  this.loadResources = function(callback) {
    // can get the image width property automatically
    /**
      options : {
       'imageSrc' :   ,
       'sourceX' :   ,
       'sourceY' :   ,
       'sourceWidth' :   , 
       'sourceHeight' :   ,
       'x' :   ,
       'y' :   ,
       'width' :   ,
       'height' :   ,
       'indexStart' :   , 
       'ticksPer' :   , 
       'numberOfFrames' :   ,
       'loop' :   , 
       'visible' :   ,
       'loadedCallback' :   ,
     }
     */
    
    var backgroundImgOptions = {
         'imageSrc' : 'static/images/SaveTheIslandBackGround3.png', 
         'x' : 0,          
         'y' : 0,       
         'width' : self.backGroundWidth, 
         'height' : self.backGroundHeight,
         'loadedCallback' : imageLoadedCallback
    }
    
    var player1StandingSpriteOptions = {
      'imageSrc' : self.player1SpriteSheet,
      'sourceX' : self.player1StandingSpriteSheetX,
      'sourceY' : self.player1StandingSpriteSheetY,
      'x' : self.player1PositionX,
      'y' : self.player1PositionY,
      'width' : self.robotWidth,
      'height' : self.robotHeight,
      'loadedCallback' : imageLoadedCallback
    }

    var player2StandingSpriteOptions = {
        'imageSrc' : self.player2SpriteSheet,
        'sourceX' : self.player2StandingSpriteSheetX,
        'sourceY' : self.player2StandingSpriteSheetY,
        'x' : self.player2PositionX,
        'y' : self.player2PositionY,
        'width' : self.robotWidth,
        'height' : self.robotHeight,
        'loadedCallback' : imageLoadedCallback
      }
    
    var player1RunningSpriteOptions = {
        'imageSrc' : 'static/images/RunningRight.png',
        'sourceX' : 0,
        'sourceY' : self.player1StandingSpriteSheetY,
        'sourceWidth' : 592,
        'x' : self.player1PositionX,
        'y' : self.player1PositionY,
        'width' : 74,
        'height' : self.robotHeight,
        'ticksPerFrame' : 8, 
        'numberOfFrames' : 8,
        'loop' : true, 
        'visible' : false,
        'loadedCallback' : imageLoadedCallback
      }
    
    var player2RunningSpriteOptions = {
        'imageSrc' : 'static/images/RunningLeft.png',
        'sourceX' : 0,
        'sourceY' : self.player2StandingSpriteSheetY,
        'sourceWidth' : 592,
        'x' : self.player2PositionX,
        'y' : self.player2PositionY,
        'width' : 74,
        'height' : self.robotHeight,
        'ticksPerFrame' : 8, 
        'numberOfFrames' : 8,
        'loop' : true, 
        'visible' : false,
        'loadedCallback' : imageLoadedCallback
      }
    
    var player1BlockingSpriteOptions = {
        'imageSrc' : 'static/images/BlockingRight.png',
        'sourceX' : 0,
        'sourceY' : self.player1StandingSpriteSheetY,
        'sourceWidth' : 518,
        'x' : self.player1PositionX,
        'y' : self.player1PositionY,
        'width' : 74,
        'height' : self.robotHeight,
        'ticksPerFrame' : 8, 
        'numberOfFrames' : 7,
        'loop' : false, 
        'visible' : false,
        'loadedCallback' : imageLoadedCallback
      }
    
    var player2BlockingSpriteOptions = {
        'imageSrc' : 'static/images/BlockingLeft.png',
        'sourceX' : 0,
        'sourceY' : self.player2StandingSpriteSheetY,
        'sourceWidth' : 518,
        'x' : self.player2PositionX,
        'y' : self.player2PositionY,
        'width' : 74,
        'height' : self.robotHeight,
        'ticksPerFrame' : 8, 
        'numberOfFrames' : 7,
        'loop' : false, 
        'visible' : false,
        'loadedCallback' : imageLoadedCallback
      }
    
    this.drawableObjects = {
      backgroundImg : new drawableSprite(backgroundImgOptions),
      player1 : new drawableSprite(player1StandingSpriteOptions),
      player2 : new drawableSprite(player2StandingSpriteOptions),
      player1Running : new drawableSprite(player1RunningSpriteOptions),
      player2Running : new drawableSprite(player2RunningSpriteOptions),
      player1Blocking : new drawableSprite(player1BlockingSpriteOptions),
      player2Blocking : new drawableSprite(player2BlockingSpriteOptions)
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
    
    
    function makeNewTree(x, y) {
      return {
        'imageSrc' : 'static/images/tree.png',
        'sourceX' : 0,
        'sourceY' : 0,
        'sourceWidth' : 32,
        'sourceHeight' : 49,
        'x' : x,
        'y' : y,
        'width' : 20,
        'height' : 20,
        'loadedCallback' : imageLoadedCallback
      }
    }
    var treeSpriteDefaultsOptions = 
      this.backgroundElements = {
        trees1 : {
          tree1 : new drawableImage(makeNewTree(10, 110)),
          tree2 : new drawableImage(makeNewTree(75, 100)),
        },
        trees2 : {
            tree3 : new drawableImage(makeNewTree(150, 154)),
            tree4 : new drawableImage(makeNewTree(250, 160)),
            tree5 : new drawableImage(makeNewTree(350, 125)),
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