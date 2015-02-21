package GameManager;


/**
 * A set of parallel arrays where each index corresponds to a discrete frame of
 * the playback. Moves and stdErr are cumulative. e.g. the content of the Moves
 * html element at frame i = the sum of elements 0 through i. Fast Forwarding then
 * simply requires a linear parse from current index to the desired index
 * appending as you go. Boards and humanInputElement however are stored in their
 * entirety at each index.
 * @author ambar_000
 * @version 1.0
 * @created 21-Feb-2015 5:15:13 PM
 */
public class JavaGameResults {

	/**
	 * Array of html to display each frame of the board. Html at index i = the board
	 * state after the ith move.
	 */
	private String[] boards;
	/**
	 * Array of html snippets used to get Human player’s move in the Test Arena. Html
	 * at index i is the input element to be displayed to the user after the ith move.
	 */
	private String[] inputElements;
	/**
	 * Array of strings of each of player1’s moves. Move at index i is the move the
	 * player made on turn i. If it was the opponents turn, this is the empty string.
	 */
	private String[] player1Moves;
	/**
	 * Array of strings of each of player 2’s moves. Move at index i is the move the
	 * player made on turn i. If it was the opponents turn, this is the empty string.
	 */
	private String[] player2Moves;
	/**
	 * Array of strings of each of player1’s stderr messages. String at index i is the
	 * output from stderr of the player on turn i. If it was there wasn't any, this is
	 * the empty string.
	 */
	private String[] player1StdErrs;
	/**
	 * Array of strings of each of player2’s stderr messages. String at index i is the
	 * output from stderr of the player on turn i. If it was there wasn't any, this is
	 * the empty string.
	 */
	private String[] player2StdErrs;
	/**
	 * Indication of which player, if any has won the game. 0 - No Winner, 1 - Player
	 * 1, 2 - Player 2
	 */
	private int winner;
	public JavaGameState m_JavaGameState;

	public JavaGameResults(){

	}

	public void finalize() throws Throwable {

	}

	/**
	 * method for convenient conversion to a JSON representation of the results.
	 */
	public String toJSONString(){
		return "";
	}

	/**
	 * Add the passed information to the results
	 * 
	 * @param gs    Latest results to append
	 */
	public void append(JavaGameState gs){

	}

}