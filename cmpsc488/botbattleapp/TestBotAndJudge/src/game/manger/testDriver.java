package game.manger;

import java.io.IOException;

/**
 * @author Randall Hudson
 *
 */
public class testDriver {

	/**
	 * @param args
	 * @throws IOException 
	 */
	public static void main(String[] args) throws IOException {

		TournamentTest();
		
//		String path = "C:\\Users\\Kitty\\git\\botbattle\\cmpsc488\\botbattleapp\\TestBotAndJudge\\bin";
//		
//		
//		Player p1 = new Player(path, "TicTacToeBot1");
//		Player p2 = new Player(path, "TicTacToeBot2");
//		//Player p2 = new Player(path, "BadTicTacToeBot1");
//
//		GameManager manager = new GameManager(p1, p2);
//		manager.run();
//		
//		//System.out.println("\n" + manager);
//		
//		System.out.println("JSON: " + manager.getJSONStringOfResults());
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
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
}
