
import java.util.Random;
import org.json.simple.JSONValue;
/*
 * If you want to test a different game then just copy and paste its class here. E.g. if you want to
 * test the save the island game copy everything in SaveTheIsland.java and paste it here. Then just
 * rename the class the Game.
 */

// Save the island
public class Game implements GameInterface {
  private GameType gameType;
	  
  private String lastBoard;
  private String board;
  private String lastRawMove;
  private String lastRawStderr;
  private int lastPlayersTurn;
  
  
  private int shuffleLimit = 20;
  private int player1ShufflesUsed;
  private int player2ShufflesUsed;
  
  // Will be set by updateBoard if the game has been won, or by validateMove
  //    if a bot made an invalid move.
  private String gameOverMessage;  

  // TODO: Remove this from init config bec ause it makes more sense just to specify it here when
  //    writing the game
  @Override
  public int getBotTimeoutInMilliseconds() {
    return 3000;
  }
  
  @Override
  public int getHumanTimeoutInMilliseconds() {
    return 1000 * 60 * 5;
  }
  
  @Override
  public String getName() {
    return "SaveTheIsland";
  }
  
  @Override
  public void initializeGame(GameType gameType) {
    this.gameType = gameType;
    board = getStartingBoard();
    lastBoard = board;
    lastPlayersTurn = 0;
    gameOverMessage = null;
  }
  
  @Override
  public int getPlayerForCurrentTurn() {
	  return lastPlayersTurn % 2 + 1;
  }
  
  @Override
  public boolean isGameOver() {
    if(gameOverMessage != null) {
      return true;
    }
    return false;
  }
  
  @Override
  public String getCompleteBoard() {
    return board;
  }

  @Override
  public String getPlayerOneBoard() {
      return "1;" + Board.getPlayersTiles(1, board) + ";" + Board.getIsland(board);
  }

  @Override
  public String getPlayerTwoBoard() {
      return "2;" + Board.getPlayersTiles(2, board) + ";" + Board.getIsland(board);
  }
  
  @Override
  public void updateBoard(String move, String stderr, int player) {
    lastBoard = board;
    String[] pieces = move.split(";");
 
    if (move.startsWith("shuffle")){
      replacePlayersTiles(Board.getAllNewTiles(board, player), player);
      if (player == 1) {
          player1ShufflesUsed++;
      }
      if (player == 2) {
          player2ShufflesUsed++;
      }
    }
    else {
      int value = Integer.parseInt(pieces[1].substring(0, 1));
      if (move.startsWith("attack")) {
        board = Board.executeAttack(board, (player == 1 ? 2 : 1), pieces[1].length());
      } else if (move.startsWith("retreat")) {
        board = Board.movePlayer(board, player, -value);
        replacePlayersTiles(Board.getNewTiles(board, player, value, 1), player);
      } 
      else {
        board = Board.movePlayer(board, player, value);
        replacePlayersTiles(Board.getNewTiles(board, player, value, 1), player);
      }
    }

    lastPlayersTurn = player;
    lastRawMove = move;
    lastRawStderr = stderr;
    int winner = getWinner();
    if (winner != 0) {
      gameOverMessage = "Player " + winner + " has won the game.";
    }
  }
  

  @Override
  public String getInitialGameStateJSON() {
    String jsonString = "{";
    jsonString += "\"messageType\":\"initialGamestate\",";
    jsonString += "\"enableHumanInput\":false,";
    jsonString += gameDataJSON(Board.getPlayersTiles(1, board), Board.getPlayersTiles(2, board), "The game has started");
    jsonString += "}";

    return jsonString;
  }
  
  @Override
  // If this was called then it was a valid move and the game hasn't been won yet
  public String getMidGameStateJSON(String jsonSafeMove, String jsonSafeStderrArray, int player) {
    String jsonString = "{";

    jsonString += "\"messageType\":\"midGamestate\",";

    String enableHumanInput = (((player % 2) + 1) == 2 && gameType.equals(GameType.BOT_VS_HUMAN)) ? "true" : "false";
    jsonString += "\"enableHumanInput\":" + enableHumanInput + ",";

    jsonString += "\"animatableEvents\":[" + animatedEventJSON(lastRawMove.split(";")[0], player) + "],";
    
    jsonString += gameDataJSON(Board.getPlayersTiles(1, board), Board.getPlayersTiles(2, board),
              prettyPrintMove(lastRawMove, player)) + ",";

    String jsonSafeBoard = JSONValue.toJSONString(board);

    jsonString += "\"debugData\" : {" +
    				   "\"board\" : " + jsonSafeBoard + "," +
                       "\"stderr\" :" + jsonSafeStderrArray + "," +
                       "\"stdout\" :" + jsonSafeMove + "}}";
    return jsonString;
  }
  
  @Override
  public String getFinalGameStateJSON() {
    String jsonString = "{";
    jsonString += "\"messageType\":\"finalGamestate\",";
    jsonString += "\"enableHumanInput\":false,";
    jsonString += gameDataJSON(Board.getPlayersTiles(1, board), Board.getPlayersTiles(2, board), gameOverMessage);
    jsonString += "}";

    return jsonString;
  }
  
