package game.manger;

/**
 * @author Randall Hudson
 *
 */
public class testDriver {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		
		testHumanVersusBot();
	}
	
	public static void testBotPlayers(){
		TicTacToeGame game = new TicTacToeGame();
		TicTacToeBot bot1 = new TicTacToeBot(false);
		TicTacToeBot bot2 = new TicTacToeBot(true);
		
		GameManager foo = new GameManager(bot1, bot2, game);
		
		foo.run();
		System.out.println(game.getBoard());
	}
	
	public static void testHumanVersusBot(){
		TicTacToeGame game = new TicTacToeGame();
		TicTacToeBot bot1 = new TicTacToeBot(false);
		HumanPlayer palyer2 = new HumanPlayer();
		
		GameManager foo = new GameManager(bot1, palyer2, game);
		
		foo.run();
		System.out.println(game.getBoard());
	}
}
