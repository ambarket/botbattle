package game.manger;

import java.util.Random;

public class SaveTheIslandGame {
	
	public static String getStartingBoard() {
		Random rng = new Random();
		String board = "";
		
		for(int i = 0; i < 5; i++) {
			board += rng.nextInt(6);
		}
		board += ";1";
		
		for(int i = 0; i < 23; i++) {
			board += "0";
		}
		board += "2;";
		for(int i = 0; i < 5; i++) {
			board += rng.nextInt(6);
		}
		
		return board;
	}


	public static String updateBoard(String move, String board) {


		int player = Integer.parseInt(move.substring(0, 1));
		
		if( player == 1 ) {
			//check there
		}
		else if ( player == 2 ) {
			
		}
		
		int col = Integer.parseInt(move.substring(3, 4));

		
		return board;
	}
	
	//TODO
	private static String getPlayersValues(int player, String board) {
		return null;
	}
	
	//TODO
	private static String getDistance(String board) {		
		return null;
	}
	
	private static boolean isPlayersMoveValid(String move, String board, int player) {
		//check there is atleast one value
		if( move.length() < 2 ) {
			return false;
		}
		
		//check that all values are the same
		String value = move.substring(1, 2);
		
		for(int i = 1; i < move.length(); i++) {
			if( value != move.substring(i, i+1) ) {
				return false;
			}
		}
		
		//check that the player has all those values
		String values = getPlayersValues(player, board);
		int count = 0;
		for(int i = 0; i < values.length(); i++) {
			if( value == values.substring(i, i+1) ) {
				count++;
			}
		}
		
		if( count != move.length() - 1 ) {
			return false;
		}
		
		int valueInt = Integer.parseInt(value);
		int distance = Integer.parseInt(getDistance(board));
		
		//check that other players distance is greater then or equal to value
		if( valueInt <= distance ) {
			return true;
		} else {
			return false;
		}
	}
	
	public static boolean isValidMove(String move, String board) {
		
		int player = Integer.parseInt(move.substring(0, 1));
		// 122
		if( player == 1 ) {
			return isPlayersMoveValid(move, board, 1);
		}
		else if ( player == 2 ) {
			return isPlayersMoveValid(move, board, 2);
		} else {
			return false;
		}
	}

	
	public static boolean isGameOver(String board) {
		
		if(isGameWon(board)){
			return true;
		}
		// TODO
		
		return true;
	}

	public static boolean isGameWon(String board) {
		// TODO
		return false;
	}
	
	public static String getHTMLForBoard(String board) {
		// TODO Auto-generated method stub
		return null;
	}
	
	public static int getBotTimeoutInMilliseconds() {
		return 3000;
	}
	
	public static String getName() {
		return "SaveTheIsland";
	}
}