  @Override
  // TODO: Not relevant for test arena, maybe remove from this class.
  public String getJSONstringFromGameResults(GameResults results) {
    Object[] p1Moves = results.getPlayer1Moves().toArray();
    Object[] p2Moves = results.getPlayer2Moves().toArray();
    String board = results.getBoards().get(0);
    String desc = "";
    String animation = "";
    String jsonString = "[{";

    jsonString += animatedEventJSON("Initial Board", -1) + ",";
    jsonString +=
        gameDataJSON(Board.getPlayersTiles(1, board), Board.getPlayersTiles(2, board),
            "initial board") + "}";


    for (int i = 1; i < results.getBoards().size(); i++) {
      jsonString += ",{";
      board = results.getBoards().get(i);

      if (i % 2 == 1) {
        desc = prettyPrintMove((String) p1Moves[i / 2], 1);
        animation = animatedEventJSON((String) p1Moves[i / 2], 1);
      } else {
        desc = prettyPrintMove((String) p2Moves[i / 2], 2);
        animation = animatedEventJSON((String) p1Moves[i / 2], 2);
      }
      jsonString += animation + ",";
      jsonString +=
          gameDataJSON(Board.getPlayersTiles(1, board), Board.getPlayersTiles(2, board), desc)
              + "}";
    }

    jsonString += "]";

    return jsonString;
  }

  public String getStartingBoard() {
    Random rng = new Random();
    String board = "";

    for (int i = 0; i < 5; i++) {
      board += rng.nextInt(4) + 1;
    }
    board += ";1";

    for (int i = 0; i < 13; i++) {
      board += "0";
    }
    board += "2;";
    for (int i = 0; i < 5; i++) {
      board += rng.nextInt(4) + 1;
    }

    return board;
  }
  
  public boolean isGameWon() {
    String island = Board.getIsland(board);

    if (island.indexOf("1") != -1 && island.indexOf("2") != -1) {
      return false;
    } else {
      return true;
    }
  }
  
