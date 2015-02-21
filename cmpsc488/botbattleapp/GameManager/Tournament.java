package GameManager;


/**
 * @author ambar_000
 * @version 1.0
 * @created 21-Feb-2015 5:15:13 PM
 */
public class Tournament implements Runnable {

	/**
	 * Data structure to store the rounds in the tournament.
	 */
	private Bracket bracket;
	/**
	 * The default move delay to be used during GameInstance playback
	 */
	private int defaultMoveDelay;
	/**
	 * Name of the Game played in the tournament
	 */
	private String gameName;
	/**
	 * Location of the rules.pdf file for the game played in the tournament
	 */
	private String rulesPdfLoc;
	private String tournamentName;
	public Bracket m_Bracket;

	public Tournament(){

	}

	public void finalize() throws Throwable {

	}

	/**
	 * 
	 * @param userList    The list of User JSON objects from the tournamentMetadata
	 * object passed to main()
	 * @param gameClass    The loaded gameClass
	 * 
	 */
	public void Tournament(JSONObject userList, Class gameClass){

	}

	/**
	 * Loop through the Bracket executing Game Instances in turn.
	 */
	public void run(){

	}

	/**
	 * Create tournament directory in private tournaments directory
	 * Output root level html stuff
	 * Call outputToHtml() of the Bracket
	 * 
	 * @param outputDir
	 */
	public boolean outputToHtml(String outputDir){
		return false;
	}

}