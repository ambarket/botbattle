import java.util.Scanner;

public class SaveIslandBot1 {
  public static int player;
  public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in);
    String board;
    
    while(scanner.hasNextLine()){
        board = scanner.nextLine();
        System.err.println(board);
        System.out.println(getMove(board));
    }
    
    scanner.close();
  }
  
  public static String getMove(String board) {
    String move = "";
    String[] components = board.split(";");
    String playerNum = components[0];
    String tiles = components[1];
    String island = components[2];
    int distance = island.indexOf("2") - island.indexOf("1");
    
    for (int i = 0; i < tiles.length(); i++) {
        if(Integer.parseInt(tiles.substring(i, i+1)) == distance) {
          move = "attack;" + tiles.substring(i, i+1);
          break;
        } else if( Integer.parseInt(tiles.substring(i, i+1)) < distance ) {
          move = "move;" + tiles.substring(i, i+1);
        }
    }
    
    if(move.equals("")){
    	move = "retreat;" + tiles.substring(0, 1);
    }
    
    return move;
  }
}