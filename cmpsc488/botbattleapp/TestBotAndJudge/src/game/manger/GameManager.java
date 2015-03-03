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
	public GameManager(Player player1, Player player2, GameInterface game) {//TODO: Remove GameInterface and just make it Game
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
				try {
					move = player1.getMove(game.getBoard());
				} catch (InterruptedException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				results.addMove(move, 1);
			}				
			else{
				try {
					move = player2.getMove(game.getBoard());
				} catch (InterruptedException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
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
	
	public String getHTMLForEntireGame(){ //TODO implement getHTML function in gameManager
		return null;
	}



	@Override
	public String toString() {
		return "GameManager [\n\tplayer1=" + player1 + ",\n\tplayer2=" + player2
				+ ",\n game=" + game + ",\n results=" + results + "]";
	}
	
	
}
