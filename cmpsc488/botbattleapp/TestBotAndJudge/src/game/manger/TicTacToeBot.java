package game.manger;

import java.util.Scanner;

public class TicTacToeBot{

	static boolean temp;
	
	public static void main(String[] args){
		temp = Boolean.parseBoolean(args[0]);
				
		Scanner scner = new Scanner(System.in);
		
		String board;
		
		while(scner.hasNext()){
			board = scner.nextLine();
			
			if(board.equals("exit")){
				break;
			}
			
			String move = getMove(board);
			System.out.println(move);
		}
		
		
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
