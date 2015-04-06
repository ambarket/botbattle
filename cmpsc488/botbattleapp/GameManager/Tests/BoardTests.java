

import static org.junit.Assert.*;

import org.junit.Test;

public class BoardTests {
  static SaveTheIslandGame stiGame = new SaveTheIslandGame();
  
	@Test
	public void testGetPlayersTilesReturnsCorrectLengthString() {
		String board = stiGame.getStartingBoard();
		String tiles = SaveTheIslandGame.Board.getPlayersTiles(1, board);
		assertEquals(5, tiles.length());
	}
	
	@Test
	public void testGetPlayersTilesReturnsStringOfNumbers() {
		String board = stiGame.getStartingBoard();
		String tiles = SaveTheIslandGame.Board.getPlayersTiles(1, board);
		Integer.parseInt(tiles);
		//If no exception gets thrown we are good.
		assertEquals(true, true);
	}
	
	@Test
	public void testGetPlayersTilesReturnsStringOfCorrectNumbers() {
		String board = stiGame.getStartingBoard();
		String tiles = SaveTheIslandGame.Board.getPlayersTiles(1, board);
		
		for(int i = 0; i < 5; i++) {
			int tile = Integer.parseInt(tiles.substring(i, i+1));
			
			if( tile < 0 || tile > 5 ) {
				fail();
			}
		}
		
		assertTrue(true);
	}
	
	@Test
	public void testGetIsland() {
		assertEquals("100002", SaveTheIslandGame.Board.getIsland("00000;100002;12345"));
	}

	@Test
	public void testGetDistanceBetweenPlayers() {
		assertEquals(4, SaveTheIslandGame.Board.getDistanceBetweenPlayers("1;10002;1"));
	}
	@Test
	public void testGetDistanceBetweenPlayers2() {
		assertEquals(4, SaveTheIslandGame.Board.getDistanceBetweenPlayers("001;001000200;100"));
	}
	
	@Test
	public void testGetDistanceBetweenPlayersWithOneDistance() {
		assertEquals(1, SaveTheIslandGame.Board.getDistanceBetweenPlayers("1;12;1"));
	}
	@Test
	public void testGetDistanceBetweenPlayersWithOneDistance2() {
		assertEquals(1, SaveTheIslandGame.Board.getDistanceBetweenPlayers("1;0000120000;1"));
	}

	@Test
	public void testReplacePlayersTilesReturnsStringOfCorrectLength() {
		String board = "43112;0000010002000;12345";
		assertEquals(5, SaveTheIslandGame.Board.replacePlayersTiles(board, 1, 1, 2).length());
	}
	
	@Test
	public void testReplacePlayersTilesRemovesOldTiles() {
		String board = "46116;0000010002000;12345";
		String tiles = SaveTheIslandGame.Board.replacePlayersTiles(board, 1, 6, 2);
		
		for(int i = 0; i < 5; i++) {
			if( tiles.substring(i, i+1).equals("6") ) {
				fail();
			}
		}
		assertTrue(true);
	}
	
	@Test
	public void testReplacePlayersTilesDoesntReplaceWrongTiles() {
		String board = "11111;0000010002000;12345";
		String tiles = SaveTheIslandGame.Board.replacePlayersTiles(board, 1, 6, 2);
		int count = 0;
		System.out.println(tiles);
		for(int i = 0; i < tiles.length(); i++) {
			if( tiles.substring(i, i+1).equals("1") ) {
				count++;
			}
		}
		assertEquals(5, count);
	}
	
	@Test
	public void testCheckPlayersTiles() {
		String board = "03241;1000000000000000000000002;12544";

		assertTrue(SaveTheIslandGame.Board.checkPlayersTiles(board, 1, 0, 1));
	}
	
	@Test
	public void testCheckPlayersTiles2() {
		String board = "10150;1000000000000000000000002;52255";

		assertTrue(SaveTheIslandGame.Board.checkPlayersTiles(board, 1, 1, 1));
	}
	
	@Test
	public void testmovePlayerForwardOneSpace() {
		String board = "11111;0000010002000;12345";
		
		String updatedBoard = SaveTheIslandGame.Board.movePlayer(board, 1, 1);
		
		assertEquals("11111;0000001002000;12345", updatedBoard);
	}
	
	@Test
	public void testmovePlayerBackwardOneSpace() {
		String board = "11111;0000010002000;12345";
		
		String updatedBoard = SaveTheIslandGame.Board.movePlayer(board, 1, -1);
		
		assertEquals("11111;0000100002000;12345", updatedBoard);
	}
	
	@Test
	public void testmovePlayerForwardOneSpaceForPlayer2() {
		String board = "11111;0000010002000;12345";
		
		String updatedBoard = SaveTheIslandGame.Board.movePlayer(board, 2, 1);
		
		assertEquals("11111;0000010020000;12345", updatedBoard);
	}
	
	@Test
	public void testmovePlayerBackwardOneSpaceForPlayer2() {
		String board = "11111;0000010002000;12345";
		
		String updatedBoard = SaveTheIslandGame.Board.movePlayer(board, 2, -1);
		
		assertEquals("11111;0000010000200;12345", updatedBoard);
	}
	
	@Test
	public void testExecuteAttackSimple() {
		String board = "11111;0000010002000;12345";
		String updatedBoard = SaveTheIslandGame.Board.executeAttack(board, 1, 1);
		
		assertEquals("11111;0100002000000;12345", updatedBoard);
	}
	
	
	@Test
	public void testExecuteAttackSimpleOtherPlayer() {
		String board = "11141;00000100020000;12335";
		String updatedBoard = SaveTheIslandGame.Board.executeAttack(board, 2, 1);
		
		assertEquals("11141;00000000100002;12335", updatedBoard);
	}
	
	@Test
	public void testExecuteAttackWithDefense() {
		String board = "11141;0000010002000;12344";
		String updatedBoard = SaveTheIslandGame.Board.executeAttack(board, 2, 1);
		
		assertEquals("0000010002000", SaveTheIslandGame.Board.getIsland(updatedBoard));
	}
	
	@Test
	public void testExecuteAttackWithKnockOffIsland() {
		String board = "11111;0000010002000;12344";
		String updatedBoard = SaveTheIslandGame.Board.executeAttack(board, 1, 2);
		
		assertEquals("0000002000000", SaveTheIslandGame.Board.getIsland(updatedBoard));
	}
	
	@Test
	public void testExecuteAttackWithKnockOffIslandReverse() {
		String board = "11144;0000010002000;12311";
		String updatedBoard = SaveTheIslandGame.Board.executeAttack(board, 2, 2);
		
		assertEquals("0000000010000", SaveTheIslandGame.Board.getIsland(updatedBoard));
	}
}
