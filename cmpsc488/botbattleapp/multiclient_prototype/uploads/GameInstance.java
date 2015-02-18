package GameManager;


/**
 * @author ambar_000
 * @version 1.0
 * @created 05-Feb-2015 3:48:49 AM
 */
public class GameInstance implements Runnable {

	/**
	 * 0 - test arena, 1 - tournament
	 */
	private int mode;
	/**
	 * The dynamically loaded class that implements the IGame interface required to
	 * play the game.
	 */
	private Class gameClass;
	private Player player1;
	private Player player2;
	/**
	 * This should be system.out if this is a test arena game instance, otherwise null
	 */
	private OutputStream testArenaOutput;
	/**
	 * This will be appended to after each turn of a tournament GameInstance. If this
	 * is for a test arena instance, it will be null.
	 */
	private JavaGameResults tournamentOutput;
	public Player m_Player;
	public JavaGameResults m_JavaGameResults;
	public Game m_Game;

	public GameInstance(){

	}

	public void finalize() throws Throwable {

	}

	/**
	 * 
	 * @param mode    0 - Test Arena, 1 - Tournament.
	 * If test arena JavaGameStates will be sent as JSON through System.out
	 * (testArenaOutput) to the BotBattleApp.
	 * If tournament output will be appended to the tournamentOutput JavaGameResults
	 * member variable
	 * @param gameClass
	 * @param player1
	 * @param player2
	 */
	public GameInstance GameInstance(int mode, Class gameClass, Player player1, Player player2){
		return null;
	}

	/**
	 * Output this GameInstance as HTML/JS files to the specified directory.
	 * Return false if an error occured, true otherwise.
	 * 
	 * @param outputLoc    Directory to store this GameInstance in.
	 */
	public boolean outputToHtml(String outputLoc){
		return false;
	}

	/**
	 * Initialize a new Game object using the GameClass
	 * Start running the bots.
	 * Run the GameInstance
	 */
	public void run(){

	}

}