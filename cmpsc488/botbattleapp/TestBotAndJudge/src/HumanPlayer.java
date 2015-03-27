

import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.Scanner;

public class HumanPlayer {
  static PrintWriter writer;
  static Scanner scner;
  
  public static void main(String[] args) throws FileNotFoundException, UnsupportedEncodingException {
    writer = new PrintWriter("humanPlayer.txt", "UTF-8");//TODO: remove testing file
    writer.println("Starting");
    writer.flush();
    
    scner = new Scanner(System.in);
    
    while(scner.hasNextLine()){
      //No reading or writing should actually be done here
      //It should be done be getting this processes input and output streams
      // and writing/reading to those
    }
    
    writer.println("Shutting down");
    writer.flush();
   
    scner.close();
    writer.close();
  }
}
