package game.manger;

import static org.junit.Assert.*;
import game.manger.SaveTheIslandGame.Board;

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
    String board = SaveTheIslandGame.getStartingBoard();
    String tiles = Board.getPlayersTiles(1, board);
    String move = "attack;" + tiles.substring(0, 1);

    assertTrue(SaveTheIslandGame.isValidMove(move, board, 1));
  }

  @Test
  public void testIsValidMoveWithBadType() {
    String board = SaveTheIslandGame.getStartingBoard();
    String tiles = Board.getPlayersTiles(1, board);
    String move = "ammack;" + tiles.substring(0, 1);

    assertFalse(SaveTheIslandGame.isValidMove(move, board, 1));
  }

  @Test
  public void testIsValidMoveWithBadTile() {
    String board = SaveTheIslandGame.getStartingBoard();
    String tiles = Board.getPlayersTiles(1, board);
    String move = "attack;6";

    assertFalse(SaveTheIslandGame.isValidMove(move, board, 1));
  }

  @Test
  public void testIsValidMoveWithBadNumberOfTiles() {
    String board = SaveTheIslandGame.getStartingBoard();
    String tiles = Board.getPlayersTiles(1, board);
    String move =
        "attack;" + tiles.substring(0, 1) + tiles.substring(0, 1) + tiles.substring(0, 1)
            + tiles.substring(0, 1) + tiles.substring(0, 1) + tiles.substring(0, 1);

    assertFalse(SaveTheIslandGame.isValidMove(move, board, 1));
  }

  @Test
  public void testIsGameOverWithStartingBoard() {
    assertFalse(SaveTheIslandGame.isGameOver(SaveTheIslandGame.getStartingBoard()));
  }

  @Test
  public void testAnimatedEventJSON() {
    //TODO write unit test for JSON functions in game class
  }
}
