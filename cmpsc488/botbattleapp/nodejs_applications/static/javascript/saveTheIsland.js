USER_DEFINITIONS = {
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
      for (treeIndex in gameboard.backgroundElements.trees1){
          gameboard.backgroundElements.trees1[treeIndex].x += (treeMove * 5 * scale);
      }
      for (treeIndex in gameboard.backgroundElements.trees2){
          gameboard.backgroundElements.trees2[treeIndex].y += (treeMove * 5 * scale);
        }
    },
}
    
  var animations = {
      move : function(event, lastUpdateTime, callback) {
          //backgroundAnimations();
        
        gameboard.playerAnimations[event.data.objectName].standing.visible = false;
        gameboard.playerAnimations[event.data.objectName].move.visible = true;
        
        var drawableObject = gameboard.playerAnimations[event.data.objectName].move;
        gameboard.playerAnimations[event.data.objectName].current = drawableObject;
        
        var time = updateXPositionLinearlyWithTime(drawableObject, event, lastUpdateTime, gameboard.islandWidth * 0.183908046); // 0.183908046 is 160/870 
        
        var done = drawableObject.x === (event.data.finalPosition * gameboard.gridWidth) + gameboard.islandStart;
         
        if (!done) {
          requestAnimFrame(function() {
            animations.move(event, time, callback);
          });
        } 
        else {   // maybe make just current instead of changing visible...
            gameboard.playerAnimations[event.data.objectName].move.visible = false;
            gameboard.playerAnimations[event.data.objectName].standing.visible = true;
            gameboard.playerAnimations[event.data.objectName].current = gameboard.playerAnimations[moveEvent.objectName].standing;
            gameboard.playerAnimations[event.data.objectName].current.x = drawableObject.x;
            gameboard.playerAnimations[event.data.objectName].current.y = drawableObject.y;
            callback();
        }
      },
      attack : function(animation, callback) {

      },
      defend : function(moveEvent, time, callback) {
        var defendingPlayer = moveEvent.objectName;
        var attackingPlayer = null;
        if (moveEvent.objectName == 'player1') {
          attackingPlayer = 'player2';
        }
        else {
          attackingPlayer = 'player1';
        }
        // Set current state and position of defending player
        gameboard.playerAnimations[defendingPlayer].defend.x = gameboard.playerAnimations[defendingPlayer].standing.x;
        gameboard.playerAnimations[defendingPlayer].defend.y = gameboard.playerAnimations[defendingPlayer].standing.y;  
        gameboard.playerAnimations[defendingPlayer].standing.visible = false;
        gameboard.playerAnimations[defendingPlayer].defend.visible = true;
        var defendingSprite = gameboard.playerAnimations[defendingPlayer].defend;
        gameboard.playerAnimations[defendingPlayer].current = defendingSprite;
        
        // Set current state and position of attacking player
        gameboard.playerAnimations[attackingPlayer].defend.x = gameboard.playerAnimations[attackingPlayer].standing.x;
        gameboard.playerAnimations[attackingPlayer].defend.y = gameboard.playerAnimations[attackingPlayer].standing.y;  
        gameboard.playerAnimations[attackingPlayer].standing.visible = false;
        gameboard.playerAnimations[attackingPlayer].defend.visible = true;
        var attackingSprite = gameboard.playerAnimations[attackingPlayer].defend;
        gameboard.playerAnimations[attackingPlayer].current = attackingSprite;
        
        
        var done = moveEvent.animationComplete(defendingSprite);
        if (!done) {
          requestAnimFrame(function() {
            animations.defend(moveEvent, time, callback);
          });
        } 
        else {   // maybe make just current instead of changing visible...
            gameboard.playerAnimations[defendingPlayer].defend.visible = false;
            gameboard.playerAnimations[defendingPlayer].standing.visible = true;
            //gameboard.playerAnimations[defendingPlayer].current = gameboard.playerAnimations[moveEvent.objectName].standing;
            //gameboard.playerAnimations[defendingPlayer].current.x = defendingSprite.x;
            //gameboard.playerAnimations[defendingPlayer].current.y = defendingSprite.y;
            
            gameboard.playerAnimations[attackingPlayer].defend.visible = false;
            gameboard.playerAnimations[attackingPlayer].standing.visible = true;
            
            // Note attacking player will fall backwards as result of next event
            callback();
        }
      },
      died : function(animation, callback) {

      }
    }





/* Maybe not the place to do this
// Parse into JSON
var response = JSON.parse(req.responseText);
// Parse into GameState Object
for (var turnIndex in response){
    for (var animatableEventIndex in response[turnIndex]['animatableEvents']){
      var animatableEvent = response[turnIndex]['animations'][animatableEventIndex];
      if (animatableEvent.event && animatableEvent.data) {
        gameState.animationsList.push(new AnimatableEvent(animatableEvent.event, animatableEvent.data)); 
      }
    }
    var player1Tiles = response[turnIndex]['player1Tiles'];
    var player2Tiles = response[turnIndex]['player2Tiles'];
    var move = response[turnIndex]['move'];
    var debug = response[turnIndex]['debug'];
}
*/
