package GameManager;


/**
 * Class implementing a convenient data structure of Game Rounds
 * @author ambar_000
 * @version 1.0
 * @created 21-Feb-2015 5:15:13 PM
 */
public class Bracket {

	private Collection<Round> rounds;
	public Round m_Round;

	public Bracket(){

	}

	public void finalize() throws Throwable {

	}

	/**
	 * Parse user list into a collection of Players, Pass these players into the
	 * constructor for the first round.
	 * 
	 * @param userList    passed from tournament
	 * @param gameClass    The dynamically loaded class that implements the IGame
	 * interface required to play the game. Ultimately passed to each GameInstance in
	 * the round.
	 */
	public Bracket Bracket(JSONObject userList, Class gameClass){
		return null;
	}

	/**
	 * generate and output all HTML/JS for the bracket to the specified directory
	 * call outputToHtml(outputDir + "/roundNum") of each Round
	 * 
	 * @param outputDir
	 */
	public boolean outputToHtml(String outputDir){
		return false;
	}

}