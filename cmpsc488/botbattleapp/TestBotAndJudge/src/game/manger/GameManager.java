package game.manger;

public class GameManager implements Runnable {

	private Player player1;
	private Player player2;
	private GameResults results;	
	
	/**
	 * @param player1
	 * @param player2
	 */
	public GameManager(Player player1, Player player2) {//TODO: Remove GameInterface and just make it Game
		this.player1 = player1;
		this.player2 = player2;
		results = new GameResults();		
	}

	@Override
	public void run() {
		int i = 0;
		String move = "";
		String board = Game.getStartingBoard();
		results.addBoard(Game.getStartingBoard());
		while(!Game.isGameOver(board)){
			
			if(i % 2 == 0){
				move = player1.getMove(board);
				results.addMove(move, 1);
			}				
			else{
				move = player2.getMove(board);
				results.addMove(move, 2);
			}				

			if(Game.isValidMove(move, board)){
				board = Game.updateBoard(move, board);
				results.addBoard(board);
				
				if(Game.isGameWon(board)){
					System.out.println("Game Won by player" + ((i%2) + 1));
					results.setWinner(i % 2);
					break;
				}
			}				
			else{
				System.out.println("Invalid move made");
				break;
			}
			
			i++;
		}
		
		System.out.println("Game over");
	}
	
	public String getHTMLForEntireGame(){ //TODO implement getHTML function in gameManager
		return null;
	}

	public String getJSONStringOfResults() {
		return results.toJSONString();
	}

	@Override
	public String toString() {
		return "GameManager [\n\tplayer1=" + player1 + ",\n\tplayer2=" + player2
				+ ",\n game=" + Game.getName() + ",\n results=" + results + "]";
	}
	
	
}
