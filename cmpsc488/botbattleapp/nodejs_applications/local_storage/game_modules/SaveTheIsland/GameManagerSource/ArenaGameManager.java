

import java.io.IOException;
import java.util.Scanner;

import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.json.simple.JSONArray;

import java.util.ArrayList;

public class ArenaGameManager {
  
  //TODO look at final position field in animated events. It should be for the attacked player?
  //TODO test animated events fields based on requirements from Steven and Austin

  
  // arg[0] should be "testarena"
  // arg[1] should be a JSON string containing all other information.
  public static void main(String[] args) throws IOException {
    
	  test();
   /* if (args.length < 2 || !args[0].equals("testarena")) {
      System.err.println("Must supplie arguments of \"testarena\" and JSON string with startup info.");
      //System.exit(1);
      args = new String[2];args[0] = "testarena";
      // if need to debug change the path and directory
	  args[1] = "{\"numberOfBots\":1,"
	  		+ "\"bot1\":{"
	  		+ 	"\"path\":\"/home/steven/git/botbattle/cmpsc488/botbattleapp/nodejs_applications/local_storage/test_arena_tmp/m1KowMts/bot1/SaveIslandBot1.class\","
	  		+ 	"\"language\":\"java\","
	  		+ 	"\"name\":\"SaveIslandBot1\","
	  		+ 	"\"directory\":\"/home/steven/git/botbattle/cmpsc488/botbattleapp/nodejs_applications/local_storage/test_arena_tmp/m1KowMts/bot1\""
	  		+ "}}";

    }
    System.err.println(args[1]);
 
    JSONObject arenaInfo = (JSONObject) JSONValue.parse(args[1]);
    JSONObject bot1 = (JSONObject) arenaInfo.get("bot1");
    JSONObject bot2 = (JSONObject) arenaInfo.get("bot2");
    
    printJSONInfo(args, arenaInfo, bot1, bot2);
    
    Long numOfBots = (Long) arenaInfo.get("numberOfBots");
    Player plyr1 = null, plyr2 = null;
    
    if( numOfBots == 1 ) {
      String path = (String) bot1.get("directory");
      String lang = (String) bot1.get("language");
      String username = (String) bot1.get("name");

      plyr1 = new Player(path, username, getLanguage(lang));
      plyr2 = new Player();
      
    } else {
      String path = (String) bot1.get("directory");
      String lang = (String) bot1.get("language");
      String username = (String) bot1.get("name");

      plyr1 = new Player(path, username, getLanguage(lang));
      path = (String) bot2.get("directory");
      lang = (String) bot2.get("language");
      username = (String) bot2.get("name");

      plyr2 = new Player(path, username, getLanguage(lang));
      
    }
     
    

    ArenaGameInstance arenaGame = new ArenaGameInstance(plyr1, plyr2);
    
    arenaGame.runArenaGame();
  }
  
  private static Language getLanguage(String lang) {
    if(lang.equals("java")) {
      return Language.JAVA;
    } else if( lang.equals("c++")) {
      return Language.CPP;
    } else {
      return Language.INVALID;
    }
  }

  private static void printJSONInfo(String[] args, JSONObject parsed, JSONObject bot1,
      JSONObject bot2) {
    System.err.println("ARGUMENT: " + args[1]);
    System.err.println("PARSED_ARGUMENT: " + parsed);
    System.err.println("NUMBER_OF_BOTS: " + parsed.get("numberOfBots"));
    System.err.println("BOT1: " + bot1);
    System.err.println("BOT1_LANGUAGE: " + bot1.get("language"));
    System.err.println("BOT1_PATH: " + bot1.get("directory"));
    System.err.println("Username1: " + bot1.get("name"));
    if (bot2 != null) {
      System.err.println("BOT2: " + bot2);
      System.err.println("BOT2_LANGUAGE: " + bot2.get("language"));
      System.err.println("BOT2_PATH: " + bot2.get("directory"));
      System.err.println("Username2: " + bot2.get("name"));
    }*/
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  public static void test() {
    /* With one bot (e.g. bot v human test arena) -- human is always player 2
     * ARGUMENT: 
     *      {   "numberOfBots":1,
     *          "bot1": {
     *              "path":"/home/amb6470/git/botbattle/cmpsc488/botbattleapp/nodejs_applications/local_storage/test_arena_tmp/m1L0FPEi/bot1/bot.class",
     *              "language":"java"
     *           }
     *      }
     *      PARSED_ARGUMENT: {"bot1":{"path":"\/home\/amb6470\/git\/botbattle\/cmpsc488\/botbattleapp\/nodejs_applications\/local_storage\/test_arena_tmp\/m1L0FPEi\/bot1\/bot.class","language":"java"},"numberOfBots":1}
     *      NUMBER_OF_BOTS: 1
     *      BOT1: {"path":"\/home\/amb6470\/git\/botbattle\/cmpsc488\/botbattleapp\/nodejs_applications\/local_storage\/test_arena_tmp\/m1L0FPEi\/bot1\/bot.class","language":"java"}
     *      BOT1_LANGUAGE: java
     *      BOT1_PATH: /home/amb6470/git/botbattle/cmpsc488/botbattleapp/nodejs_applications/local_storage/test_arena_tmp/m1L0FPEi/bot1/bot.class
     */
    
    /*  With two bots (e.g. bot v bot test arena)
     *  ARGUMENT: 
     *      {   "numberOfBots":2,
     *          "bot1": {
     *              "path":"/home/amb6470/git/botbattle/cmpsc488/botbattleapp/nodejs_applications/local_storage/test_arena_tmp/Qyx6SjvVs/bot1/bot.class",
     *              "language":"java"
     *          },
     *          "bot2": {
     *              "path":"/home/amb6470/git/botbattle/cmpsc488/botbattleapp/nodejs_applications/local_storage/test_arena_tmp/Qyx6SjvVs/bot2/blank.cpp.out",
     *              "language":"c++"
     *          }
     *      }
     *  PARSED_ARGUMENT: {"bot1":{"path":"\/home\/amb6470\/git\/botbattle\/cmpsc488\/botbattleapp\/nodejs_applications\/local_storage\/test_arena_tmp\/Qyx6SjvVs\/bot1\/bot.class","language":"java"},"bot2":{"path":"\/home\/amb6470\/git\/botbattle\/cmpsc488\/botbattleapp\/nodejs_applications\/local_storage\/test_arena_tmp\/Qyx6SjvVs\/bot2\/blank.cpp.out","language":"c++"},"numberOfBots":2}
     *  NUMBER_OF_BOTS: 2
     *  BOT1: {"path":"\/home\/amb6470\/git\/botbattle\/cmpsc488\/botbattleapp\/nodejs_applications\/local_storage\/test_arena_tmp\/Qyx6SjvVs\/bot1\/bot.class","language":"java"}
     *  BOT1_LANGUAGE: java
     *  BOT1_PATH: /home/amb6470/git/botbattle/cmpsc488/botbattleapp/nodejs_applications/local_storage/test_arena_tmp/Qyx6SjvVs/bot1/bot.class
     *  BOT2: {"path":"\/home\/amb6470\/git\/botbattle\/cmpsc488\/botbattleapp\/nodejs_applications\/local_storage\/test_arena_tmp\/Qyx6SjvVs\/bot2\/blank.cpp.out","language":"c++"}
     *  BOT2_LANGUAGE: c++
     *  BOT2_PATH: /home/amb6470/git/botbattle/cmpsc488/botbattleapp/nodejs_applications/local_storage/test_arena_tmp/Qyx6SjvVs/bot2/blank.cpp.out
     */


    
    // Testing the client code.
    Scanner sc = new Scanner(System.in);
    System.out.println(getHardCodedGameState(0)); // Send initialGameState immediately
    System.out.println(getHardCodedGameState(1));  // bot goes
    String input = sc.next();  // Get first trun from the human
    System.out.println(getHardCodedGameState(2));  // input validation
    System.out.println(getHardCodedGameState(3));  // human goes
    System.out.println(getHardCodedGameState(4));  // bot goes
    input = sc.next();   // Get second turn from the human
    System.out.println(getHardCodedGameState(5));  // input validation
    System.out.println(getHardCodedGameState(6));  // Send finalGame state (includes the last turn)
    
    // Exit because we sent the final gameState and are done.
    
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
       *  enableHumanInput : one of { true, false}
       *     This will be used in the bot v. human test arena to determine when to display the humanInputElement
       *        and retrieve human input. 
       *        
       *  animatableEvents : an array of animatableEvent objects"
       *      Each animatableEvent must have an event name and data object
       *      Event names must be from the set { "move", "fallback", "successfulAttack", "defendedAttack" } for saveTheIsland.
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
          // Note: This gives the following message, investigate why
          //    ArenaGameManager.java uses unchecked or unsafe operations. Recompile with -Xlint:unchecked for details.

          /*JSONObject gameState0 = new JSONObject();
          gameState0.put("type", "initial");
          gameState0.put("nextTurn", "player1");
          
          JSONArray gameState0_animatableEvents = new JSONArray();
          gameState0.put("animatableEvents", gameState0_animatableEvents);
          
          ArrayList gameState0_gameData_player1Tiles = new ArrayList();
          gameState0_gameData_player1Tiles.add(1);
          gameState0_gameData_player1Tiles.add(3);
          gameState0_gameData_player1Tiles.add(5);
          gameState0_gameData_player1Tiles.add(5);
          gameState0_gameData_player1Tiles.add(3);
          
          ArrayList gameState0_gameData_player2Tiles = new ArrayList();
          gameState0_gameData_player2Tiles.add(2);
          gameState0_gameData_player2Tiles.add(4);
          gameState0_gameData_player2Tiles.add(3);
          gameState0_gameData_player2Tiles.add(5);
          gameState0_gameData_player2Tiles.add(1);
          
          JSONObject gameState0_gameData = new JSONObject();
          gameState0_gameData.put("player1Tiles", gameState0_gameData_player1Tiles);
          gameState0_gameData.put("player2Tiles", gameState0_gameData_player2Tiles);
          gameState0_gameData.put("turnDescription", "The game has started2.");
          gameState0.put("gameData", gameState0_gameData);
          
          JSONObject gameState0_debugData = new JSONObject();
          JSONArray gameState0_debugData_stderr = new JSONArray();
          JSONArray gameState0_debugData_stdout = new JSONArray();
          gameState0_debugData.put("stderr", gameState0_debugData_stderr);
          gameState0_debugData.put("stdout", gameState0_debugData_stdout);
          gameState0.put("debugData", gameState0_debugData);

         return gameState0.toJSONString(); */
           return "{"    
           +		   "\"messageType\": \"gamestate\","
           +           "\"type\": \"initial\","
           +           "\"enableHumanInput\": false,"
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
          /*JSONObject gameState1 = new JSONObject();
          gameState1.put("type", "midGame");
          gameState1.put("nextTurn", "player2");
          
          JSONArray gameState1_animatableEvents = new JSONArray();

          JSONObject gameState1_animatableEvents_event0 = new JSONObject();
          gameState1_animatableEvents_event0.put("event", "move");
          
          JSONObject gameState1_animatableEvents_event0_data = new JSONObject();
          gameState1_animatableEvents_event0_data.put("objectName", "player1");
          gameState1_animatableEvents_event0_data.put("finalPosition", 9);
          gameState1_animatableEvents_event0.put("data", gameState1_animatableEvents_event0_data);
          
          gameState1_animatableEvents.add(gameState1_animatableEvents_event0);
          gameState1.put("animatableEvents", gameState1_animatableEvents);
          
          ArrayList gameState1_gameData_player1Tiles = new ArrayList();
          gameState1_gameData_player1Tiles.add(1);
          gameState1_gameData_player1Tiles.add(3);
          gameState1_gameData_player1Tiles.add(5);
          gameState1_gameData_player1Tiles.add(5);
          gameState1_gameData_player1Tiles.add(3);
          
          ArrayList gameState1_gameData_player2Tiles = new ArrayList();
          gameState1_gameData_player2Tiles.add(2);
          gameState1_gameData_player2Tiles.add(4);
          gameState1_gameData_player2Tiles.add(3);
          gameState1_gameData_player2Tiles.add(5);
          gameState1_gameData_player2Tiles.add(1);
          
          JSONObject gameState1_gameData = new JSONObject();
          gameState1_gameData.put("player1Tiles", gameState1_gameData_player1Tiles);
          gameState1_gameData.put("player2Tiles", gameState1_gameData_player2Tiles);
          gameState1_gameData.put("turnDescription", "The game has started2.");
          gameState1.put("gameData", gameState1_gameData);
          
          JSONObject gameState1_debugData = new JSONObject();
          JSONArray gameState1_debugData_stderr = new JSONArray();
          gameState1_debugData_stderr.add("Some stuff from stderr");
          JSONArray gameState1_debugData_stdout = new JSONArray();
          gameState1_debugData_stdout.add("Some stuff from stdout");
          gameState1_debugData.put("stderr", gameState1_debugData_stderr);
          gameState1_debugData.put("stdout", gameState1_debugData_stdout);
          gameState1.put("debugData", gameState1_debugData);

         return gameState1.toJSONString(); */
         
            return "{"           
            +		    "\"messageType\": \"gamestate\","
            +           "\"type\": \"midGame\","
            +           "\"enableHumanInput\": true,"
            +           "\"animatableEvents\": ["
            +               "{"
            +                   "\"event\": \"move\","
            +                   "\"data\": { "
            +                      "\"player\" : \"player1\","
            +                      "\"endPosition\" : 9 "
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
		    +           "\"messageType\": \"humanInputValidation\","
		    +			"\"type\": \"midGame\","
			+           "\"valid\": true"         
			+       "}";
        case 3:
            return  "{"
        	+	        "\"messageType\": \"gamestate\","
            +           "\"type\": \"midGame\","
            +           "\"enableHumanInput\": false,"
            +           "\"animatableEvents\": "
            +           "["
            +              "{"
            +               "\"event\": \"move\","
            +                  "\"data\": "
            +                  "{"
            +                      "\"player\" : \"player2\","
            +                      "\"endPosition\" : 10"
            +                  "}"
            +              "},"
            +              "{"
            +               "\"event\": \"defendedAttack\","
            +                  "\"data\": "
            +                  "{"
            +                      "\"player\" : \"player2\""
            +                  "}"
            +              "},"
            +              "{"
            +               "\"event\": \"fallback\","
            +                  "\"data\": "
            +                  "{"
            +					   "\"player\" : \"player2\","
            +                      "\"endPosition\" : 14"
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
        case 4:
            return "{"
            +              "\"messageType\": \"gamestate\","
            +           	"\"type\": \"midGame\","
            +           	"\"enableHumanInput\": true,"
            +              "\"animatableEvents\": ["
            +                 "{"
            +                   "\"event\": \"move\","
            +                   "\"data\": { "
            +					   "\"player\" : \"player1\","
            +                      "\"endPosition\" : 0"
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
           case 5: 
        	    return  "{"    
       		    +           "\"messageType\": \"humanInputValidation\","
        	    +			"\"type\": \"midGame\","
    			+           "\"valid\": true"         
    			+       "}";
           case 6:
                return "{"
                +              "\"messageType\": \"gamestate\","
                +           	"\"type\": \"final\","
                +           	"\"enableHumanInput\": false,"
                +              "\"animatableEvents\": ["
                +                 "{"
                +                   "\"event\": \"move\","
                +                   "\"data\": { "
                +                     "\"player\" : \"player2\","
                +                     "\"endPosition\" :  8"
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
  
