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

		String path = "C:\\Users\\Kitty\\git\\botbattle\\cmpsc488\\botbattleapp\\TestBotAndJudge\\bin";
		
		
		Player p1 = new Player(path, "TicTacToeBot1");
		Player p2 = new Player(path, "TicTacToeBot2");
		//Player p2 = new Player(path, "BadTicTacToeBot1");
		TicTacToeGame game = new TicTacToeGame();
		GameManager manager = new GameManager(p1, p2, game);
		manager.run();
		
		//System.out.println("\n" + manager);
		
		System.out.println("JSON: " + manager.getJSONStringOfResults());
	}
	
}
