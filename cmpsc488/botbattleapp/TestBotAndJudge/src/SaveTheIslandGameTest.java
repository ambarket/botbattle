

import static org.junit.Assert.*;


import org.junit.Test;

public class SaveTheIslandGameTest {
  
  static SaveTheIslandGame stiGame = new SaveTheIslandGame();

  @Test
  public void testGetStartingBoardPositionForPlayer1() {
    String board = stiGame.getStartingBoard();

    assertEquals("1", board.substring(6, 7));
  }

  @Test
  public void testGetStartingBoardPositionForPlayer2() {
    String board = stiGame.getStartingBoard();

    assertEquals("2", board.substring(30, 31));
  }

  @Test
  public void testUpdateBoard() {
    fail("Not yet implemented");
  }

  @Test
  public void testIsValidMove() {
    String board = stiGame.getStartingBoard();
    String tiles = SaveTheIslandGame.Board.getPlayersTiles(1, board);
    String move = "attack;" + tiles.substring(0, 1);

    assertFalse(stiGame.isValidMove(move, board, 1));
  }

  @Test
  public void testIsValidMoveWithBadType() {
    String board = stiGame.getStartingBoard();
    String tiles = SaveTheIslandGame.Board.getPlayersTiles(1, board);
    String move = "ammack;" + tiles.substring(0, 1);

    assertFalse(stiGame.isValidMove(move, board, 1));
  }

  @Test
  public void testIsValidMoveWithBadTile() {
    String board = stiGame.getStartingBoard();
    String tiles = SaveTheIslandGame.Board.getPlayersTiles(1, board);
    String move = "attack;6";

    assertFalse(stiGame.isValidMove(move, board, 1));
  }

  @Test
  public void testIsValidMoveWithBadNumberOfTiles() {
    String board = stiGame.getStartingBoard();
    String tiles = SaveTheIslandGame.Board.getPlayersTiles(1, board);
    String move =
        "attack;" + tiles.substring(0, 1) + tiles.substring(0, 1) + tiles.substring(0, 1)
            + tiles.substring(0, 1) + tiles.substring(0, 1) + tiles.substring(0, 1);

    assertFalse(stiGame.isValidMove(move, board, 1));
  }

  @Test
  public void testIsGameOverWithStartingBoard() {
    assertFalse(stiGame.isGameOver(stiGame.getStartingBoard()));
  }

  @Test
  public void testAnimatedEventJSON() {
    //TODO write unit test for JSON functions in game class
  }
}
