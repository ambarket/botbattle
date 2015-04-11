
import java.util.Random;

/*
 * If you want to test a different game then just copy and paste its class here. E.g. if you want to
 * test the save the island game copy everything in SaveTheIsland.java and paste it here. Then just
 * rename the class the Game.
 */

// Save the island
public class Game implements GameInterface {
  
  private String lastBoard;
  private String board;
  private String lastMove;
  private int lastPlayersTurn;
  private boolean over;

  public Game() {
    board = getStartingBoard();
    lastBoard = board;
    lastPlayersTurn = 0;
    lastMove = "";
    over = false;
  }

  public String getStartingBoard() {
    Random rng = new Random();
    String board = "";

    for (int i = 0; i < 5; i++) {
      board += rng.nextInt(6);
    }
    board += ";1";

    for (int i = 0; i < 23; i++) {
      board += "0";
    }
    board += "2;";
    for (int i = 0; i < 5; i++) {
      board += rng.nextInt(6);
    }

    return board;
  }

  public String getBoard() {
    return board;
  }

  public void updateBoard(String move, int player) {
    lastBoard = board;
    String[] peices = move.split(";");
 
    int value = Integer.parseInt(peices[1].substring(0, 1));
    if (move.startsWith("attack")) {
      board = Board.executeAttack(board, (player == 1 ? 2 : 1), peices[1].length());
    } else if (move.startsWith("retreat")) {
      board = Board.movePlayer(board, player, -value);
      replacePlayersTiles(Board.getNewTiles(board, player, value, 1), player);
    } else if (move.startsWith("move")) {
      board = Board.movePlayer(board, player, value);
      replacePlayersTiles(Board.getNewTiles(board, player, value, 1), player);
    }

    lastPlayersTurn = player;
  }
  
  protected void replacePlayersTiles(String newTiles, int player) {
    if(player == 1) {
      board = newTiles + ";" + Board.getIsland(board) + ";" + Board.getPlayersTiles(2, board);
    } else {
      board = Board.getPlayersTiles(1, board) + ";" + Board.getIsland(board) + ";" + newTiles;
    }
  }

  protected void setBoard(String newBoard) {
    board = newBoard;
  }
  
  public boolean isGameOver() {
    
    if(over) {
      return true;
    }
    
    // This game doesnt have ties so winning is the only way it will end.
    if (isGameWon()) {
      return true;
    }

    return false;
  }

  public void setOver(boolean over) {
    this.over = over;
  }

  public boolean isGameWon() {
    String island = Board.getIsland(board);

    if (island.indexOf("1") != -1 && island.indexOf("2") != -1) {
      return false;
    } else {
      return true;
    }
  }

  public boolean isValidMove(String move, int player) {

    if (move == null) {
      return false;
    }

    short TYPE_OF_MOVE = 0, TILES_USED = 1;
    String[] peices = move.split(";");
    int tileValue;

    // Attempt to get value for tile, if it doesn't parse then not a valid move
    try {
      tileValue = Integer.parseInt(peices[TILES_USED].substring(0, 1));
    } catch (Exception e) {
      return false;
    }

    if (peices.length != 2) {
      return false;
    }

    String typeOfMove = peices[TYPE_OF_MOVE].toLowerCase();
    if (!typeOfMove.equals("attack") && !typeOfMove.equals("move") && !typeOfMove.equals("retreat")) {
      return false;
    }

    if (typeOfMove.equals("attack")) {
      // Check all given tiles are the same
      if (!peices[TILES_USED].matches(tileValue + "+")) {
        return false;
      }

      // Check that the other player is the correct distance away
      if (tileValue != Board.getDistanceBetweenPlayers(board)) {
        return false;
      }
    } else if (typeOfMove.equals("move") || typeOfMove.equals("retreat")) {
      // Can only move or retreat by one tile
      if (peices[TILES_USED].length() != 1) {
        return false;
      }
    } else {
      // Un recognized move type
      return false;
    }

    // Check player has those tiles
    if (!Board.checkPlayersTiles(board, player, tileValue, peices[TILES_USED].length())) {
      return false;
    }

    return true;
  }

  public boolean isValidMove2(String move, int player) {

    if (move == null) {
      return false;
    }

    short TYPE_OF_MOVE = 0, TILES_USED = 1;
    String[] peices = move.split(";");
    int tileValue;

    // Attempt to get value for tile, if it doesn't parse then not a valid move
    try {
      tileValue = Integer.parseInt(peices[TILES_USED].substring(0, 1));
    } catch (Exception e) {
      return false;
    }

    if (peices.length != 2) {
      return false;
    }

    String typeOfMove = peices[TYPE_OF_MOVE].toLowerCase();
    if (!typeOfMove.equals("attack") && !typeOfMove.equals("move") && !typeOfMove.equals("retreat")) {
      return false;
    }

    if (typeOfMove.equals("attack")) {
      // Check all given tiles are the same
      if (!peices[TILES_USED].matches(tileValue + "+")) {
        return false;
      }

      // Check that the other player is the correct distance away
      if (tileValue != Board.getDistanceBetweenPlayers(lastBoard)) {
        return false;
      }
    } else if (typeOfMove.equals("move") || typeOfMove.equals("retreat")) {
      // Can only move or retreat by one tile
      if (peices[TILES_USED].length() != 1) {
        return false;
      }
    } else {
      // Un recognized move type
      return false;
    }

    // Check player has those tiles
    if (!Board.checkPlayersTiles(lastBoard, player, tileValue, peices[TILES_USED].length())) {
      return false;
    }

    return true;
  }
  
