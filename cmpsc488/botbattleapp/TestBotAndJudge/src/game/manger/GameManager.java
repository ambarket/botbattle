package game.manger;

public class GameManager implements Runnable {

	private Player player1;
	private Player player2;
	private GameInterface game;
	private GameResults results;
	
	
	
	/**
	 * @param player1
	 * @param player2
	 * @param game
	 */
	public GameManager(Player player1, Player player2, GameInterface game) {
		this.player1 = player1;
		this.player2 = player2;
		this.game = game;
		results = new GameResults();
	}



	@Override
	public void run() {
		int i = 0;
		String move = "";
		results.addBoard(game.getBoard());
		while(!game.isGameOver()){
			
			if(i % 2 == 0){
				move = player1.getMove(game.getBoard());
				results.addMove(move, 1);
			}				
			else{
				move = player2.getMove(game.getBoard());
				results.addMove(move, 2);
			}				

			if(game.isValidMove(move)){
				game.updateBoard(move);
				results.addBoard(game.getBoard());
			}				
			else{
				System.out.println("Invalid move made");
				break;
			}
			i++;
		}
	}

}
