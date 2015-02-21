package GameManager;


/**
 * This represents a periodic update of the latest changes to the game state.
 * If in Test Arena mode, the GameInstance class of the GameManager will convert
 * this object to JSON and send it via stdout to the BotBattleApp after each move.
 * 
 * 
 * If in Tournament mode, the GameInstance will append this state to its own
 * JavaGameResults member variable for later processing into the
 * ViewTournamentWebpage
 * @author ambar_000
 * @version 1.0
 * @created 21-Feb-2015 5:15:13 PM
 */
public class JavaGameState {

	/**
	 * html snippet to display the latest state of the game board
	 */
	private String board;
	/**
	 * The latest html snippet used to get Human player’s move in the Test Arena. 
	 */
	private String inputElement;
	/**
	 * Player1’s latest move.  If it was the opponents turn, this is the empty string.
	 */
	private String player1Move;
	/**
	 * Player2’s latest move.  If it was the opponents turn, this is the empty string.
	 */
	private String player2Move;
	/**
	 * Player1’s latest stderr messages. If it was there wasn't any, this is the empty
	 * string.
	 */
	private String player1StdErr;
	/**
	 * Player2’s latest stderr messages. If it was there wasn't any, this is the empty
	 * string.
	 */
	private String player2StdErr;
	/**
	 * Indication of which player, if any has won the game. 0 - No Winner, 1 - Player
	 * 1, 2 - Player 2
	 */
	private int winner;

	public JavaGameState(){

	}

	public void finalize() throws Throwable {

	}

	/**
	 * method for convenient conversion to JSON representation of this Game State
	 */
	public String toJSONString(){
		return "";
	}

}