  public static int getBotTimeoutInMilliseconds() {
    return 3000;
  }

  public static String getName() {
    return "SaveTheIsland";
  }

  private static String tilesToArray(String tiles) {
    String output = "[";
    output += tiles.substring(0, 1) + ", ";
    output += tiles.substring(1, 2) + ", ";
    output += tiles.substring(2, 3) + ", ";
    output += tiles.substring(3, 4) + ", ";
    output += tiles.substring(4) + "]";
    return output;
  }

  protected static String animatedEventJSON(String event, int player, int finalPosition) {
    String output =
        "\"animatableEvents\" : [{" + 
              "\"event\": \"" + event + "\"," + 
              "\"data\": { " +
                  "\"player\" : " + player + "," + 
                  "\"finalPosition\" : " + finalPosition +
             "}}]";

    return output;
  }

  protected static String gameDataJSON(String player1Tiles, String player2Tiles, String description) {
    String output =
        "\"gameData\" : {" + 
            "\"player1Tiles\" : " + tilesToArray(player1Tiles) + "," +
            "\"player2Tiles\" : " + tilesToArray(player2Tiles) + "," + 
            "\"turnDescription\" : \"" + description + 
         "\"}";

    return output;
  }

  protected static String prettyPrintMove(String move, int player) {
    String output = "Player " + player + " ";
    String tiles;

    try {
      tiles = move.split(";")[1];
    } catch (Exception e) {
      return "Invalid Move: " + move;
    }

    if (move.startsWith("attack")) {
      output += "attacks with ";

      switch (tiles.length()) {
        case 1:
          output += "one " + tiles + " tile.";
          break;
        case 2:
          output += "two " + tiles.substring(0, 1) + " tiles.";
          break;
        case 3:
          output += "three " + tiles.substring(0, 1) + " tiles.";
          break;
        case 4:
          output += "four " + tiles.substring(0, 1) + " tiles.";
          break;
        case 5:
          output += "five " + tiles.substring(0, 1) + " tiles.";
          break;
        default:
          break;
      }
    } else if (move.startsWith("move")) {
      output += "moves forward " + tiles + " spaces.";
    } else if (move.startsWith("retreat")) {
      output += "retreats " + tiles + " spaces.";
    }

    return output;
  }

  private String getType(String move, int player) {
    String s = "\"type\": ";
    if (player == 0) { // initial
      s += "\"initial\"";
    } else if (isGameOver()) { // final
      s += "\"final\"";
    } else {
      s += "\"midGame\"";
    }

    return s;
  }

  public String getJSONStringForThisTurn() {
      return getJSONStringForThisTurn("None");
  }
  
  public String getJSONStringForThisTurn(String botsStderr) {
    String move = lastMove;
    int player = lastPlayersTurn;
    String jsonString = "{";

    int finalPos = Board.getIsland(board).indexOf(String.valueOf(player));

    jsonString += getType(move, player) + ",";
    jsonString += "\"nextTurn\": \"player" + ((player % 2) + 1) + "\",";

    if (move == null) {//TODO fix this to reflect correct requirements
      jsonString += animatedEventJSON("null Move", player, finalPos) + ",";
    } else {
      jsonString += animatedEventJSON(move.split(";")[0], player, finalPos) + ",";
    }
    
    if (isValidMove2(move, player)) {
      jsonString +=
          gameDataJSON(Board.getPlayersTiles(1, board), Board.getPlayersTiles(2, board),
              prettyPrintMove(move, player)) + ",";
    } else {
      jsonString +=
          gameDataJSON(Board.getPlayersTiles(1, board), Board.getPlayersTiles(2, board),
              "Invalid Move") + ",";
    }


    jsonString += "\"debugData\" : {" +
                       "\"stderr\" : [\"" + botsStderr + "\"]," +
                       "\"stdout\" : [\"" + move + 
                  "\"]}}";
    return jsonString;
  }
  