  /**
   * @return 
   *    0 if both players are on the board
   *    1 if player 1 has won the game
   *    2 if player 2 has won the game
   */
  private int getWinner() {
    String island = Board.getIsland(board);
    if (island.indexOf("1") == -1) {
      return 2;
    }
    else if (island.indexOf("2") == -1) {
      return 1;
    }
    else {
      return 0;
    }
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



  @Override
  public String validateMove(String move, int player) {
    return validateMove(move, player, board);
  }
  
  // Used for internally for validation on a previous board.
  protected String validateMove(String move, int player, String board) {
    if (move == null) {
      disqualifyPlayerIfABot(player);
      return "The action was null.";
    }

    short TYPE_OF_MOVE = 0, TILES_USED = 1;
   
    int tileValue;
    String typeOfMove;
    String[] pieces;
    // Attempt to get value for tile, if it doesn't parse then not a valid move
    try {
      pieces = move.split(";");
      typeOfMove = pieces[TYPE_OF_MOVE].toLowerCase();
      if (typeOfMove.equals("shuffle")) {
        if (player == 1 && player1ShufflesUsed >= shuffleLimit || player == 2 && player2ShufflesUsed >= shuffleLimit ) {
          disqualifyPlayerIfABot(player);
          return "You have exceeded the shuffle limit of " + shuffleLimit + " for the current game.";
        } else {
            return null;
        }
      }
      else {
        tileValue = Integer.parseInt(pieces[TILES_USED].substring(0, 1));
      }
    } catch (Exception e) {
      disqualifyPlayerIfABot(player);
      return "An exception was thrown trying to parse action, check your syntax.";
    }

    if (pieces.length != 2) {
      disqualifyPlayerIfABot(player);
      return "The syntax was incorrect, should be something like move;3 or attack;22";
    }

    
    if (!typeOfMove.equals("attack") && !typeOfMove.equals("move") && !typeOfMove.equals("retreat")) {
      disqualifyPlayerIfABot(player);
      return "The type of action was unrecognized, should be attack, move, or retreat.";
    }

    if (typeOfMove.equals("attack")) {
      // Check all given tiles are the same
      if (!pieces[TILES_USED].matches(tileValue + "+")) {
        disqualifyPlayerIfABot(player);
        return "The tiles given for attack must all be the same.";
      }

      // Check that the other player is the correct distance away
      if (tileValue != Board.getDistanceBetweenPlayers(board)) {
        disqualifyPlayerIfABot(player);
        return "When attacking the tiles selected must be equal to the distance from player 2 to player 1.";
      }
    } else if (typeOfMove.equals("move") || typeOfMove.equals("retreat")) {
      // Can only move or retreat by one tile
      if (pieces[TILES_USED].length() != 1) {
        disqualifyPlayerIfABot(player);
        return "When moving or retreating only one tile may be used.";
      }
      if (typeOfMove.equals("move") && Board.getDistanceBetweenPlayers(board) <= tileValue) {
          disqualifyPlayerIfABot(player);
          return "You may not move to or past the opposing player.";
      }
    } 
    else {
      // Un recognized move type
      disqualifyPlayerIfABot(player);
      return "The type of action was unrecognized, should be attack, move, or retreat.";
    }

    // Check player has those tiles
    if (!Board.checkPlayersTiles(board, player, tileValue, pieces[TILES_USED].length())) {
      disqualifyPlayerIfABot(player);
      return "You do not have the tiles you are trying to use.";
    }
    
    return null; // Valid move
  }
  
  private void disqualifyPlayerIfABot(int player) {
    if (player == 1 || (gameType.equals(GameType.BOT_VS_BOT) && player == 2)) {
      gameOverMessage = "Player " + player + " was disqualified after making an invalid move.";
    }
  }
  
  public static int getOtherPlayer(int player) {
    return ( player == 1 ? 2 : 1 );
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
  
  protected String getAnimatedEventElement(String event, int player) {
    return getAnimatedEventElement(event, player, Board.getPlayersPosition(lastBoard, player), Board.getPlayersPosition(board, player));
  }

  protected String getAnimatedEventElement(String event, int player, int startPos, int endPos) {
    String json = "{" +
        "\"event\":\"" + event + "\"," + 
        "\"data\":{" +
            "\"player\":\"player" + player + "\"," + 
            "\"endPosition\":" + endPos + "," +
            "\"startPosition\":" + startPos +
        "}}";
    
    return json;
  }

  protected String animatedEventJSON(String event, int player) {
    String json = "";
    
    if(event.equals("move")) {
      json = getAnimatedEventElement("move", player);
    } else if(event.equals("retreat")) {
      json = getAnimatedEventElement("move", player);
    } else if(event.equals("attack")) {
      
      if(Board.getIsland(board).equals(Board.getIsland(lastBoard))) {
        json = getAnimatedEventElement("move", player, Board.getPlayersPosition(board, player), Board.getAttackPositionForPlayer(player, board)) + ",";
        json += getAnimatedEventElement("defendedAttack", player)+ ",";
        json += getAnimatedEventElement("fallback", player);
      } else {
        json = getAnimatedEventElement("move", player) + ",";
        json += getAnimatedEventElement("successfulAttack", player)+ ",";
        json += getAnimatedEventElement("fallback", getOtherPlayer(player));
      } 
    } 
    
    return json;
  }

  protected String gameDataJSON(String player1Tiles, String player2Tiles, String description) {
    String output =
        "\"gameData\" : {" + 
            "\"player1Tiles\" : " + tilesToArray(player1Tiles) + "," +
            "\"player2Tiles\" : " + tilesToArray(player2Tiles) + "," + 
            "\"turnDescription\" : \"" + description + 
         "\"}";

    return output;
  }

  protected String prettyPrintMove(String move, int player) {
    String output = "Player " + player + " ";
    String tiles;

    if (move.startsWith("shuffle")) {
      output += "shuffles tiles.";
    } 
    else {
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

    }
    return output;
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
      String playerString = (player == 1 ? "1" : "2");
      int pos = island.indexOf(playerString);
      if(pos == -1 && player == 2){
    	  return island.length() + 2;
      }
      return pos;
    }
    
    public static int getAttackPositionForPlayer(int player, String board) {
      int direction = 1;
      int distance = getDistanceBetweenPlayers(board);
      if( player == 2 ) {
        direction = -1;
      }
      
      return getPlayersPosition(board, player) + (direction * ( distance - 1 ));
    }

    public static String getNewTiles(String board, int player, int value, int numOfValues) {
      Random rng = new Random();

      String tiles = getPlayersTiles(player, board);
      String newTiles = "";

      for (int i = 0; i < tiles.length(); i++) {
        if (Character.getNumericValue(tiles.charAt(i)) == value && numOfValues > 0) {
          newTiles += rng.nextInt(4) + 1;
          numOfValues--;
        } else {
          newTiles += tiles.charAt(i);
        }
      }

      return newTiles;
    }
    
    public static String getAllNewTiles(String board, int player) {
        Random rng = new Random();
        String newTiles = "";

        for (int i = 0; i < 5; i++) {
            newTiles += rng.nextInt(4) + 1;
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
        if (Character.getNumericValue(tiles.charAt(i)) == distance) {
          defenseTiles++;
        }

        if (defenseTiles == numOfAttacks) {
          break;
        }
      }
      
      int numOfSucesfullAttacks = numOfAttacks - defenseTiles;
      
      if (numOfSucesfullAttacks > 0) { // Attack was succesful       
        board = movePlayer(board, attacker, distance - 1);
        board = movePlayer(board, victim, -numOfSucesfullAttacks * 3);
      } 
      
      board = getNewTilesAndReplace(board, victim, distance, defenseTiles);
      board = getNewTilesAndReplace(board, attacker, distance, numOfAttacks);
      
      return board; 
    }
  }
  // ----------------------- END BOARD CLASS ---------------------
}
