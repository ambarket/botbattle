/**
 * 
 */
package game.manger;

import static org.junit.Assert.*;

import org.junit.Test;

/**
 * @author Randall Hudson
 *
 */
public class TicTacToeGameTest {

	/**
	 * Test method for {@link game.manger.TicTacToeGame#TicTacToeGame()}.
	 */
	@Test
	public void testTicTacToeGame() {
		TicTacToeGame t = new TicTacToeGame();
		
		assertNotNull(t);
	}

	/**
	 * Test method for {@link game.manger.TicTacToeGame#TicTacToeGame(java.lang.String)}.
	 */
	@Test
	public void testTicTacToeGameString() {
		TicTacToeGame t = new TicTacToeGame("001000001");
		String s = "001000001";
		assertEquals("Game board constructor for TicTacToe incorrect.", s, t.getBoard());
	}

	/**
	 * Test method for {@link game.manger.TicTacToeGame#getBoard()}.
	 */
	@Test
	public void testGetBoard() {
		TicTacToeGame t = new TicTacToeGame();
		String s = "000000000";
		assertEquals("Initial Game board set incorrectly.", s, t.getBoard());
	}

	/**
	 * Test method for {@link game.manger.TicTacToeGame#updateBoard(java.lang.String)}.
	 */
	@Test
	public void testUpdateBoard() {
		TicTacToeGame t = new TicTacToeGame();
		String move = "1, 1, X";
		t.updateBoard(move);
		String newBoard = "X00000000";
		
		assertEquals("Update board failed for first move.", newBoard, t.getBoard());
	}

	/**
	 * Test method for {@link game.manger.TicTacToeGame#updateBoard(java.lang.String)}.
	 */
	@Test
	public void testUpdateBoardForEndMove() {
		TicTacToeGame t = new TicTacToeGame();
		String move = "3, 3, X";
		t.updateBoard(move);
		String newBoard = "00000000X";
		assertEquals("Update board failed for end move.", newBoard, t.getBoard());
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#updateBoard(java.lang.String)}.
	 */
	@Test
	public void testUpdateBoardForMiddleMove() {
		TicTacToeGame t = new TicTacToeGame();
		String move = "2, 2, X";
		t.updateBoard(move);
		String newBoard = "0000X0000";
		assertEquals("Update board failed for middle move.", newBoard, t.getBoard());
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#updateBoard(java.lang.String)}.
	 */
	@Test
	public void testUpdateBoardForAllMove() {
		TicTacToeGame t = new TicTacToeGame();
		
		for(int i = 1; i < 4; i++)
		{
			for(int j = 1; j < 4; j++)
			{
				String move = i + ", " + j + ", X";
				t.updateBoard(move);
			}
		}
		
		
		String newBoard = "XXXXXXXXX";
		assertEquals("Update board failed for middle move.", newBoard, t.getBoard());
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#isValidMove(java.lang.String)}.
	 */
	@Test
	public void testIsValidMoveForZeroes() {
		TicTacToeGame t = new TicTacToeGame();
		String move = "0, 0, X";
		
		assertFalse(t.isValidMove(move));
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#isValidMove(java.lang.String)}.
	 */
	@Test
	public void testIsValidMoveForBiggerNumers() {
		TicTacToeGame t = new TicTacToeGame();
		String move = "11, 22, X";
		
		assertFalse(t.isValidMove(move));
	}

	/**
	 * Test method for {@link game.manger.TicTacToeGame#isValidMove(java.lang.String)}.
	 */
	@Test
	public void testIsValidMoveForNotXOrO() {
		TicTacToeGame t = new TicTacToeGame();
		String move = "2, 2, A";
		
		assertFalse(t.isValidMove(move));
	}
	/**
	 * Test method for {@link game.manger.TicTacToeGame#isGameOver()}.
	 */
	@Test
	public void testIsGameOverWithInitialBoard() {
		TicTacToeGame t = new TicTacToeGame();
		
		assertFalse(t.isGameOver());
	}

	/**
	 * Test method for {@link game.manger.TicTacToeGame#isGameOver()}.
	 */
	@Test
	public void testIsGameOverWithAlmostWin() {
		TicTacToeGame t = new TicTacToeGame("XXOOOXXOX");
		
		assertFalse(t.isGameOver());
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#isGameOver()}.
	 */
	@Test
	public void testIsGameOverWithRowWin() {
		TicTacToeGame t = new TicTacToeGame("XXX000000");
		
		assertTrue(t.isGameOver());
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#isGameOver()}.
	 */
	@Test
	public void testIsGameOverWithDiagonalWin() {
		TicTacToeGame t = new TicTacToeGame("X000X000X");
		
		assertTrue(t.isGameOver());
	}
	/**
	 * Test method for {@link game.manger.TicTacToeGame#getHTMLForBoard()}.
	 */
	@Test
	public void testGetHTMLForBoard() {
		//TODO
		//fail("Not yet implemented");
	}

}
