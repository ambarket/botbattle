package game.manger;

import java.util.Random;

public class SaveTheIslandGame {
	
	//-------------------------- BOARD CLASS ---------------------
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
		
		public static int getDistanceBetweenPlayers(String board) {		
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
		
		public static boolean checkPlayersTiles(String board, int player, int value, int numOfValues) {
			String tiles = getPlayersTiles(player, board);
			int count = 0;
			
			for(int i = 0; i < 5; i++) {
				if( Integer.parseInt(tiles.substring(i, i+1)) == value ) {
					count++;
				} 
			}
			
			return count == value;
		}
		
		public static String movePlayer(String board, int player, int distance) {
			char[] island = getIsland(board).toCharArray();
			int index = getIsland(board).indexOf(String.valueOf(player));
			
			if( player == 2 ) {
				distance = -distance;
			}
	
			island[index] = '0';
			if( index + distance >= 0 && index + distance < island.length ) {
				island[index + distance] = String.valueOf(player).charAt(0);
			}//else player got knocked off the island
			
			
			return getPlayersTiles(1, board) + ";" + String.valueOf(island) + ";" + getPlayersTiles(2, board);
		}
		
		public static String executeAttack(String board, int victim, int numOfAttacks) {
			String tiles = getPlayersTiles(victim, board);
			int defenseTiles  = 0, 
					distance = getDistanceBetweenPlayers(board);
			
			for (int i = 0; i < 5; i++) {
				if( Integer.parseInt(tiles.substring(i, i+1)) == distance ) {
					defenseTiles++;
				} 
				
				if( defenseTiles == numOfAttacks ) {
					break;
				}
			}
			
			replacePlayersTiles(board, victim, getDistanceBetweenPlayers(board), defenseTiles);
			numOfAttacks = -(numOfAttacks - defenseTiles);
			
			return movePlayer(board, victim, numOfAttacks * getDistanceBetweenPlayers(board));
		}
	}
	//----------------------- END BOARD CLASS ---------------------
	
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
	
	//TODO implement this
	public static String getJSONstringFromGameResults(GameResults results) {
		return null;
	}

	//TODO finish this
	public static String updateBoard(String move, String board, int player) {
		
		if( move.startsWith("attack") ) {
			
		}
		else if( move.startsWith("retreat") ) {
			
		}

		
		return board;
	}
	
	protected static boolean isPlayersMoveValid(String move, String board, int player) {
		//check there is atleast one value
		if( move.length() < 1 ) {
			return false;
		}
		
		
		//check that all values are the same
		String value = move.substring(0, 1);
		
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
		
		if( count != move.length() ) {
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

	public static boolean isValidMove(String move, String board, int player) {
		return isPlayersMoveValid(move, board, player);
	}
}