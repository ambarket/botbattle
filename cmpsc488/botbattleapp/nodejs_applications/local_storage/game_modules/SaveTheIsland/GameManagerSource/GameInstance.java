

public class GameInstance implements Runnable {

  private Player player1;
  private Player player2;
  private GameInterface game;
  private GameResults results;

  /**
   * @param player1
   * @param player2
   */
  public GameInstance(Player player1, Player player2) {
    this.player1 = player1;
    this.player2 = player2;
    results = new GameResults();
    game = new Game();
  }

  @Override
  public void run() {
    int i = 0;

    // Add starting board
    String move = "";
    results.addBoard(game.getBoard());

    while (!game.isGameOver()) {

      int player = (i % 2) + 1;
      
      //TODO: this line is here to make testing with arena and human players easier.
      //      The human player should be player1
      System.out.println("Wait for player ones move");
      System.out.flush();
      
      if (player == 1) {
        move = player1.getMove(game.getBoard());
        results.addMove(move, player);
      } else {
        move = player2.getMove(game.getBoard());
        results.addMove(move, player);
      }

      if (game.isValidMove(move, player)) {
        game.updateBoard(move, player);
        results.addBoard(game.getBoard());

        if (game.isGameWon()) {
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
    return game.getJSONstringFromGameResults(results);
  }

  @Override
  public String toString() {
    return "GameManager [\n\tplayer1=" + player1 + ",\n\tplayer2=" + player2 + ",\n game="
        + Game.getName() + ",\n results=" + results + "]";
  }


}
