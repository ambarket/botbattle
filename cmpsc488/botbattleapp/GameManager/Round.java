package GameManager;


/**
 * Class implementing a convenient data structure of Game Instances
 * @author ambar_000
 * @version 1.0
 * @created 21-Feb-2015 5:15:13 PM
 */
public class Round {

	/**
	 * Class implementing a convenient data structure of Game Instances
	 */
	private Colection<GameInstance> gameInstances;
	public GameInstance m_GameInstance;

	public Round(){

	}

	public void finalize() throws Throwable {

	}

	/**
	 * 
	 * @param gameClass    The dynamically loaded class that implements the IGame
	 * interface required to play the game. Passed to each GameInstance in the round.
	 * @param players    List of players that will be assigned to GameInstance objects
	 * and stored in the gameInstances Collection
	 */
	public Round Round(Class gameClass, Collection<Player> players){
		return null;
	}

	/**
	 * generate and output all HTML/JS for the Round to the specified directory
	 * call outputToHtml(outputDir + "/GameInstanceNum) for each GameInstance
	 * 
	 * @param String
	 */
	public boolean outputToHtml(outputDir String){
		return false;
	}

}