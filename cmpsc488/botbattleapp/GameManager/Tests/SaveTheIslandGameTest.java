
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
    SaveTheIslandGame g = new SaveTheIslandGame();
    g.setBoard("46114;10000000000000002;12345");
    g.updateBoard("move;6", 1);

    String tiles = g.getBoard().substring(0, 5);
    for (int i = 0; i < 5; i++) {
      if (tiles.substring(i, i + 1).equals("6")) {
        fail("Tiles: " + tiles);
      }
    }
    assertTrue(true);
  }

  @Test
  public void testUpdateBoardAttackDefended() {
    SaveTheIslandGame g = new SaveTheIslandGame();
    g.setBoard("43114;00000001002000000;12345");
    g.updateBoard("attack;3", 1);
    assertEquals("43114;00000001002000000;12345", g.getBoard());
  }
  
  @Test
  public void testUpdateBoardAttackNotDefended() {
    SaveTheIslandGame g = new SaveTheIslandGame();
    g.setBoard("43114;00000001002000000;12245");
    g.updateBoard("attack;3", 1);
    assertEquals("00000000010002000", g.getBoard().split(";")[1]);
  }
  
  @Test
  public void testIsValidMove() {
    String board = stiGame.getStartingBoard();
    String tiles = SaveTheIslandGame.Board.getPlayersTiles(1, board);
    String move = "attack;" + tiles.substring(0, 1);

    assertFalse(stiGame.isValidMove(move, 1));
  }

  @Test
  public void testIsValidMoveWithBadType() {
    String board = stiGame.getStartingBoard();
    String tiles = SaveTheIslandGame.Board.getPlayersTiles(1, board);
    String move = "ammack;" + tiles.substring(0, 1);

    assertFalse(stiGame.isValidMove(move, 1));
  }

  @Test
  public void testIsValidMoveWithBadTile() {
    String board = stiGame.getStartingBoard();
    String tiles = SaveTheIslandGame.Board.getPlayersTiles(1, board);
    String move = "attack;6";

    assertFalse(stiGame.isValidMove(move, 1));
  }

  @Test
  public void testIsValidMoveWithBadNumberOfTiles() {
    String board = stiGame.getStartingBoard();
    String tiles = SaveTheIslandGame.Board.getPlayersTiles(1, board);
    String move =
        "attack;" + tiles.substring(0, 1) + tiles.substring(0, 1) + tiles.substring(0, 1)
            + tiles.substring(0, 1) + tiles.substring(0, 1) + tiles.substring(0, 1);

    assertFalse(stiGame.isValidMove(move, 1));
  }

  @Test
  public void testIsGameOverWithStartingBoard() {
    assertFalse(stiGame.isGameOver());
  }

  @Test
  public void testAnimatedEventJSON() {
    // TODO write unit test for JSON functions in game class
  }
}
