package GameManager;


/**
 * @author ambar_000
 * @version 1.0
 * @created 21-Feb-2015 5:15:13 PM
 */
public class Player {

	/**
	 * 0 - Human, 1 - Bot
	 */
	private int type;
	/**
	 * Location of the compiled bot, null if this is a human.
	 */
	private String botFileLoc;
	/**
	 * username of the student in the tournament. "ArenaUser" if this is for a
	 * TestArena instance.
	 */
	private String username;
	/**
	 * Process object for the running bot. null if this is a human player
	 */
	private Process botProcess;
	/**
	 * InputStream from which the GameInstance will receive the players moves. System.
	 * in if human in the testAreana. botProcess.stdout otherwise.
	 */
	private InputStream in;
	/**
	 * The OutputStream to which the state of the gameboard will be sent each turn.
	 * botProcess.stdin if a bot. Null if human. 
	 */
	private OutputStream out;

	public Player(){

	}

	public void finalize() throws Throwable {

	}

	/**
	 * Store the type, username, and botFileLocation
	 * 
	 * @param type
	 * @param username
	 * @param botFileLoc
	 */
	public Player Player(int type, String username, String botFileLoc){
		return null;
	}

}