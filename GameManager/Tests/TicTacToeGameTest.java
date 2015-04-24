/**
 * 
 */


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
		TicTacToeGame ttg = new TicTacToeGame();
		assertEquals("Initial Game board set incorrectly.", s, ttg.getStartingBoard());
	}

	/**
	 * Test method for {@link game.manger.TicTacToeGame#updateBoard(java.lang.String)}.
	 */
	@Test
	public void testUpdateBoard() {
	  TicTacToeGame ttg = new TicTacToeGame();
		String board = ttg.getStartingBoard();
		String move = "1, 1, X";
		String newBoard = "X00000000";
		
		assertEquals("Update board failed for first move.", newBoard, ttg.updateBoard(move, board, 1));
	}

	/**
	 * Test method for {@link game.manger.TicTacToeGame#updateBoard(java.lang.String)}.
	 */
	@Test
	public void testUpdateBoardForEndMove() {
	  TicTacToeGame ttg = new TicTacToeGame();
		String board = ttg.getStartingBoard();
		String move = "3, 3, X";
		String newBoard = "00000000X";
		
		assertEquals("Update board failed for first move.", newBoard, ttg.updateBoard(move, board, 1));
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#updateBoard(java.lang.String)}.
	 */
	@Test
	public void testUpdateBoardForMiddleMove() {
	  TicTacToeGame ttg = new TicTacToeGame();
		String board = ttg.getStartingBoard();
		String move = "2, 2, X";
		String newBoard = "0000X0000";
		
		assertEquals("Update board failed for first move.", newBoard, ttg.updateBoard(move, board, 1));
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#updateBoard(java.lang.String)}.
	 */
	@Test
	public void testUpdateBoardForAllMove() {
	  TicTacToeGame ttg = new TicTacToeGame();
		String board = ttg.getStartingBoard();
		
		for(int i = 1; i < 4; i++)
		{
			for(int j = 1; j < 4; j++)
			{
				String move = i + ", " + j + ", X";
				board = ttg.updateBoard(move, board, 1);
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
	  TicTacToeGame ttg = new TicTacToeGame();
		String board = ttg.getStartingBoard();
		String move = "0, 0, X";
		
		assertFalse(ttg.isValidMove(move, board, 1));
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#isValidMove(java.lang.String)}.
	 */
	@Test
	public void testIsValidMoveForBiggerNumers() {
	  TicTacToeGame ttg = new TicTacToeGame();
		String board = ttg.getStartingBoard();
		String move = "11, 22, X";
		
		assertFalse(ttg.isValidMove(move, board, 1));
	}

	/**
	 * Test method for {@link game.manger.TicTacToeGame#isValidMove(java.lang.String)}.
	 */
	@Test
	public void testIsValidMoveForNotXOrO() {
	  TicTacToeGame ttg = new TicTacToeGame();
		String board = ttg.getStartingBoard();
		String move = "2, 2, A";
		
		assertFalse(ttg.isValidMove(move, board, 1));
	}
	/**
	 * Test method for {@link game.manger.TicTacToeGame#isGameOver()}.
	 */
	@Test
	public void testIsGameOverWithInitialBoard() {
	  TicTacToeGame ttg = new TicTacToeGame();
		String board = ttg.getStartingBoard();
		
		assertFalse(ttg.isGameOver(board));
	}

	/**
	 * Test method for {@link game.manger.TicTacToeGame#isGameOver()}.
	 */
	@Test
	public void testIsGameOverWithAlmostWin() {
	  TicTacToeGame ttg = new TicTacToeGame();
		String board = "XXO0OXXOX";
		
		assertFalse(ttg.isGameOver(board));
	}
	
	@Test
	public void testIsGameWonWithAlmostWin() {
	  TicTacToeGame ttg = new TicTacToeGame();
		String board = "XXOOOXXOX";
		
		assertFalse(ttg.isGameWon(board));
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#isGameOver()}.
	 */
	@Test
	public void testIsGameOverWithRowWin() {
	  TicTacToeGame ttg = new TicTacToeGame();
		String board = "XXX000000";
		
		assertTrue(ttg.isGameOver(board));
	}
	
	/**
	 * Test method for {@link game.manger.TicTacToeGame#isGameOver()}.
	 */
	@Test
	public void testIsGameOverWithDiagonalWin() {
	  TicTacToeGame ttg = new TicTacToeGame();
		String board = "X000X000X";
		
		assertTrue(ttg.isGameOver(board));
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
