

GAME = {
    'processGameData' : function(gameData, processGameDataCallback) {
      // Add tiles and turn description to the page
      GLOBAL.appendDivToHtmlElementById('moveList', gameData.turnDescription);
      this.gameboard.player1Tiles = gameData.player1Tiles;
      this.gameboard.player2Tiles = gameData.player2Tiles;
      //this.drawer.drawPlayerTiles(gameData.player1Tiles, gameData.player2Tiles);
      processGameDataCallback();
    },

    'processDebugData' : function(debugData, processDebugDataCallback) {
      //Add debugging data to the page
      GLOBAL.appendArrayOfDivsToHtmlElementById('stdout', debugData.stdout);
      GLOBAL.appendArrayOfDivsToHtmlElementById('stderr', debugData.stderr);
      processDebugDataCallback();
    },
    
    'processAnimatableEvent' : function(animatableEvent, processAnimatableEventCallback) {
      // Take an object past in the animatableEvents array from the game manager
      //    and animate it on the canvas.
      //    Each animatableEvent has an 'event' property naming the event
      //    and a 'data' object containing any necessary information for the animation
      var validEvents = ['move', 'fallback', 'successfulAttack', 'defendedAttack'];
      if (validEvents.indexOf(animatableEvent.event) == -1) {
        processAnimatableEventCallback(new Error("Invalid animatable event type"));
      }
      else {
        animations[animatableEvent.event](animatableEvent.data, processAnimatableEventCallback);
      }
    },
    
    // Run each time the drawer draws?
    'updateBackground' : function(startTime) {
      
      //requestAnimationFrame(self.backgroundAnimations);
      //drawer.drawBoard();
      var treeMove = 1;
      treeMove *= -1;
      // TODO  this is all messed up now but still pointless
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
    'setHumanInputElements' : function() { 
      var form = document.getElementById("humanInputForm");
      for (var i = 0; i < this.gameboard.player2Tiles.length; i++) {
        var temp = document.getElementById(("player2Tile" + i).toString())
        if(temp === null){
          var input = document.createElement("input");
          input.type = "checkbox";
          input.name = "player2Tile" + i;
          input.value = this.gameboard.player2Tiles[i];
          input.id = "player2Tile" + i;
          form.appendChild(input); 
          var text = document.createTextNode(" " + this.gameboard.player2Tiles[i]);
          form.appendChild(text);
          form.appendChild(document.createElement("br"));
        }
      }
      temp = document.getElementById("rightButton")
      if(temp === null){
        var input = document.createElement("input");
        input.type = "radio";
        input.name = "direction";
        input.value = "right";
        input.id = "rightButton";
        form.appendChild(input); 
        var text = document.createTextNode("right");
        form.appendChild(text);
      }
      temp = document.getElementById("leftButton")
      if(temp === null){
        var input = document.createElement("input");
        input.type = "radio";
        input.name = "direction";
        input.value = "left";
        input.id = "leftButton";
        form.appendChild(input); 
        var text = document.createTextNode("left");
        form.appendChild(text);
      }
    },
    'getMoveFromHumanInputElements' : function() {
      var data;// = new FormData(document.forms.namedItem("humanInputForm"));
      $.fn.serializeObject = function()
      {
          var o = {};
          var a = this.serializeArray();
          $.each(a, function() {
              if (o[this.name] !== undefined) {
                  if (!o[this.name].push) {
                      o[this.name] = [o[this.name]];
                  }
                  o[this.name].push(this.value || '');
              } else {
                  o[this.name] = this.value || '';
              }
          });
          return o;
      };
      data = (JSON.stringify($('form[name="humanInputForm"]').serializeObject()));
      //TODO: Figure out move format with Randall
      return data;
    },
    'resetGameboard' : function(readyCallback) {
      var gb = new GameBoard();
      // TODO: Add err argument if they can occur
      gb.loadResources(function() {
        GAME.gameboard = gb;
        readyCallback();
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
  var updateXPositionLinearlyWithTime = function(drawableObject, endingX, lastUpdateTime, speed) {
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
    */

  var animations = {
      move : function(eventData, processAnimatableEventCallback) {
        // Setup any variables needed for the animation
        var finalPosition = (eventData.finalPosition * GAME.gameboard.gridWidth) + GAME.gameboard.islandStart;
        var pixelsPerSecond = GAME.gameboard.islandWidth * 0.183908046; // 0.183908046 is 160/870  should be changed to be based on island width
        var player = GAME.gameboard.playerAnimations[eventData.objectName];
        player.standing.visible = false;
        if(eventData.animation){
          eventData.animation.visible = true;
          player.current = eventData.animation;
          player.current.x = player.standing.x;
          player.current.y = player.standing.y;
        }
        else{
          player.move.visible = true;
          player.current = player.move;
        }
        var startTime = (new Date()).getTime();
        
        // Immediately invoke this loop that will run until the animation is complete, then call the callback
        (function moveLoop(lastUpdateTime) {
          var currentTime = updateXPositionLinearlyWithTime(player.current, finalPosition, lastUpdateTime, pixelsPerSecond) 
          
          var done = player.current.x === finalPosition;
           
          if (!done) {
            requestAnimFrame(function() {
              moveLoop(currentTime);
            });
          } 
          else {   // maybe make just current instead of changing visible...
            player.current = player.standing;
            if(eventData.animation){
              eventData.animation.visible = false;
              player.current.x = eventData.animation.x;
              player.current.y = eventData.animation.y;
            }
            else{
              player.move.visible = false;
              player.current.x = player.move.x;
              player.current.y = player.move.y;
            }
            player.standing.visible = true;
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
          //TODO  change this so it is based on grid positions. And above and everywhere else too.
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
              animations.move({'objectName' : eventData.attacker, 'finalPosition' : eventData.attackerStartingPosition, 'animation' : attackingPlayer.fallingBack}, processAnimatableEventCallback);
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
  
  this.drawBoard = function() {
	  
	//GAME.updateBackground();
    
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
      //var player1PositionY = GAME.gameboard.playerAnimations["player1"].current.y;
      var player2PositionX = GAME.gameboard.playerAnimations["player2"].current.x;
      //var player2PositionY = GAME.gameboard.playerAnimations["player2"].current.y;
      
      //  TODO wanted to update so its based on grid position, but can't becuase it's constant update.
      //  could save lots of computations if only update when player is done moving and based on 
      //  player position that is stored in player.  This wouldn't look as cool, but is way less error prone
      //  and less processing.  Also this Math.floor is causeing problems here and below.
      var p1Grid = Math.floor((player1PositionX - GAME.gameboard.islandStart)/ GAME.gameboard.gridWidth);
      var p2Grid = Math.floor((player2PositionX - GAME.gameboard.islandStart)/ GAME.gameboard.gridWidth);
      //console.log(p1Grid, p2Grid);
      var distanceBetweenPlayers = Math.abs(p1Grid - p2Grid);
      
      TEST_ARENA.context.font= 30  * TEST_ARENA.scale + 'px Arial';
      TEST_ARENA.context.fillStyle="black";
      
      // TODO  fix this like above mentions
      if((p1Grid >= 0 && p1Grid <= GAME.gameboard.numberOfGrids - 1) && (p2Grid >= 0 && p2Grid <= GAME.gameboard.numberOfGrids - 1)){
        TEST_ARENA.context.fillText(Math.floor(distanceBetweenPlayers), 500 * TEST_ARENA.scale, 550 * TEST_ARENA.scale);
      }
      else{
          if(p1Grid < 0){
            TEST_ARENA.context.fillText("Player 2 Wins", 405 * TEST_ARENA.scale, 550 * TEST_ARENA.scale);
          }
          if(p2Grid > GAME.gameboard.numberOfGrids - 1){
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
        'player2StartingX' : 750,
        'y' : 570,
        'width' : 50,
        'height' : 50,
        'fillStyle' : '#FFFFD1',
    }
    
    function drawTileArray(tileArray, startingX) { 
      // TODO overhaul this.  Essentially, a groupd of drawable images should be made that are static and
      //      the numbers should be changed like they are changed in the draw numbers fuction so there is not
      //      a new drawableRectangle made each time and just the .draw function can be called and we can even
      //      have a fixed tile image to look better.
      for (var i = 0; i < tileArray.length; i++) {
        var currentX = (startingX + (50* i));
        
        (new drawableRectangle({ 
          x: currentX, 
          y: tileParameters.y,
          width: tileParameters.width,
          height: tileParameters.height,
          fillStyle: tileParameters.fillStyle,
        })).draw(TEST_ARENA.context);
        
        // TODO: Make drawableText object instead of copying this everywhere
        TEST_ARENA.context.font= 30  * TEST_ARENA.scale + 'px Arial';
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
  
  var self = this;
  
  this.backGroundWidth = 1050;
  this.backGroundHeight = 650;
  this.islandWidth = self.backGroundWidth;
  this.islandStart = 0; 
  this.islandCenterHeight = 468;
  this.robotHeight = 101;
  this.numberOfGrids = 15;
  this.gridWidth = self.islandWidth/self.numberOfGrids;
  this.robotWidth = self.gridWidth;
  this.gridCenter = self.gridWidth/2;
  this.player1StartX = (0 * self.gridWidth);// + self.islandStart;// - (self.robotWidth/2) + self.gridCenter;
  this.player2StartX = ((self.numberOfGrids - 1) * self.gridWidth);// + self.islandStart;// - (self.robotWidth/2) + self.gridCenter;
  this.player1StartY = self.islandCenterHeight - self.robotHeight;
  this.player2StartY = self.islandCenterHeight - self.robotHeight;  
  this.player1PositionX = self.player1StartX;
  this.player1PositionY = self.player1StartY;
  this.player2PositionX = self.player2StartX;
  this.player2PositionY = self.player2StartY;
  
  context.font= 30  * TEST_ARENA.scale + 'px Arial';
  context.fillStyle="black";
  context.fillText("Loading...", self.backGroundWidth/3 * TEST_ARENA.scale, self.backGroundHeight/2 * TEST_ARENA.scale); 
  
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
      'imageSrc' : 'static/images/StandingRight.png',
      'sourceX' : 0,
      'sourceY' : 0,
      'sourceHeight' : 101,
      'sourceWidth' : 296,
      'x' : self.player1PositionX,
      'y' : self.player1PositionY,
      'width' : self.robotWidth, 
      'height' : self.robotHeight,
      'ticksPerFrame' : 60, 
      'numberOfFrames' : 4,
      'loop' : true, 
      'visible' : true,
      'loadedCallback' : imageLoadedCallback
    }

    var player2StandingSpriteOptions = {
        'imageSrc' : 'static/images/StandingLeft.png',
        'sourceX' : 0,
        'sourceY' : 0,
        'sourceHeight' : 101,
        'sourceWidth' : 296,
        'x' : self.player2PositionX,
        'y' : self.player2PositionY,
        'width' : self.robotWidth,
        'height' : self.robotHeight,
        'ticksPerFrame' : 60, 
        'numberOfFrames' : 4,
        'loop' : true, 
        'visible' : true,
        'loadedCallback' : imageLoadedCallback
      }
    
    var player1RunningSpriteOptions = {
        'imageSrc' : 'static/images/RunningRight.png',
        'sourceX' : 0,
        'sourceY' : 0,
        'sourceHeight' : 101,
        'sourceWidth' : 592,
        'x' : self.player1PositionX,
        'y' : self.player1PositionY,
        'width' : self.robotWidth, 
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
        'sourceY' : 0,
        'sourceHeight' : 101,
        'sourceWidth' : 592,
        'x' : self.player2PositionX,
        'y' : self.player2PositionY,
        'width' : self.robotWidth, 
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
        'sourceY' : 0,
        'sourceHeight' : 101,
        'sourceWidth' : 518,
        'x' : self.player1PositionX,
        'y' : self.player1PositionY,
        'width' : self.robotWidth, 
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
        'sourceY' : 0,
        'sourceHeight' : 101,
        'sourceWidth' : 518,
        'x' : self.player2PositionX,
        'y' : self.player2PositionY,
        'width' : self.robotWidth, 
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
        'sourceY' : 0,
        'sourceHeight' : 101,
        'sourceWidth' : 360,
        'x' : self.player1PositionX,
        'y' : self.player1PositionY,
        'width' : self.robotWidth,
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
        'sourceY' : 0,
        'sourceHeight' : 101,
        'sourceWidth' : 360,
        'x' : self.player2PositionX,
        'y' : self.player2PositionY,
        'width' : self.robotWidth,
        'height' : self.robotHeight,
        'ticksPerFrame' : 12, 
        'numberOfFrames' : 4,
        'loop' : false, 
        'visible' : false,
        'loadedCallback' : imageLoadedCallback
      }
    
    var player1FallingSpriteOptions = {
        'imageSrc' : 'static/images/FallingRight.png',
        'sourceX' : 0,
        'sourceY' : 0,
        'sourceHeight' : 101,
        'sourceWidth' : 74,
        'x' : self.player1PositionX,
        'y' : self.player1PositionY,
        'width' : self.robotWidth, 
        'height' : self.robotHeight,
        'ticksPerFrame' : 1, 
        'numberOfFrames' : 1,
        'loop' : false, 
        'visible' : false,
        'loadedCallback' : imageLoadedCallback
      }
    
    var player2FallingSpriteOptions = {
        'imageSrc' : 'static/images/FallingLeft.png',
        'sourceX' : 0,
        'sourceY' : 0,
        'sourceHeight' : 101,
        'sourceWidth' : 74,
        'x' : self.player1PositionX,
        'y' : self.player1PositionY,
        'width' : self.robotWidth, 
        'height' : self.robotHeight,
        'ticksPerFrame' : 1, 
        'numberOfFrames' : 1,
        'loop' : false, 
        'visible' : false,
        'loadedCallback' : imageLoadedCallback
      }
    
    this.drawableObjects = {
      backgroundImg : new drawableImage(backgroundImgOptions),
      player1 : new drawableSprite(player1StandingSpriteOptions),
      player2 : new drawableSprite(player2StandingSpriteOptions),
      player1Running : new drawableSprite(player1RunningSpriteOptions),
      player2Running : new drawableSprite(player2RunningSpriteOptions),
      player1Blocking : new drawableSprite(player1BlockingSpriteOptions),
      player2Blocking : new drawableSprite(player2BlockingSpriteOptions),
      player1Attacking : new drawableSprite(player1AttackingSpriteOptions),
      player2Attacking : new drawableSprite(player2AttackingSpriteOptions),
      player1Falling : new drawableSprite(player1FallingSpriteOptions),
      player2Falling : new drawableSprite(player2FallingSpriteOptions)
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
            fallingBack : self.drawableObjects.player1Falling
            //lose : "player1Lost"
        },
        player2 : {
            current : self.drawableObjects.player2,
            standing : self.drawableObjects.player2,
            move : self.drawableObjects.player2Running,
            attack : self.drawableObjects.player2Attacking,
            defend : self.drawableObjects.player2Blocking,
            fallingBack : self.drawableObjects.player2Falling
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
        'visible' : true,
        'loadedCallback' : imageLoadedCallback
      }
    }
    
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
      
      var imagesLoaded= 0, expectedImagesLoaded=16;
      function imageLoadedCallback() {
        imagesLoaded++;
        if (imagesLoaded == expectedImagesLoaded) {
          callback();
        }
      }
  }
}
