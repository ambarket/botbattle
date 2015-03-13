var GameSpecificActions = {
    'processGameData' : function(gameData) {
      // Add tiles and turn description to the page
    }

    'processDebugData' : function(debugData) {
      //Add debugging data to the page
    }
    
    'processAnimation' : function(animatableEvent) {
      // Take an object past in the animatableEvents array from the game manager
      //    and animate it on the canvas.
      //    Each animatableEvent has an 'event' property naming the event
      //    and a 'data' object containing any necessary information for the animation
      
      
      
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
