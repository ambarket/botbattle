package game.manger;

public class GameInstance implements Runnable {

  private Player player1;
  private Player player2;
  private GameResults results;

  /**
   * @param player1
   * @param player2
   */
  public GameInstance(Player player1, Player player2) {
    this.player1 = player1;
    this.player2 = player2;
    results = new GameResults();
  }

  @Override
  public void run() {
    int i = 0;

    // Add starting board
    String move = "";
    String board = Game.getStartingBoard();
    results.addBoard(Game.getStartingBoard());

    while (!Game.isGameOver(board)) {

      int player = (i % 2) + 1;

      if (player == 1) {
        move = player1.getMove(board);
        results.addMove(move, player);
      } else {
        move = player2.getMove(board);
        results.addMove(move, player);
      }

      if (Game.isValidMove(move, board, player)) {
        board = Game.updateBoard(move, board, player);
        results.addBoard(board);

        if (Game.isGameWon(board)) {
          System.out.println("Game Won by player" + player);
          results.setWinner(player);
          break;
        }
      } else {
        // other player wins
        results.setWinner((player % 2) + 1);
        System.out.println("Invalid move made");
        break;
      }

      i++;
    }

    // These are just for testing. Can be removed later
    System.out.println("Game over");
    System.out.println(this.getJSONStringOfResults());
  }

  public Player getWinner() {
    if (results.getWinner() == 1) {
      return player1;
    } else if (results.getWinner() == 2) {
      return player2;
    }

    return null;
  }

  public String getHTMLForEntireGame() { // TODO implement getHTML function in gameManager
    return null;
  }

  public String getJSONStringOfResults() {
    return Game.getJSONstringFromGameResults(results);
  }

  @Override
  public String toString() {
    return "GameManager [\n\tplayer1=" + player1 + ",\n\tplayer2=" + player2 + ",\n game="
        + Game.getName() + ",\n results=" + results + "]";
  }


}
