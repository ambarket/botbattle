package game.manger;

import java.util.Random;

public class SaveTheIslandGame {
	
	static class Board {
		public static String getPlayersTiles(int player, String board) {
			
			if( player == 1 ) {
				return board.split(";")[0];
			} else {
				return board.split(";")[2];
			}
		}
		
		public static String getIsland(String board) {
			return board.split(";")[1];
		}
		
		private static int getDistanceBetweenPlayers(String board) {		
			String island = getIsland(board);
			String distance = island.substring(island.indexOf("1"), island.indexOf("2") + 1);
			
			return distance.length() - 1;
		}
		
		public static String replacePlayersTiles(String board, int player, int value, int numOfValues) {
			Random rng = new Random();
			
			String tiles = getPlayersTiles(player, board);
			String newTiles = "";
			
			for(int i = 0; i < 5; i++) {
				if( Integer.parseInt(tiles.substring(i, i+1)) == value && numOfValues > 0 ) {
					newTiles += rng.nextInt(6);
					numOfValues--;
				} else {
					newTiles += tiles.substring(i, i+1);
				}
			}
			
			return newTiles;
		}
	}
	
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
	


	public static String updateBoard(String move, String board, int player) {
		
		if( player == 1 ) {

		}
		else if ( player == 2 ) {
			
		}
		

		
		return board;
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
		String values = Board.getPlayersTiles(player, board);
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
		int distance = Board.getDistanceBetweenPlayers(board);
		
		//check that other players distance is greater then or equal to value
		if( valueInt <= distance ) {
			return true;
		} else {
			return false;
		}
	}
	
	//TODO
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
		//This game doesnt have ties so winning is the only way it will end.
		if(isGameWon(board)){
			return true;
		}
		
		return false;
	}

	public static boolean isGameWon(String board) {
		String island = Board.getIsland(board);
		
		if( island.indexOf("1") != -1 && island.indexOf("2") != -1 ) {
			return false;
		} else {
			return true;
		}
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