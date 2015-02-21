package GameManager;


/**
 * @author ambar_000
 * @version 1.0
 * @created 21-Feb-2015 5:15:13 PM
 */
public interface IGame {

	/**
	 * Return the string representation of the board for passing the board to a bot.
	 */
	public String getBotBoard();

	/**
	 * Process the move and update internal game state
	 * Return Values:
	 * 0: Valid move, no winner yet
	 * 1: Valid move, player 1 has won the game
	 * 2: Valid move, player2 has won the game
	 * 3: Invalid move, couldn't update board state
	 * 
	 * @param move    The move received from the Player
	 */
	public int updateBoard(String move);

	/**
	 * Return a string containing the HTML snippet for use in displaying the current
	 * board state in the test arena / tournament viewer.
	 */
	public String getHtmlBoard();

	/**
	 * Return string containing the HTML snippet used to display the input element for
	 * a human in the test arena.
	 */
	public String getHumanInputElement();

}