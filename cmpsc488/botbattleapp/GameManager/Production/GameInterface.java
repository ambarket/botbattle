


/**
 * @author Randall Hudson
 *
 */
public interface GameInterface {

  String getBoard();
  
  void updateBoard(String move, int player);

  boolean isValidMove(String board, int player);

  boolean isGameOver();

  boolean isGameWon();
  
  void setOver(boolean over);
  
  public String getJSONStringForThisTurn(boolean player2IsHuman);
  
  public String getJSONStringForThisTurn(boolean player2IsHuman, String botsStderr);

  String getJSONstringFromGameResults(GameResults results);
  
  String getInvalidMoveJSON();
  
  String getValidMoveJSON();
}
