import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.Scanner;
import java.util.Random;

public class SaveIslandBot1 {

  public static void main(String[] args) throws FileNotFoundException, UnsupportedEncodingException {
    PrintWriter writer = new PrintWriter("STIBot1.txt", "UTF-8");//TODO: remove testing file
    System.err.print("Test");
    
    writer.println("Process started succesfully.");
    writer.flush();
    writer.close();
    
    Scanner scner = new Scanner(System.in);
    
    String board;
    
    while(scner.hasNextLine()){
        board = scner.nextLine();
        
        writer.println("Board read: " + board);
        writer.flush();
        if(board.equals("exit")){
            break;
        }
        
        String move = getMove(board);
        writer.println("move sent: " + move);
        writer.flush();
        System.out.println(move);

        System.out.flush();
        writer.println("Done sending move");
    }
    writer.println("closeing");
    writer.close();
    
    scner.close();

  }
  
  public static String getMove(String board) {
    String move = "666";
    String components = board.split(";");
    String playerNum = components[0];
    String s = components[1];
    string board = components[1] + ";" + components[2];
    int distance = Board.getDistanceBetweenPlayers(board);
    
    for (int i = 0; i < s.length(); i++) {
        if(Integer.parseInt(s.substring(i, i+1)) == distance) {
          move = "attack;" + s.substring(i, i+1);
          break;
        } else if( Integer.parseInt(s.substring(i, i+1)) < distance ) {
          move = "move;" + s.substring(i, i+1);
        }
    }
    
    if(move.equals("666")){
    	move = "retreat;" + s.substring(0, 1);
    }
    
    return move;
  }
}

 // -------------------------- BOARD CLASS ---------------------
  class Board {
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

      getNewTiles(board, victim, getDistanceBetweenPlayers(board), defenseTiles);

      if (defenseTiles < numOfAttacks) { // Attack was succesful
        int attacker = (victim == 1 ? 2 : 1);
        board = movePlayer(board, attacker, distance - 1);
      }
      numOfAttacks = -(numOfAttacks - defenseTiles);

      return movePlayer(board, victim, numOfAttacks * distance);
    }
  }
  // ----------------------- END BOARD CLASS ---------------------

