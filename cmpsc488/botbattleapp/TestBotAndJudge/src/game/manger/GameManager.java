package game.manger;

import game.manger.SaveTheIslandGame.Board;

import java.io.IOException;

/**
 * @author Randall Hudson
 *
 */
public class GameManager {
	
	//TODO move toJSONString from game results to game class
	//TODO create simple save the island bot
	//TODO test save the island game with simple bot
	//TODO write unit tests for rounds
	//TODO write unit tests for tournaments
	//TODO write unit tests for Competitor Data
	//TODO write unit tests for game manager
	//TODO look into integration testing
	//TODO decide if we need gameInterface, if so update it. 
	
	/**
	 * @param args
	 * @throws IOException 
	 */
	public static void main(String[] args) throws IOException {

	TournamentTest();
		
//	  String s = SaveTheIslandGame.animatedEventJSON("initialSetup", "None", -1);
//	  System.out.println(s);
//	  String b = SaveTheIslandGame.getStartingBoard();
//	  s = SaveTheIslandGame.gameDataJSON(Board.getPlayersTiles(1, b), Board.getPlayersTiles(2, b), "Start");
//	  System.out.println(s);
	}
	
	public static void TournamentTest() {
		String path = "C:\\Users\\Kitty\\git\\botbattle\\cmpsc488\\botbattleapp\\TestBotAndJudge\\bin";
		CompetitorData c = new CompetitorData();
		c.addUser("rvh5220", path);
		c.addUser("rvh5221", path);
		c.addUser("rvh5222", path);
		c.addUser("rvh5223", path);
		
		Tournament t = new Tournament(null, null, c);
		try {
			t.runTournament();
		} catch (IOException e) { //TODO this should probablly be caught lower down
			e.printStackTrace();
		}
	}
	
}
