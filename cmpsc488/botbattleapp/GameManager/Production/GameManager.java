

import java.io.IOException;
import java.util.Scanner;
/**
 * @author Randall Hudson
 *
 */
public class GameManager {
  
  //You will need to change this path
  public static  String path = "C:\\Users\\Kitty\\git\\botbattle\\cmpsc488\\botbattleapp\\GameManager2\\bin";

  // TODO create simple save the island bot
  // TODO test save the island game with simple bot
  // TODO write unit tests for rounds
  // TODO write unit tests for tournaments 
  // TODO write unit tests for Competitor Data
  // TODO write unit tests for game instance
  // TODO look into integration testing
  // TODO clean up players constructors, could combine most of that work.

  public static void main(String[] args) throws IOException, InterruptedException {
	    Scanner sc = new Scanner(System.in);
	    String input = sc.next();
	    while(!input.equals("Quit")){
	       // System.out.println(input);
	        System.out.println(getHardCodedGameState(0));
	        System.out.println(getHardCodedGameState(1));
	        System.out.println(getHardCodedGameState(2));
	        input = sc.next();
	    }
    //TournamentTest();
    //humanPlayersTest();
  }
  
  public static void humanPlayersTest() throws IOException, InterruptedException {
    System.out.flush();
    Player p1 = new Player(path);
    System.out.flush();
    Player p2 = new Player(path, "rvh5220");
    
    GameInstance game = new GameInstance(p1, p2);
    Thread runningGame = new Thread(game);
    runningGame.start();
    runningGame.join();
  }

  // This test is for a tic tac toe tournament
  public static void TournamentTest() {
    CompetitorData c = new CompetitorData();
    c.addUser("rvh5220", path);
    c.addUser("rvh5221", path);
    c.addUser("rvh5222", path);
    c.addUser("rvh5223", path);

    Tournament t = new Tournament(null, null, c);
    try {
      t.runTournament();
    } catch (IOException e) { // TODO this should probablly be caught lower down
      e.printStackTrace();
    }
  }
  
 
  public static String getHardCodedGameState(int stateNum) {
	  // Instead of named objects called turns, just use an array of objects, on our end were calling these gamestates"
	  // and they will be processed in the order that they are defined in this array"
	  // Each gaem state has three properties"
	  //  animatableEvents : an array of animatableEvent objects"
	  //  gameData : an arbitrary game specific object containing necessary information"
	  //  debugData : an arbitrary game specific object containing necessary information"
	  // Each animatableEvent must have an event name and data object"
    
      /* Lessons about JSON
       * No single quotes anywhere. You must use escpaed double quotes as down below
       * No extraneous commas anywhere!
       * e.g. Commas should be only between two elements in an array or object, not after the last element in that object.
       * VALID:  { "data" : "move", "data2" : "move2" } 
       * INVALID { "data" : "move", "data2" : "move2", }  <==PROBLEM is the extra comma after "move2"
       */
	  switch(stateNum) {
	  	case 0:
  			return "{"			 
			+ 			"\"animatableEvents\": ["
			+       		"{"
			+         			"\"event\": \"move\","
			+        			"\"data\": { "
			+          			   "\"objectName\" : \"player1\","
			+          			   "\"finalPosition\" : 9 "
			+        	       "}"
			+      		    "}"
			+   		"],"
			+   		"\"gameData\" : {"
			+       		"\"player1Tiles\" : [1, 3, 5, 5, 3],"
			+       		"\"player2Tiles\" : [2, 4, 3, 5, 1],"
			+       		"\"turnDescription\" : \"Player 2 used a 3 tile to move to position 11.\""
			+    		"},"
			+     		"\"debugData\" : {"
			+               "\"stderr\" : [ \"An array\", \"of lines output by the bot\", \"stderr on this turn.\" ],"
			+ 			    "\"stdout\" : [ \"An array\", \"of lines output by the bot\", \"stdout on this turn.\" ]"
			+ 			"}"
			+ 		"}";
	  	case 1:
			return  "{"
			+ 			"\"animatableEvents\": "
			+ 			"["
			+          	   "{"
			+              	"\"event\": \"defendedAttack\","
			+                  "\"data\": "
			+                  "{"
			+                  	"\"attacker\" : \"player2\","
			+                      "\"defender\" : \"player1\","
			+                      "\"attackerStartingPosition\" : 24,"
			+                      "\"attackerAttackPosition\" : 11"
			+                  "}"
			+              "}"
			+          "],"
			+          "\"gameData\" : {"
			+               "\"player1Tiles\" : [1, 3, 2, 2, 3],"
			+                "\"player2Tiles\" : [2, 4, 3, 5, 1],"
			+                "\"turnDescription\" : \"Player 1 used two 5 tiles to attack but was defended.\""
			+          "},"
			+          "\"debugData\" : {"
			+          	"\"stderr\" : [ \"An array\", \"of lines output by the bot\", \"stderr on this turn.\" ],"
			+          	"\"stdout\" : [ \"An array\", \"of lines output by the bot\", \"stdout on this turn.\" ]"
			+          "}"
			+ 		"}";
	  	case 2:
	  		return "{"
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
	  }
	  return "";
	}
}
