


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
  
  public void initializeGame(GameType gameType);
  
  public String getInitialGamestate();
  
  public String getMidGamestate();
  
  public String getMidGamestate(String botsStderr);
  
  public String getFinalGamestate(String descriptionOfEnding);

  String getJSONstringFromGameResults(GameResults results);
  
  String getInvalidMoveJSON(String move, int player);
}
