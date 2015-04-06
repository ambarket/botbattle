

import java.io.IOException;
import java.util.Scanner;

public class ArenaGameManager {

  public static void main(String[] args) {
    
    // Testing the client code.
    Scanner sc = new Scanner(System.in);
    System.out.println(getHardCodedGameState(0)); // Send initialGameState immediately
    String input = sc.next();  // Get first trun from the human
    System.out.println(getHardCodedGameState(1));
    System.out.println(getHardCodedGameState(2));
    input = sc.next();   // Get second turn from the human
    System.out.println(getHardCodedGameState(3));
    System.out.println(getHardCodedGameState(4));    // Send finalGame state (includes the last turn)
    
    // Exit because we sent the final gameState and are done.
    /*
    if (args.length < 2) {
      System.err.println("Must supplie arguments of bot path and username.");
      System.exit(1);
    }

    String botPath = args[0];
    String username = args[1];
    Player bot = null;

    System.out.flush();
    try {
      bot = new Player(botPath, "rvh5220");
    } catch (IOException e) {
      System.out.println("An Exception was thrown.");
    }
    
    ArenaGameInstance arenaGame = new ArenaGameInstance(bot);
    
    arenaGame.runArenaGame();
  */

  }



  public static String getHardCodedGameState(int stateNum) {
      /* Each gameState has five properties"
       *  type : one of { "initial", "midGame", "final" }
       *    "initial": Tells the client that the game is starting. Can be used to set any initial gameboard
       *        information necessary. And if desired initial animatableEvents and debugData.
       *        In saveTheIsland this should just have a gameData object with initial tile values.
       *    "midgame": Regular gameState will just be passed along to the user defined client javascript for processing
       *    "final": Signifies that the game has ended. First any animatableEvents, gameData, and debugData will be 
       *        passed to the used defined client javascript, then the client code will reset itself in preparation for a 
       *        new game. After sending this, the GameManager is expected to kill itself.
       *        
       *  nextTurn : one of { "player1", "player2", "neither" }
       *     This will be used in the bot v. human test arena to determine when to display the humanInputElement
       *        and retrieve human input. The human player will always be player2. This field should indicate which
       *        player is up next. That is if the current gamestate is indicates the results of player1's turn, nextTurn should be "player2"
       *     If it is the final gameState, this field is not applicable, in that case use the value "neither".
       *  
       *  animatableEvents : an array of animatableEvent objects"
       *      Each animatableEvent must have an event name and data object
       *      Event names must be from the set { "move", "successfulAttack", "defendedAttack" } for saveTheIsland.
       *      Data objects are game specific and depend on the animation to be performed. Note that these are not
       *       completely fleshed out yet. But below you'll find what we are using for move and defendedAttack currently.
       *      
       *  gameData : an arbitrary game specific object containing necessary information"
       *  
       *  debugData : an arbitrary game specific object containing necessary information"
  
  
      /* Lessons about JSON
       * No single quotes anywhere. You must use escpaed double quotes as down below
       * No extraneous commas anywhere!
       * e.g. Commas should be only between two elements in an array or object, not after the last element in that object.
       * VALID:  { "data" : "move", "data2" : "move2" } 
       * INVALID { "data" : "move", "data2" : "move2", }  <==PROBLEM is the extra comma after "move2"
       * 
       * No javascript comments in the JSON strings. e.g. {{ "data" : "move" }, // This comment is a problem { "data2" : "move2" }}
  
       */
    
      /* IMPORTANT
       * BotBattleApp expects each gamestate to be a single string as done below. We are delimiting gameStates by new lines, so
       *    ensure there arent any extra new lines in the JSON generated. The GameStates below are readable on our end.
       */    
   
      switch(stateNum) {
        case 0:
           return "{"    
           +           "\"type\": \"initial\","
           +           "\"nextTurn\": \"player1\","
           +           "\"animatableEvents\": [],"
           +           "\"gameData\" : {"
           +               "\"player1Tiles\" : [1, 3, 5, 5, 3],"
           +               "\"player2Tiles\" : [2, 4, 3, 5, 1],"
           +               "\"turnDescription\" : \"The game has started.\""
           +           "},"
           +           "\"debugData\" : {"
           +               "\"stderr\" : [],"
           +               "\"stdout\" : []"
           +           "}"
           +       "}";
        case 1:
            return "{"           
            +           "\"type\": \"midGame\","
            +           "\"nextTurn\": \"player2\","
            +           "\"animatableEvents\": ["
            +               "{"
            +                   "\"event\": \"move\","
            +                   "\"data\": { "
            +                      "\"objectName\" : \"player1\","
            +                      "\"finalPosition\" : 9 "
            +                  "}"
            +               "}"
            +           "],"
            +           "\"gameData\" : {"
            +               "\"player1Tiles\" : [1, 3, 5, 5, 3],"
            +               "\"player2Tiles\" : [2, 4, 3, 5, 1],"
            +               "\"turnDescription\" : \"Player 2 used a 3 tile to move to position 11.\""
            +           "},"
            +           "\"debugData\" : {"
            +               "\"stderr\" : [ \"An array\", \"of lines output by the bot\", \"stderr on this turn.\" ],"
            +               "\"stdout\" : [ \"An array\", \"of lines output by the bot\", \"stdout on this turn.\" ]"
            +           "}"
            +       "}";
        case 2:
            return  "{"
            +           "\"type\": \"midGame\","
            +           "\"nextTurn\": \"player1\","
            +           "\"animatableEvents\": "
            +           "["
            +              "{"
            +               "\"event\": \"defendedAttack\","
            +                  "\"data\": "
            +                  "{"
            +                      "\"attacker\" : \"player2\","
            +                      "\"defender\" : \"player1\","
            +                      "\"attackerStartingPosition\" : 14,"
            +                      "\"attackerAttackPosition\" : 10"
            +                  "}"
            +              "}"
            +          "],"
            +          "\"gameData\" : {"
            +               "\"player1Tiles\" : [1, 3, 2, 2, 3],"
            +                "\"player2Tiles\" : [2, 4, 3, 5, 1],"
            +                "\"turnDescription\" : \"Player 1 used two 5 tiles to attack but was defended.\""
            +          "},"
            +          "\"debugData\" : {"
            +           "\"stderr\" : [ \"An array\", \"of lines output by the bot\", \"stderr on this turn.\" ],"
            +           "\"stdout\" : [ \"An array\", \"of lines output by the bot\", \"stdout on this turn.\" ]"
            +          "}"
            +       "}";
        case 3:
            return "{"
            +              "\"type\": \"midGame\","
            +              "\"nextTurn\": \"player2\","
            +              "\"animatableEvents\": ["
            +                 "{"
            +                   "\"event\": \"move\","
            +                   "\"data\": { "
            +                     "\"objectName\" : \"player1\","
            +                     "\"finalPosition\" : 0 "
            +                   "} "
            +                 "}"
            +              "],"
            +              "\"gameData\" : {"
            +                "\"player1Tiles\" : [1, 3, 5, 5, 3],"
            +                "\"player2Tiles\" : [2, 4, 3, 5, 1],"
            +                "\"turnDescription\" : \"Player 2 used a 3 tile to move to position 11.\""
            +              "},"
            +              "\"debugData\" : {"
            +                "\"stderr\" : [ \"An array\", \"of lines output by the bot\", \"stderr on this turn.\" ],"
            +                "\"stdout\" : [ \"An array\", \"of lines output by the bot\", \"stdout on this turn.\" ]"
            +              "}"
            +            "}";
           case 4:
                return "{"
                +              "\"type\": \"final\","
                +              "\"nextTurn\": \"neither\","
                +              "\"animatableEvents\": ["
                +                 "{"
                +                   "\"event\": \"move\","
                +                   "\"data\": { "
                +                     "\"objectName\" : \"player1\","
                +                     "\"finalPosition\" : 0 "
                +                   "} "
                +                 "}"
                +              "],"
                +              "\"gameData\" : {"
                +                "\"player1Tiles\" : [1, 3, 5, 5, 3],"
                +                "\"player2Tiles\" : [2, 4, 3, 5, 1],"
                +                "\"turnDescription\" : \"Player 2 has won!\""
                +              "},"
                +              "\"debugData\" : {"
                +                "\"stderr\" : [ \"An array\", \"of lines output by the bot\", \"stderr on this turn.\" ],"
                +                "\"stdout\" : [ \"An array\", \"of lines output by the bot\", \"stdout on this turn.\" ]"
                +              "}"
                +            "}";
      }
      return "";
   }
}
  
