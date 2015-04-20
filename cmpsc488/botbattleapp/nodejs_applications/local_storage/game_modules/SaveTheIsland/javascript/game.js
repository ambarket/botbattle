

GAME = {
    'processGameData' : function(messageType, gameData, processGameDataCallback) {
      // Add tiles and turn description to the page
      GLOBAL.appendDivToHtmlElementById('moveList', gameData.turnDescription);
      this.gameboard.player1Tiles = gameData.player1Tiles;
      this.gameboard.player2Tiles = gameData.player2Tiles;
      if (messageType === 'finalGamestate' || messageType === 'initialGamestate') {
        GLOBAL.eventLog.logMessage('status', gameData.turnDescription);
      }
      processGameDataCallback();
    },
    'processDebugData' : function(messageType, debugData, processDebugDataCallback) {
      //Add debugging data to the page
      GLOBAL.appendDivToHtmlElementById('boardList', debugData.board);
      GLOBAL.appendDivToHtmlElementById('stdout', debugData.stdout);
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
    'drawBoard' : function() {
      (new Drawer()).drawBoard();
    },       
    'setHumanInputElements' : function() { 
      var form = document.createElement('FORM');
      form.name = "humanInputForm";
      for (var i = 0; i < this.gameboard.player2Tiles.length; i++) {
          var input = document.createElement("input");
          input.type = "checkbox";
          input.name = "player2Tile";// + i;
          input.value = this.gameboard.player2Tiles[i];
          input.id = "player2Tile" + i;
          form.appendChild(input); 
          var text = document.createTextNode(" " + this.gameboard.player2Tiles[i]);
          form.appendChild(text);
          form.appendChild(document.createElement("br"));
      }

      var input = document.createElement("input");
      input.type = "radio";
      input.name = "moveType";
      input.value = "retreat";
      input.id = "retreatButton";
      form.appendChild(input); 
      var text = document.createTextNode("retreat");
      form.appendChild(text);
      
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "moveType";
      input.value = "move";
      input.id = "moveButton";
      form.appendChild(input); 
      var text = document.createTextNode("move");
      form.appendChild(text);
      
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "moveType";
      input.value = "attack";
      input.id = "attackButton";
      form.appendChild(input); 
      var text = document.createTextNode("attack");
      form.appendChild(text);
      
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "moveType";
      input.value = "shuffle";
      input.id = "shuffleButton";
      form.appendChild(input); 
      var text = document.createTextNode("shuffle");
      form.appendChild(text);
      
      document.getElementById("humanInputElements").appendChild(form);
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
      data = $('form[name="humanInputForm"]').serializeObject();
      console.log("humanInputForm",data);
      var move = "";
      move += data.moveType;
      
      if (data.moveType !== 'shuffle') {
        move += ";";
        if (Array.isArray(data.player2Tile)) {
          for (var tile in data.player2Tile) {
            move += data.player2Tile[tile];
          }
        }
        else {
          move += data.player2Tile;
        }
      }

      return move;
    },
    'setExtraGameControls' : function() { 
      if(TEST_ARENA.state === 'gameStarted') {
        if (document.getElementById("toggleTiles") === null){
          var button = document.createElement('BUTTON');
          button.id = "toggleTiles";
          button.innerHTML = "Toggle Tiles";
          document.getElementById("extraGameControls").appendChild(button);
          document.getElementById("toggleTiles").addEventListener('click', function(ev) {
            GAME.toggleTiles();
            console.log("Tiles Toggled");
          });
        }
      }
      else {
        document.getElementById("extraGameControls").innerHTML = "";
      }
    },
    'drawTiles' : true,
    'toggleTiles' : function(){
      GAME.drawTiles = !GAME.drawTiles;
    },
    'gameboard' : null,
    'resetGameboard' : function(readyCallback) {
      var gb = new GameBoard();
      // TODO: Add err argument if they can occur
      gb.loadResources(function() {
        GAME.gameboard = gb;
        readyCallback();
      });
    }
}

  var updateBackground = function(startTime) {
    GAME.gameboard.ufo.animate();
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
        var finalPosition = (eventData.endPosition * GAME.gameboard.gridWidth) + GAME.gameboard.islandStart;
        eventData.player === 'player1' ? GAME.player1GridPosition = eventData.endPosition : GAME.player2GridPosition = eventData.endPosition
        var pixelsPerSecond = GAME.gameboard.islandWidth * 0.183908046; // 0.183908046 is 160/870  should be changed to be based on island width
        var player = GAME.gameboard.playerAnimations[eventData.player];
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
          var currentTime = updateXPositionLinearlyWithTime(player.current, finalPosition, lastUpdateTime, pixelsPerSecond);
          
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
              player.move.x = eventData.animation.x;
              player.move.y = eventData.animation.y;
            }
            else{
              player.move.visible = false;
              player.current.x = player.move.x;
              player.current.y = player.move.y;
              player.fallback.x = player.move.x;
              player.fallback.y = player.move.y;
            }
            player.standing.visible = true;
            processAnimatableEventCallback();
          }
        })(startTime);
      },
      fallback : function(eventData, processAnimatableEventCallback){
        var player = GAME.gameboard.playerAnimations[eventData.player];
        eventData.animation = player.fallback;
        animations.move(eventData, processAnimatableEventCallback);
      },
      successfulAttack : function(eventData, processAnimatableEventCallback) {
        // eventData.player is always attacking player
        // Setup any variables needed for the defend animation
        var attackingPlayer = GAME.gameboard.playerAnimations[eventData.player];
        
        // Set current state and position of attacking player
        //TODO  change this so it is based on grid positions. And above and everywhere else too.
        attackingPlayer.attack.x = attackingPlayer.standing.x - ((attackingPlayer.attack.width * TEST_ARENA.scale)/2) + GAME.gameboard.gridCenter * TEST_ARENA.scale;
        if(eventData.player === "player2")
          attackingPlayer.attack.x -= (TEST_ARENA.scale * 30);
        attackingPlayer.attack.y = attackingPlayer.standing.y;  
        attackingPlayer.standing.visible = false;
        attackingPlayer.attack.visible = true;
        attackingPlayer.current = attackingPlayer.attack;
        
        // Immediately invoke this loop that will run until the animation is complete, then call the callback
        (function AttackLoop() {
          if (!attackingPlayer.attack.done) {
            requestAnimFrame(function() {
              AttackLoop();
            });
          } 
          else {                
            attackingPlayer.attack.done = false;
            attackingPlayer.attack.visible = false;
            attackingPlayer.standing.visible = true;  
            processAnimatableEventCallback();
          }
        })();
      },
      defendedAttack : function(eventData, processAnimatableEventCallback) {
          // Setup any variables needed for the defend animation
          var attackingPlayer = GAME.gameboard.playerAnimations[eventData.player];
          if(eventData.player === "player1"){
            var defendingPlayer = GAME.gameboard.playerAnimations["player2"];
          }
          else{
            var defendingPlayer = GAME.gameboard.playerAnimations["player1"];
          }
          // Set current state and position of defending player

          // in the future -- position changes like this need to be based on the grid position then shifted so the "winner" isn't messed up anymore
          defendingPlayer.defend.x = defendingPlayer.standing.x - ((defendingPlayer.defend.width * TEST_ARENA.scale)/2) + GAME.gameboard.gridCenter * TEST_ARENA.scale;
          defendingPlayer.defend.y = defendingPlayer.standing.y;  
          defendingPlayer.standing.visible = false;
          defendingPlayer.defend.visible = true;
          defendingPlayer.current = defendingPlayer.defend;
          
          // Set current state and position of attacking player
          //TODO  change this so it is based on grid positions. And above and everywhere else too.
          attackingPlayer.attack.x = attackingPlayer.standing.x - ((attackingPlayer.attack.width * TEST_ARENA.scale)/2) + GAME.gameboard.gridCenter * TEST_ARENA.scale;
          if(eventData.player === "player1")
            attackingPlayer.attack.x -= (TEST_ARENA.scale * 25);
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
              processAnimatableEventCallback();
           }
          })();
      }
    };

