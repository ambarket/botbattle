

public class ArenaGameInstance {
  
  private Player bot1;
  private Player bot2;
  private GameInterface game;
  private GameType gameType;


  public ArenaGameInstance(Player bot1, Player bot2, GameType gameType) {
    this.bot1 = bot1;
    this.bot2 = bot2;
    this.gameType = gameType;
    game = new Game();
    
    bot1.sendPlayerNumber(1);
    bot2.sendPlayerNumber(2);
  }

  public void runArenaGame() {
    int i = 0;    
    String move = "", stderr = "";

    //Send starting board to the test arena
    game.initializeGame(gameType);
    System.out.println(game.getInitialGameStateJSON());
    
    while (!game.isGameOver()) {

      int player = (i % 2) + 1;
      
      if (player == 1) {  
        move = bot1.getMove(game.getPlayerOneBoard());  
        stderr = bot1.getAnyStderr();
      } else {
        move = bot2.getMove(game.getPlayerTwoBoard());    
        stderr = bot2.getAnyStderr();
      }
      
      // TODO: Use library to perform proper JSON cleaning of move and stderr.
      if (move != null) {
        move = move.replace("\n", "\\n"); 
        move = move.replace("\"", "\\\"");
      }
      if (stderr != null) {
        stderr = stderr.replace("\n", "\\n");
        stderr = stderr.replace("\"", "\\\"");
      }
      
      String reasonMoveWasInvalid = game.validateMove(move, player);
      if (reasonMoveWasInvalid == null) {
        game.updateBoard(move, stderr, player);
        System.out.println(game.getMidGameStateJSON());
        i++;
      } else {
        System.out.println(getInvalidMoveJSON(move, stderr, player, reasonMoveWasInvalid));
      }
      
      // Temporary debugging info.
      System.err.println("\nMOVE:" + move + 
          ", PLAYER: " + player + "\n" + 
          ", STDERR: " + stderr + "\n" +
          ", BOARD: " + game.getCompleteBoard());
    }
    
    System.out.println(game.getFinalGameStateJSON());
  }

  @Override
  public String toString() {
    return "ArenaGameInstance [\n\tplayer1=" + bot1 + ",\n\tplayer2=" + bot2 + ",\n game="
        + game.getName()  + "]";
  }
  
  public String getInvalidMoveJSON(String move, String stderr, int player, String reasonInvalid) {
    return "{"
        + "\"messageType\":\"invalidMove\","
        + "\"reason\":\"" + reasonInvalid + "\","
        + "\"player\":\"player" + player + "\","
        + "\"move\":\"" + move + "\","  
        + "\"stderr\":\"" + stderr + "\","  
        + "\"humanOrBot\":\"" + ((player == 2 && gameType.equals(GameType.BOT_VS_HUMAN)) ? "human" : "bot") + "\""
        + "}";
  }

}