  public String getJSONstringFromGameResults(GameResults results) {
    Object[] p1Moves = results.getPlayer1Moves().toArray();
    Object[] p2Moves = results.getPlayer2Moves().toArray();
    String board = results.getBoards().get(0);
    String desc = "";
    String animation = "";
    String jsonString = "[{";

    jsonString += animatedEventJSON("Initial Board", -1, -1) + ",";
    jsonString +=
        gameDataJSON(Board.getPlayersTiles(1, board), Board.getPlayersTiles(2, board),
            "initial board") + "}";


    for (int i = 1; i < results.getBoards().size(); i++) {
      jsonString += ",{";
      board = results.getBoards().get(i);

      if (i % 2 == 1) {
        desc = prettyPrintMove((String) p1Moves[i / 2], 1);
        animation = animatedEventJSON((String) p1Moves[i / 2], 1, 666);
      } else {
        desc = prettyPrintMove((String) p2Moves[i / 2], 2);
        animation = animatedEventJSON((String) p1Moves[i / 2], 2, 666);
      }
      jsonString += animation + ",";
      jsonString +=
          gameDataJSON(Board.getPlayersTiles(1, board), Board.getPlayersTiles(2, board), desc)
              + "}";
    }

    jsonString += "]";

    return jsonString;
  }
  
  @Override
  public String getInvalidMoveJSON() {
    
    return "{"
        + "\"messagetype:\"humanInputValidation\","
        + "\"valid\":\"false\","
        + "\"reason\":\"Not yet implemented\","
        + "}";
  }
  
  @Override
  public String getValidMoveJSON() {
    
    return "{"
        + "\"messagetype:\"humanInputValidation\","
        + "\"valid\":\"true\","
        + "\"reason\":\"\","
        + "}";
  }
  
  // -------------------------- BOARD CLASS ---------------------
  public static class Board {
    public static String getPlayersTiles(int player, String board) {
      if (player == 1) {
        return board.split(";")[0];
      } else {
        return board.split(";")[2];
      }
    }

    public static String getIsland(String board) {
      return board.split(";")[1];
    }

    public static int getDistanceBetweenPlayers(String board) {
      String island = getIsland(board);
      String distance = island.substring(island.indexOf("1"), island.indexOf("2") + 1);

      return distance.length() - 1;
    }
    
    public static int getPlayersPosition(String board, int player) {
      String island = getIsland(board); 

      return island.indexOf(player);
    }

    public static String getNewTiles(String board, int player, int value, int numOfValues) {
      Random rng = new Random();

      String tiles = getPlayersTiles(player, board);
      String newTiles = "";

      for (int i = 0; i < 5; i++) {
        if (Integer.parseInt(tiles.substring(i, i + 1)) == value && numOfValues > 0) {
          newTiles += rng.nextInt(6);
          numOfValues--;
        } else {
          newTiles += tiles.substring(i, i + 1);
        }
      }

      return newTiles;
    }

    public static String getNewTilesAndReplace(String board, int player, int value, int numOfValues) {

      String p1 = Board.getPlayersTiles(1, board),
          p2 = Board.getPlayersTiles(2, board),
          island = Board.getIsland(board);
      
      if(player == 1){
        p1 = getNewTiles(board, player, value, numOfValues);
      } else {
        p2 = getNewTiles(board, player, value, numOfValues);
      }   
      
      return p1 + ";" + island + ";" + p2;
    }
    
    public static boolean checkPlayersTiles(String board, int player, int value, int numOfValues) {
      String tiles = getPlayersTiles(player, board);
      int count = 0;

      for (int i = 0; i < 5; i++) {
        if (Integer.parseInt(tiles.substring(i, i + 1)) == value) {
          count++;
        }
      }

      return count >= numOfValues;
    }

    public static String movePlayer(String board, int player, int distance) {
      char[] island = getIsland(board).toCharArray();
      int index = getIsland(board).indexOf(String.valueOf(player));

      if (player == 2) {
        distance = -distance;
      }

      island[index] = '0';
      if (index + distance >= 0 && index + distance < island.length) {
        island[index + distance] = String.valueOf(player).charAt(0);
      }// else player got knocked off the island


      return getPlayersTiles(1, board) + ";" + String.valueOf(island) + ";"
          + getPlayersTiles(2, board);
    }

    public static String executeAttack(String board, int victim, int numOfAttacks) {
      String tiles = getPlayersTiles(victim, board);
      int attacker = (victim == 1 ? 2 : 1);
      int defenseTiles = 0, distance = getDistanceBetweenPlayers(board);

      for (int i = 0; i < 5; i++) {
        if (Integer.parseInt(tiles.substring(i, i + 1)) == distance) {
          defenseTiles++;
        }

        if (defenseTiles == numOfAttacks) {
          break;
        }
      }
      
      if (defenseTiles < numOfAttacks) { // Attack was succesful       
        board = movePlayer(board, attacker, distance - 1);
      }
      
      int numOfSucesfullAttacks = -(numOfAttacks - defenseTiles);      
      board  = movePlayer(board, victim, numOfSucesfullAttacks * distance);
      board = getNewTilesAndReplace(board, victim, distance, defenseTiles);
      board = getNewTilesAndReplace(board, attacker, distance, numOfAttacks);
      
      return board; 
    }
  }
  // ----------------------- END BOARD CLASS ---------------------
}
