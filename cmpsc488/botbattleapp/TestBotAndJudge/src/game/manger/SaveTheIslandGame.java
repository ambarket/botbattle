package game.manger;

import java.util.Random;

public class SaveTheIslandGame {
  public static String getStartingBoard() {
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

  // TODO the only thing else that is needed is the shuffle command.
  public static String updateBoard(String move, String board, int player) {
    String updatedBoard = "";
    String[] peices;
    if (move.startsWith("attack")) {
      peices = move.split(";");
      int value = Integer.parseInt(peices[1].substring(0, 1));
      updatedBoard = Board.executeAttack(board, (player == 1 ? 2 : 1), peices[1].length());
    } else if (move.startsWith("retreat")) {
      peices = move.split(";");
      int value = Integer.parseInt(peices[1].substring(0, 1));
      updatedBoard = Board.movePlayer(board, player, -value);
    }

    return updatedBoard;
  }

  public static boolean isGameOver(String board) {
    // This game doesnt have ties so winning is the only way it will end.
    if (isGameWon(board)) {
      return true;
    }

    return false;
  }

  public static boolean isGameWon(String board) {
    String island = Board.getIsland(board);

    if (island.indexOf("1") != -1 && island.indexOf("2") != -1) {
      return false;
    } else {
      return true;
    }
  }

  public static boolean isValidMove(String move, String board, int player) {
    int typeOfMove = 0, tilesForMove = 1;
    String[] peices = move.split(";");

    if (peices.length != 2) {
      return false;
    }

    if (!peices[typeOfMove].equals("attack") && !peices[typeOfMove].equals("retreat")) {
      return false;
    }

    // Check all given tiles are the same
    int tileValue = Integer.parseInt(peices[tilesForMove].substring(0, 1));
    peices[tilesForMove].matches(tileValue + "+");

    // Check player has those tiles
    if (!Board.checkPlayersTiles(board, player, tileValue, peices[tilesForMove].length())) {
      return false;
    }

    return true;
  }


  public static String getHTMLForBoard(String board) {
    // TODO implement getHTML for save the island
    return null;
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

  private static String animatedEventJSON(String event, String objctName, int finalPosition) {
    String output = "\'animatableEvents\' : [{";
    output += "\'event\': \'" + event + "\',\n";
    output += "\'data\': {\n ";
    output += "\'objectName\' : \'" + objctName + "\',\n";
    output += "\'finalPosition\' : " + finalPosition + "}]\n";

    return output;
  }

  private static String gameDataJSON(String player1Tiles, String player2Tiles, String description) {
    String output = "\'gameData' : {\n";
    output += "\t\'player1Tiles\' : \"" + tilesToArray(player1Tiles) + "\",\n";
    output += "\t\'player2Tiles\' : \"" + tilesToArray(player2Tiles) + "\",\n";
    output += "\t\'turnDescription\' : \"" + description + "\"\n}\n";

    return output;
  }

  // TODO: remove new lines and tabs once this gets approved
  public static String getJSONstringFromGameResults(GameResults results) {
    String[] p1Moves = (String[]) results.getPlayer1Moves().toArray();
    String[] p2Moves = (String[]) results.getPlayer2Moves().toArray();
    String board = results.getBoards().get(0);

    String jsonString = "[{";

    jsonString += animatedEventJSON("Initial Board", "None", -1) + ",";
    jsonString +=
        gameDataJSON(Board.getPlayersTiles(1, board), Board.getPlayersTiles(2, board),
            "initial board") + ",";


    for (int i = 1; i < results.getBoards().size(); i++) {
      board = results.getBoards().get(i);

      jsonString += "\'gameData' : {\n";
      jsonString += "\t\'player1Tiles\' : \"" + Board.getPlayersTiles(1, board) + "\",\n";
      jsonString += "\t\'player2Tiles\' : \"" + Board.getPlayersTiles(2, board) + "\",\n";


      if (i % 2 == 1) {
        jsonString += "\t\'turnDescription\' : \"" + p1Moves[i / 2] + "\"\n}\n";
      } else {
        jsonString += "\t\'turnDescription\' : \"" + p2Moves[i / 2] + "\"\n}\n";
      }
    }

    jsonString += "]";

    // [
    // {
    // 'animatableEvents': [
    // {
    // 'event': 'move',
    // 'data': {
    // 'objectName' : 'player1',
    // 'finalPosition' : 9
    // }
    // },
    // ],
    // 'gameData' : {
    // 'player1Tiles' : [1, 3, 5, 5, 3],
    // 'player2Tiles' : [2, 4, 3, 5, 1],
    // 'turnDescription' : "Player 2 used a 3 tile to move to position 11.",
    // },
    // 'debugData' : {
    // lines : [ "An array", "of lines output by the bot", "stderr on this turn." ]
    // },
    // }
    // ]


    return jsonString;
  }

  // -------------------------- BOARD CLASS ---------------------
  static class Board {
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

    public static String replacePlayersTiles(String board, int player, int value, int numOfValues) {
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
      int defenseTiles = 0, distance = getDistanceBetweenPlayers(board);

      for (int i = 0; i < 5; i++) {
        if (Integer.parseInt(tiles.substring(i, i + 1)) == distance) {
          defenseTiles++;
        }

        if (defenseTiles == numOfAttacks) {
          break;
        }
      }

      replacePlayersTiles(board, victim, getDistanceBetweenPlayers(board), defenseTiles);
      numOfAttacks = -(numOfAttacks - defenseTiles);

      return movePlayer(board, victim, numOfAttacks * getDistanceBetweenPlayers(board));
    }
  }
  // ----------------------- END BOARD CLASS ---------------------



}
