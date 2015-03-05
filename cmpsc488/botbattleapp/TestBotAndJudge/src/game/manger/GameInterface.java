package game.manger;


/**
 * @author Randall Hudson
 *
 */
public interface GameInterface {
		
	String getBoard();
	void updateBoard(String move);
	boolean isValidMove(String move);
	boolean isGameOver();
	boolean isGameWon();
	String getHTMLForBoard();
	int getBotTimeoutInMilliseconds();
	
}