//--------------------------The Drawer (View)------------------------------------
function Drawer() {
  if ( arguments.callee._singletonInstance )
    return arguments.callee._singletonInstance;
  arguments.callee._singletonInstance = this;
  
  var self = this;
  
  // The order in which things appear here matter.  Think of it as z-index.  They will draw over each other of 
  // the coordinates are the same. First is farthest back on the buffer.
  this.drawBoard = function() {
    
    for (object in GAME.gameboard.drawableObjects) {
      GAME.gameboard.drawableObjects[object].draw(TEST_ARENA.context);
    }
    
    for (list in GAME.gameboard.backgroundElements){
        for(object in GAME.gameboard.backgroundElements[list]){
            GAME.gameboard.backgroundElements[list][object].draw(TEST_ARENA.context);
        }
    }
    
    // set to draw in the function
    updateBackground();
    
    drawGridNumbers();
    
    if(GAME.drawTiles === true){
      drawPlayerTiles();
    }
  }
  
  var drawGridNumbers = function(){
      var player1PositionX = GAME.gameboard.playerAnimations["player1"].current.x + GAME.gameboard.playerAnimations["player1"].current.width / 2;
      var player2PositionX = GAME.gameboard.playerAnimations["player2"].current.x + GAME.gameboard.playerAnimations["player2"].current.width / 2;
      var p1CalcGrid = Math.floor((player1PositionX - GAME.gameboard.islandStart)/ GAME.gameboard.gridWidth);
      var p2CalcGrid = Math.floor((player2PositionX - GAME.gameboard.islandStart)/ GAME.gameboard.gridWidth);
      var lessAccurateDistanceBetweenPlayers = p2CalcGrid - p1CalcGrid;
      
      //var finalPosition1 = GAME.player1GridPosition;
      //var finalPosition2 = GAME.player2GridPosition;
      //var distanceBetweenPlayers = finalPosition2 - finalPosition1;
      TEST_ARENA.context.font= 30  * TEST_ARENA.scale + 'px Arial';
      TEST_ARENA.context.fillStyle="black";
      
      if((p1CalcGrid >= 0 && p1CalcGrid <= GAME.gameboard.numberOfGrids - 1) && (p2CalcGrid >= 0 && p2CalcGrid <= GAME.gameboard.numberOfGrids - 1)){
       TEST_ARENA.context.fillText(Math.floor(lessAccurateDistanceBetweenPlayers), 500 * TEST_ARENA.scale, 550 * TEST_ARENA.scale);
      }
      else{
        if(p1CalcGrid < 0){
          TEST_ARENA.context.fillText("Player 2 Wins", 405 * TEST_ARENA.scale, 550 * TEST_ARENA.scale);
        }
        if(p2CalcGrid > GAME.gameboard.numberOfGrids - 1){
          TEST_ARENA.context.fillText("Player 1 Wins", 405 * TEST_ARENA.scale, 550 * TEST_ARENA.scale);
        }
      }
  }
 
  var drawPlayerTiles = function() {
    var i = 0;
    var player = GAME.gameboard.player1Tiles;
     for(var tileSet in GAME.gameboard.tiles){
       for(tile in GAME.gameboard.tiles[tileSet]){
         GAME.gameboard.tiles[tileSet][tile].draw(TEST_ARENA.context);
         TEST_ARENA.context.font= 30  * TEST_ARENA.scale + 'px Arial';
         TEST_ARENA.context.fillStyle="black";
         TEST_ARENA.context.fillText(player[i], (GAME.gameboard.tiles[tileSet][tile].x + 17) * TEST_ARENA.scale , (GAME.gameboard.tiles[tileSet][tile].y + 35) * TEST_ARENA.scale );
         i++;
       }
       player = GAME.gameboard.player2Tiles;
       i = 0;
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
         'imageSrc' : 'game/SaveTheIsland/resources/images/SaveTheIslandBackGround3.png', 
         'x' : 0,          
         'y' : 0,       
         'width' : self.backGroundWidth, 
         'height' : self.backGroundHeight,
         'loadedCallback' : imageLoadedCallback
    }
    
    var player1StandingSpriteOptions = {
      'imageSrc' : 'game/SaveTheIsland/resources/images/StandingRight.png',
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
        'imageSrc' : 'game/SaveTheIsland/resources/images/StandingLeft.png',
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
        'imageSrc' : 'game/SaveTheIsland/resources/images/RunningRight.png',
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
        'imageSrc' : 'game/SaveTheIsland/resources/images/RunningLeft.png',
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
        'imageSrc' : 'game/SaveTheIsland/resources/images/BlockingRight.png',
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
        'imageSrc' : 'game/SaveTheIsland/resources/images/BlockingLeft.png',
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
        'imageSrc' : 'game/SaveTheIsland/resources/images/ShootingRight2.png',
        'sourceX' : 0,
        'sourceY' : 0,
        'sourceHeight' : 101,
        'sourceWidth' : 520,
        'x' : self.player1PositionX,
        'y' : self.player1PositionY,
        'width' : 130,
        'height' : self.robotHeight,
        'ticksPerFrame' : 12, 
        'numberOfFrames' : 4,
        'loop' : false, 
        'visible' : false,
        'loadedCallback' : imageLoadedCallback
      }
    
    var player2AttackingSpriteOptions = {
        'imageSrc' : 'game/SaveTheIsland/resources/images/ShootingLeft2.png',
        'sourceX' : 0,
        'sourceY' : 0,
        'sourceHeight' : 101,
        'sourceWidth' : 520,
        'x' : self.player2PositionX,
        'y' : self.player2PositionY,
        'width' : 130,
        'height' : self.robotHeight,
        'ticksPerFrame' : 12, 
        'numberOfFrames' : 4,
        'loop' : false, 
        'visible' : false,
        'loadedCallback' : imageLoadedCallback
      }
    
    var player1FallingSpriteOptions = {
        'imageSrc' : 'game/SaveTheIsland/resources/images/FallingRight.png',
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
        'imageSrc' : 'game/SaveTheIsland/resources/images/FallingLeft.png',
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
    
    this.player1GridPosition = 0;
    this.player2GridPosition = 14;
    
    this.playerAnimations = {
        player1 : {
            current : self.drawableObjects.player1,
            standing : self.drawableObjects.player1,
            move : self.drawableObjects.player1Running,
            attack : self.drawableObjects.player1Attacking,
            defend : self.drawableObjects.player1Blocking,
            fallback : self.drawableObjects.player1Falling
            //lose : "player1Lost"
        },
        player2 : {
            current : self.drawableObjects.player2,
            standing : self.drawableObjects.player2,
            move : self.drawableObjects.player2Running,
            attack : self.drawableObjects.player2Attacking,
            defend : self.drawableObjects.player2Blocking,
            fallback : self.drawableObjects.player2Falling
            //lose : "player2Lost"
        }
  }
    
    /** options
     *  
     *   x: Number
     *   y: number
     *   width:
     *   height:
     *   borderWidth:
     *   fillStyle:
     *   strokeStyle:
     */
    var tileParameters = {
        'player1StartingX' : 50,
        'player2StartingX' : 750,
        'y' : 570,
        'width' : 50,
        'height' : 50,
        'fillStyle' : '#FFFFD1',
    }
    
    function makeNewTile(x, y){
      return {
        'x' : x,
        'y' : y,
        'width' : tileParameters.width,
        'height' : tileParameters.height,
        'fillStyle' : tileParameters.fillStyle,
      }
    }
    this.tiles = {
        player1Tiles : {
          tile1 : new drawableRectangle(makeNewTile(tileParameters.player1StartingX, tileParameters.y)),
          tile2 : new drawableRectangle(makeNewTile(tileParameters.player1StartingX + 50, tileParameters.y)),
          tile3 : new drawableRectangle(makeNewTile(tileParameters.player1StartingX + 100, tileParameters.y)),
          tile4 : new drawableRectangle(makeNewTile(tileParameters.player1StartingX + 150, tileParameters.y)),
          tile5 : new drawableRectangle(makeNewTile(tileParameters.player1StartingX + 200, tileParameters.y))
        },
        player2Tiles : {
          tile1 : new drawableRectangle(makeNewTile(tileParameters.player2StartingX, tileParameters.y)),
          tile2 : new drawableRectangle(makeNewTile(tileParameters.player2StartingX + 50, tileParameters.y)),
          tile3 : new drawableRectangle(makeNewTile(tileParameters.player2StartingX + 100, tileParameters.y)),
          tile4 : new drawableRectangle(makeNewTile(tileParameters.player2StartingX + 150, tileParameters.y)),
          tile5 : new drawableRectangle(makeNewTile(tileParameters.player2StartingX + 200, tileParameters.y))
        }
    }
    
    function makeNewTree(x, y) {
      return {
        'imageSrc' : 'game/SaveTheIsland/resources/images/tree.png',
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
          tree1 : new drawableImage(makeNewTree(50, 125)),
          tree2 : new drawableImage(makeNewTree(75, 105)),
          tree3 : new drawableImage(makeNewTree(150, 154)),
          tree4 : new drawableImage(makeNewTree(250, 160)),
          tree5 : new drawableImage(makeNewTree(350, 125)),
        },
        trees2 : {
          tree1 : new drawableImage(makeNewTree(450, 125)),
          tree2 : new drawableImage(makeNewTree(725, 120)),
          tree3 : new drawableImage(makeNewTree(650, 154)),
          tree4 : new drawableImage(makeNewTree(850, 160)),
          tree5 : new drawableImage(makeNewTree(950, 125)),
        }
      }
    
    this.ufo = new drawableImage({
        'imageSrc' : 'game/SaveTheIsland/resources/images/ufo.png',
        'sourceX' : 0,
        'sourceY' : 0,
        'sourceWidth' : 99,
        'sourceHeight' : 40,
        'x' : -200,
        'y' : 50,
        'width' : 99,
        'height' : 40,
        'visible' : true,
        'loadedCallback' : imageLoadedCallback});
    self.ufo.direction = (function(){
      if(TEST_ARENA.coinFlip()){
        self.ufo.direction = "right";
        self.ufo.x = -200;
      }
      else{
        self.ufo.direction = "left";
        self.ufo.x = 1100;
      }
    })();
    self.ufo.speed = 1;
    self.ufo.leftEnd = -200;
    self.ufo.rightEnd = 1100;
    self.ufo.animate = function(){
      // move a ufo left and right with random height 0 -> 50
      var ufo = GAME.gameboard.ufo;
      if(ufo.x <= ufo.leftEnd){
        ufo.direction = "right";
        setParameters();     
      }
      if(ufo.x < ufo.rightEnd && ufo.direction === "right"){
        ufo.x += ufo.speed;
      }
      if(ufo.x >= ufo.rightEnd){
        ufo.direction = "left";
        setParameters();
      }
      if(ufo.x > ufo.leftEnd && ufo.direction === "left"){
        ufo.x -= ufo.speed;
      } 
      function setParameters(){
        if(TEST_ARENA.coinFlip()){
          ufo.y = Math.floor((Math.random() * 75) + 1);
          if(ufo.direction === "left"){
            ufo.leftEnd = -200 - Math.floor((Math.random() * 800) + 1);
          }
          else{
            ufo.rightEnd = 1100 + Math.floor((Math.random() * 800) + 1);
          }
        }
        else{
          ufo.y = Math.floor((Math.random() * 75) + 1);
        }
        ufo.speed = Math.floor((Math.random() * 5) + 1); 
      }
      ufo.draw(TEST_ARENA.context);
    }
    
    var imagesLoaded= 0, expectedImagesLoaded=22;
    function imageLoadedCallback() {
      imagesLoaded++;
      if (imagesLoaded == expectedImagesLoaded) {
        callback();
      }
    }
  }
}
