
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.json.simple.JSONArray;

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
  }

  public void runArenaGame() {
    String rawMove = "", rawStderr = "", jsonSafeMove = "", jsonSafeStderrArray = "";

    //Send starting board to the test arena
    game.initializeGame(gameType);
    System.out.println(game.getInitialGameStateJSON());
    
    while (!game.isGameOver()) {

      int player = game.getPlayerForCurrentTurn();
      
      if (player == 1) {  
        rawMove = bot1.getMove(game.getPlayerOneBoard());  
        rawStderr = bot1.getAnyStderr();
      } else {
    	rawMove = bot2.getMove(game.getPlayerTwoBoard());    
    	rawStderr = bot2.getAnyStderr();
      }
      
      if (rawMove != null) {
        jsonSafeMove =  JSONValue.toJSONString("Player " + player + ": \"" + rawMove + "\"");
      }
      if (rawStderr != null) {
        String[] tmp = rawStderr.split("\n");
        JSONArray tmpArray = new JSONArray();
        for (String s : tmp) {
          tmpArray.add("Player " + player + ": \"" + s + "\"");
        }
    	jsonSafeStderrArray =  JSONValue.toJSONString(tmpArray);
      }
      
      String reasonMoveWasInvalid = game.validateMove(rawMove, player);
      if (reasonMoveWasInvalid == null) {
        game.updateBoard(rawMove, rawStderr, player);
        System.out.println(game.getMidGameStateJSON(jsonSafeMove, jsonSafeStderrArray, player));
      } else {
        System.out.println(getInvalidMoveJSON(jsonSafeMove, jsonSafeStderrArray, player, reasonMoveWasInvalid));
      }
      
      // Temporary debugging info.
      System.err.println(
    	  "\nMOVE:" + rawMove + 
          ", PLAYER: " + player + "\n" + 
          ", STDERR: " + rawStderr + "\n" +
          ", BOARD: " + game.getCompleteBoard());
    }
    
    System.out.println(game.getFinalGameStateJSON());
  }

  @Override
  public String toString() {
    return "ArenaGameInstance [\n\tplayer1=" + bot1 + ",\n\tplayer2=" + bot2 + ",\n game="
        + game.getName()  + "]";
  }
  
  public String getInvalidMoveJSON(String jsonSafeMove, String jsonSafeStderrArray, int player, String reasonInvalid) {
    return "{"
        + "\"messageType\":\"invalidMove\","
        + "\"reason\":\"" + reasonInvalid + "\","
        + "\"player\":\"player" + player + "\","
        + "\"move\":" + jsonSafeMove + ","  
        + "\"stderr\":" + jsonSafeStderrArray + ","
        + "\"humanOrBot\":\"" + ((player == 2 && gameType.equals(GameType.BOT_VS_HUMAN)) ? "human" : "bot") + "\""
        + "}";
  }

}
