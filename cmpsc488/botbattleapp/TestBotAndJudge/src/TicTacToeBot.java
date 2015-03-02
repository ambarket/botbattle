
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.Scanner;

public class TicTacToeBot{

	static boolean temp;
	
	public static void main(String[] args) throws FileNotFoundException, UnsupportedEncodingException{
		temp = Boolean.parseBoolean(args[0]);
		PrintWriter writer = new PrintWriter("the-file-name.txt", "UTF-8");
		PrintWriter writer2 = new PrintWriter("the-file-name2.txt", "UTF-8");
		writer2.println("test ");
		writer2.close(); 
		Scanner scner = new Scanner(System.in);
		
		String board;
		
		while(scner.hasNext()){
			board = scner.nextLine();
			board = scner.nextLine();
			writer.println("Board read: " + board);
			writer.flush();
			if(board.equals("exit")){
				break;
			}
			
			String move = getMove(board);
			writer.println("move sent: " + move);
			writer.flush();
			System.out.print(move + "\r\n");
			System.out.println(move);
			System.out.flush();
			writer.println("Done sending move");
		}
		writer.println("closeing");
		writer.close();
	}
	

	public static String getMove(String board) {
		int row = 1, col = 1;
		int i = 0;
		for (char c : board.toCharArray()) {
			if(c == '0'){
				String move = row + ", " + col + ", " + (temp ? "X" : "O");
				return move;
			}
			
			col++;
			if(col == 4){
				col = 1;
				row++;
			}
		}
		
		
		// TODO Auto-generated method stub
		return null;
	}

}
