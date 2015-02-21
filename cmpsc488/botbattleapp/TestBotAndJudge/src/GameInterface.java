/**
 * 
 */

/**
 * @author Randall Hudson
 *
 */
public interface GameInterface {
	String getBoard();
	void updateBoard(String move);
	boolean isValidMove(String move);
	boolean isGameOver();
	String getHTMLForBoard();
}
