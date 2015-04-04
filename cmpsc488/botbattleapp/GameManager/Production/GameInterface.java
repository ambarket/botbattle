


/**
 * @author Randall Hudson
 *
 */
public interface GameInterface {
		
  String getStartingBoard();

  String updateBoard(String move, String board, int player);

  boolean isValidMove(String move, String board, int player);

  boolean isGameOver(String board);

  boolean isGameWon(String board);
  
  public String getJSONStringForThisTurn(String board, String move, int player);

  String getJSONstringFromGameResults(GameResults results);

}
