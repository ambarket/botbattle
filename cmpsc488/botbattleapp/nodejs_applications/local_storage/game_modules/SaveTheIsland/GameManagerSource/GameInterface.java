


/**
 * @author Randall Hudson
 *
 */

// TODO Game.getBotTimeoutInMilliseconds is a static method that isn't in this interface but used by Player class.

public interface GameInterface {
 
  /**
   * 
   * @return A user friendly game name. E.g. Save The Island or Tic-Tac-Toe
   */
  public String getName();
  
  /**
   * Called before any other interface methods. Must setup the game to be ready to
   * play. Most likely involves initializing the board and any private members.
   * @param gameType A GameType enum specifying BotVsBot or BotVsHuman.
   */
  public void initializeGame(GameType gameType);
  
  /**
   * Called after initializeGame and before the main game loop starts. Must generate
   * a valid JSON GameState object as defined in the documentation. The receipt of this
   * GameState will trigger the client javascript to call GAME.resetGameboard, and then
   * pass this GameState along to GAME.processGameData, GAME.processDebugData, GAME.processAnimatableEvent
   * @return A string containing a valid JSON GameState.
   */
  public String getInitialGameStateJSON();
  
  /**
   * Used as the control for the main game loop. Once this returns true, the
   * game is considered over and the GameInstance will call getFinalGameStateJSON.
   * @return
   */
  boolean isGameOver();

  String getCompleteBoard();
  
  String getPlayerOneBoard();
  
  String getPlayerTwoBoard();
  
  /**
   *  Must return null if it was a valid move. If invalid you may provide a string
   *  indicating the reason the move was invalid. This will be logged on the client side.
   * @param move
   * @param player
   * @return
   */
  public String validateMove(String move, int player);
  
  /**
   * Will be called only if move was valid according to validateMove. Expected to
   * evaluate and store any changes to the game state as a result of this move.
   * Note: getMidGamestate will be called immediately after this.
   * @param move
   * @param player
   */
  void updateBoard(String move, String botsStderr, int player);




  
  

  
  public String getMidGameStateJSON();
  
  public String getFinalGameStateJSON();

  String getJSONstringFromGameResults(GameResults results);
}
