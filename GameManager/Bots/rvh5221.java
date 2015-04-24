

import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.Scanner;

public class rvh5221 {

static boolean temp;
	
	public static void main(String[] args) throws FileNotFoundException, UnsupportedEncodingException{
		temp = true;

		PrintWriter writer = new PrintWriter("the-file-name1.txt", "UTF-8");//TODO: remove testing file
		
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
			System.out.print(move + "\r\n");

			System.out.flush();
			writer.println("Done sending move");
		}
		writer.println("closeing");
		writer.close();
		
		scner.close();
	}
	

	public static String getMove(String board) {
		int row = 1, col = 1;

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
		return null;
	}
}
