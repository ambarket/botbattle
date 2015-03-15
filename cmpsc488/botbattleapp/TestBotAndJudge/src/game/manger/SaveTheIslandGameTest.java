package game.manger;

import static org.junit.Assert.*;

import org.junit.Test;

public class SaveTheIslandGameTest {

	@Test
	public void testGetStartingBoardPositionForPlayer1() {
		String board = SaveTheIslandGame.getStartingBoard();
		
		assertEquals("1", board.substring(6, 7));
	}
	
	@Test
	public void testGetStartingBoardPositionForPlayer2() {
		String board = SaveTheIslandGame.getStartingBoard();
		
		assertEquals("2", board.substring(30, 31));
	}

	@Test
	public void testUpdateBoard() {
		fail("Not yet implemented");
	}

	@Test
	public void testIsValidMove() {
		fail("Not yet implemented");
	}

	@Test
	public void testIsGameOver() {
		fail("Not yet implemented");
	}

	@Test
	public void testIsGameWon() {
		fail("Not yet implemented");
	}

}
