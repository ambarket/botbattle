package GameManager;


/**
 * Implementation of the Game Interface
 * @author ambar_000
 * @version 1.0
 * @created 21-Feb-2015 5:15:13 PM
 */
public class Game implements IGame {

	public Game(){

	}

	public void finalize() throws Throwable {

	}

	public String getBotBoard(){
		return "";
	}

	/**
	 * 
	 * @param move
	 */
	public int updateBoard(String move){
		return 0;
	}

	public String getHumanInputElement(){
		return "";
	}

	public void getHtmlBoard()(){

	}

	/**
	 * Return a string containing the HTML snippet for use in displaying the current
	 * board state in the test arena / tournament viewer.
	 */
	public String getHtmlBoard(){
		return "";
	}

}