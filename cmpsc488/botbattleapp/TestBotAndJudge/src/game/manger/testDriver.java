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
		// TODO Auto-generated method stub
		TicTacToeGame game = new TicTacToeGame();
		TicTacToeBot bot1 = new TicTacToeBot(false);
		TicTacToeBot bot2 = new TicTacToeBot(true);
		
		int i = 0;
		String move = "";
		while(!game.isGameOver()){
			
			if(i % 2 == 0)
				move = bot1.getMove(game.getBoard());
			else
				move = bot2.getMove(game.getBoard());

			if(game.isValidMove(move))
				game.updateBoard(move);
			else{
				System.out.println("Invalid move made");
				break;
			}
			i++;
		}
		
		System.out.println(game.getBoard());
	}

}
