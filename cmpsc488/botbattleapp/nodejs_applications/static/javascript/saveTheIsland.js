function appendArrayOfDivsToHtmlElementById(id, contentArray) {
  for (var i = 0; i < contentArray.length; i++) {
    appendDivToHtmlElementById(id, contentArray[i]);
  }
}

function appendDivToHtmlElementById(id, content) {
  //Add debugging data to the page
  var element =  document.getElementById(id);
  var html = [];
  html.push(element.innerHTML);
  html.push('<div>' + content + '</div>');
  element.innerHTML = html.join('');
  element.scrollTop = element.scrollHeight;
}

GAME = {
    'processGameData' : function(gameData, processGameDataCallback) {
      // Add tiles and turn description to the page
      appendDivToHtmlElementById('moveList', gameData.turnDescription);
      this.gameboard.player1Tiles = gameData.player1Tiles;
      this.gameboard.player2Tiles = gameData.player2Tiles;
      //this.drawer.drawPlayerTiles(gameData.player1Tiles, gameData.player2Tiles);
      processGameDataCallback();
    },

    'processDebugData' : function(debugData, processDebugDataCallback) {
      //Add debugging data to the page
      appendArrayOfDivsToHtmlElementById('stdout', debugData.stdout);
      appendArrayOfDivsToHtmlElementById('stderr', debugData.stderr);
      processDebugDataCallback();
    },
    
    'processAnimatableEvent' : function(animatableEvent, processAnimatableEventCallback) {
      // Take an object past in the animatableEvents array from the game manager
      //    and animate it on the canvas.
      //    Each animatableEvent has an 'event' property naming the event
      //    and a 'data' object containing any necessary information for the animation
      animations[animatableEvent.event](animatableEvent.data, processAnimatableEventCallback);
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
        readyCallback();
      });
    }
}
  var animations = {
      move : function(eventData, processAnimatableEventCallback) {
        // Setup any variables needed for the animation
        var finalPosition = (eventData.finalPosition * GAME.gameboard.gridWidth) + GAME.gameboard.islandStart;
        var pixelsPerSecond = GAME.gameboard.islandWidth * 0.183908046; // 0.183908046 is 160/870
        var player = GAME.gameboard.playerAnimations[eventData.objectName];
        player.standing.visible = false;
        player.move.visible = true;
        player.current = player.move;
        var startTime = (new Date()).getTime();
        
        // Immediately invoke this loop that will run until the animation is complete, then call the callback
        (function moveLoop(lastUpdateTime) {
          var currentTime = TEST_ARENA.animationHelpers.updateXPositionLinearlyWithTime(player.current, finalPosition, lastUpdateTime, pixelsPerSecond) 
          
          var done = player.current.x === finalPosition;
           
          if (!done) {
            requestAnimFrame(function() {
              moveLoop(currentTime);
            });
          } 
          else {   // maybe make just current instead of changing visible...
            player.move.visible = false;
            player.standing.visible = true;
            player.current = player.standing;
            player.current.x = player.move.x;
            player.current.y = player.move.y;
            processAnimatableEventCallback();
          }
        })(startTime);
      },
      successfulAttack : function(eventData, processAnimatableEventCallback) {

      },
      defendedAttack : function(eventData, processAnimatableEventCallback) {
        // Perform the initial move to the attack position.
        animations.move({'objectName' : eventData.attacker, 'finalPosition' : eventData.attackerAttackPosition}, function() {
          // Setup any variables needed for the defend animation
          var defendingPlayer = GAME.gameboard.playerAnimations[eventData.defender];
          var attackingPlayer = GAME.gameboard.playerAnimations[eventData.attacker];
          // Set current state and position of defending player

          // in the future -- position changes like this need to be based on the grid position then shifted so the "winner" isn't messed up anymore
          defendingPlayer.defend.x = defendingPlayer.standing.x - ((defendingPlayer.defend.width * TEST_ARENA.scale)/2) + GAME.gameboard.gridCenter;
          defendingPlayer.defend.y = defendingPlayer.standing.y;  
          defendingPlayer.standing.visible = false;
          defendingPlayer.defend.visible = true;
          defendingPlayer.current = defendingPlayer.defend;
          
          // Set current state and position of attacking player
          attackingPlayer.attack.x = attackingPlayer.standing.x - ((attackingPlayer.attack.width * TEST_ARENA.scale)/2) + GAME.gameboard.gridCenter;
          attackingPlayer.attack.y = attackingPlayer.standing.y;  
          attackingPlayer.standing.visible = false;
          attackingPlayer.attack.visible = true;
          attackingPlayer.current = attackingPlayer.attack;
          
          // Immediately invoke this loop that will run until the animation is complete, then call the callback
          (function defendedAttackLoop() {
            if (!(defendingPlayer.defend.done && attackingPlayer.attack.done)) {
              requestAnimFrame(function() {
                defendedAttackLoop();
              });
            } 
            else {   // maybe make just current instead of changing visible...
              defendingPlayer.defend.done = false;
              
              defendingPlayer.defend.visible = false;
              defendingPlayer.standing.visible = true;
                
              attackingPlayer.attack.done = false;
              attackingPlayer.attack.visible = false;
              attackingPlayer.standing.visible = true;
              
              // Now move the attacker back to where they started, pass along the callback to finally be called after the move is done
              animations.move({'objectName' : eventData.attacker, 'finalPosition' : eventData.attackerStartingPosition}, processAnimatableEventCallback);
            }
          })();
        });
      },
      died : function(eventData, processAnimatableEventCallback) {

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
    drawPlayerTiles();
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
  
  var drawPlayerTiles = function() {
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

    //  probably move tileParameters to gameBoard.
    //  Maybe we actually want to move all hardcoded canvas pixel related stuff to the drawer
    var tileParameters = {
        'player1StartingX' : 50,
        'player2StartingX' : 700,
        'y' : 550,
        'width' : 50,
        'height' : 50,
        'fillStyle' : '#FFFFD1',
    }
    
    function drawTileArray(tileArray, startingX) {
      for (var i = 0; i < tileArray.length; i++) {
        var currentX = (startingX + (50* i));
        (new drawableRectangle({ 
          x: currentX * TEST_ARENA.scale, 
          y: tileParameters.y * TEST_ARENA.scale,
          width: tileParameters.width * TEST_ARENA.scale,
          height: tileParameters.height * TEST_ARENA.scale,
          fillStyle: tileParameters.fillStyle,
        })).draw(TEST_ARENA.context);
        
        // TODO: Make drawableText object instead of copying this everywhere
        var fontSize = 30 * TEST_ARENA.scale;
        TEST_ARENA.context.font= fontSize + 'px Arial';
        TEST_ARENA.context.fillStyle="black";
        TEST_ARENA.context.fillText(tileArray[i], (currentX + 17) * TEST_ARENA.scale , (tileParameters.y + 35) * TEST_ARENA.scale );
      }
    }
    
    drawTileArray(GAME.gameboard.player1Tiles, tileParameters.player1StartingX); 
    drawTileArray(GAME.gameboard.player2Tiles, tileParameters.player2StartingX); 
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
    
    var player1AttackingSpriteOptions = {
        'imageSrc' : 'static/images/ShootingRight.png',
        'sourceX' : 0,
        'sourceY' : self.player1StandingSpriteSheetY,
        'sourceWidth' : 360,
        'x' : self.player1PositionX,
        'y' : self.player1PositionY,
        'width' : 90,
        'height' : self.robotHeight,
        'ticksPerFrame' : 12, 
        'numberOfFrames' : 4,
        'loop' : false, 
        'visible' : false,
        'loadedCallback' : imageLoadedCallback
      }
    
    var player2AttackingSpriteOptions = {
        'imageSrc' : 'static/images/ShootingLeft.png',
        'sourceX' : 0,
        'sourceY' : self.player2StandingSpriteSheetY,
        'sourceWidth' : 360,
        'x' : self.player2PositionX,
        'y' : self.player2PositionY,
        'width' : 90,
        'height' : self.robotHeight,
        'ticksPerFrame' : 12, 
        'numberOfFrames' : 4,
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
      player2Blocking : new drawableSprite(player2BlockingSpriteOptions),
      player1Attacking : new drawableSprite(player1AttackingSpriteOptions),
      player2Attacking : new drawableSprite(player2AttackingSpriteOptions),
    }
    
    this.player1Tiles = [0,0,0,0,0];
    this.player2Tiles = [0,0,0,0,0];
    
    this.playerAnimations = {
        player1 : {
            current : self.drawableObjects.player1,
            standing : self.drawableObjects.player1,
            move : self.drawableObjects.player1Running,
            attack : self.drawableObjects.player1Attacking,
            defend : self.drawableObjects.player1Blocking,
            //hit : "player1Falling",
            //lose : "player1Lost"
        },
        player2 : {
            current : self.drawableObjects.player2,
            standing : self.drawableObjects.player2,
            move : self.drawableObjects.player2Running,
            attack : self.drawableObjects.player2Attacking,
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