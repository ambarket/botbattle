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
	 * Test method for {@link game.manger.TicTacToeGame#getBoard()}.
	 */
	@Test
	public void testGetBoard() {
		String s = "000000000";
		assertEquals("Initial Game board set incorrectly.", s, TicTacToeGame.getStartingBoard());
	}

	/**
	 * Test method for {@link game.manger.TicTacToeGame#updateBoard(java.lang.String)}.
	 */
	@Test
	public void testUpdateBoard() {
		String board = TicTacToeGame.getStartingBoard();
		String move = "1, 1, X";
		String newBoard = "X00000000";
		
		assertEquals("Update board failed for first move.", newBoard, TicTacToeGame.updateBoard(move, board));
	}

	/**
	 * Test method for {@link game.manger.TicTacToeGame#updateBoard(java.lang.String)}.
	 */
	@Test
	public void testUpdateBoardForEndMove() {
		String board = TicTacToeGame.getStartingBoard();
		String move = "3, 3, X";
		String newBoard = "00000000X";
		
		assertEquals("Update board failed for first move.", newBoard, TicTacToeGame.updateBoard(move, board));
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#updateBoard(java.lang.String)}.
	 */
	@Test
	public void testUpdateBoardForMiddleMove() {
		String board = TicTacToeGame.getStartingBoard();
		String move = "2, 2, X";
		String newBoard = "0000X0000";
		
		assertEquals("Update board failed for first move.", newBoard, TicTacToeGame.updateBoard(move, board));
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#updateBoard(java.lang.String)}.
	 */
	@Test
	public void testUpdateBoardForAllMove() {
		String board = TicTacToeGame.getStartingBoard();
		
		for(int i = 1; i < 4; i++)
		{
			for(int j = 1; j < 4; j++)
			{
				String move = i + ", " + j + ", X";
				board = TicTacToeGame.updateBoard(move, board);
			}
		}
		
		
		String newBoard = "XXXXXXXXX";
		assertEquals("Update board failed for middle move.", newBoard, board);
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#isValidMove(java.lang.String)}.
	 */
	@Test
	public void testIsValidMoveForZeroes() {
		String board = TicTacToeGame.getStartingBoard();
		String move = "0, 0, X";
		
		assertFalse(TicTacToeGame.isValidMove(move, board, 1));
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#isValidMove(java.lang.String)}.
	 */
	@Test
	public void testIsValidMoveForBiggerNumers() {
		String board = TicTacToeGame.getStartingBoard();
		String move = "11, 22, X";
		
		assertFalse(TicTacToeGame.isValidMove(move, board, 1));
	}

	/**
	 * Test method for {@link game.manger.TicTacToeGame#isValidMove(java.lang.String)}.
	 */
	@Test
	public void testIsValidMoveForNotXOrO() {
		String board = TicTacToeGame.getStartingBoard();
		String move = "2, 2, A";
		
		assertFalse(TicTacToeGame.isValidMove(move, board, 1));
	}
	/**
	 * Test method for {@link game.manger.TicTacToeGame#isGameOver()}.
	 */
	@Test
	public void testIsGameOverWithInitialBoard() {
		String board = TicTacToeGame.getStartingBoard();
		
		assertFalse(TicTacToeGame.isGameOver(board));
	}

	/**
	 * Test method for {@link game.manger.TicTacToeGame#isGameOver()}.
	 */
	@Test
	public void testIsGameOverWithAlmostWin() {
		String board = "XXO0OXXOX";
		
		assertFalse(TicTacToeGame.isGameOver(board));
	}
	
	@Test
	public void testIsGameWonWithAlmostWin() {
		String board = "XXOOOXXOX";
		
		assertFalse(TicTacToeGame.isGameWon(board));
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#isGameOver()}.
	 */
	@Test
	public void testIsGameOverWithRowWin() {
		String board = "XXX000000";
		
		assertTrue(TicTacToeGame.isGameOver(board));
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#isGameOver()}.
	 */
	@Test
	public void testIsGameOverWithDiagonalWin() {
		String board = "X000X000X";
		
		assertTrue(TicTacToeGame.isGameOver(board));
	}
	/**
	 * Test method for {@link game.manger.TicTacToeGame#getHTMLForBoard()}.
	 */
	@Test
	public void testGetHTMLForBoard() {
		//TODO write unit test for testGetHTMLForBoard
		//fail("Not yet implemented");
	}

}
