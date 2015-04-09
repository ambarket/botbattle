import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.Scanner;


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
    String s = Game.Board.getPlayersTiles(1, board);
    int distance = Game.Board.getDistanceBetweenPlayers(board);
    
    for (int i = 0; i < s.length(); i++) {
        if(Integer.parseInt(s.substring(i, i+1)) == distance) {
          move = "attack;" + s.substring(i, i+1);
          break;
        } else if( Integer.parseInt(s.substring(i, i+1)) < distance ) {
          move = "move;" + s.substring(i, i+1);
        }
    }
    
    
    return move;
}

}
