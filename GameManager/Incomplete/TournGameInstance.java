/*
 * TODO: This was the original game instance class before implementing communication
 * with the test arena, and was designed mostly with tournaments in mind. Several changes 
 * were required to the GameInterface and logic of the game loop at that time, and thus 
 * the code below would need updated if it were to be functional again.
 * 
 * The goal if we had time was to create a single GameInstance class that handles both arena and
 * tournament games. See the comment in ArenaGameInstance class for an idea of how it could be
 * quickly extended to support tournament games as well. If that was done, this class would no 
 * longer be needed at all.
 */


public class TournGameInstance implements Runnable {

  private Player player1;
  private Player player2;
  private GameInterface game;
  private GameResults results;


  public TournGameInstance(Player player1, Player player2) {
    this.player1 = player1;
    this.player2 = player2;
    results = new GameResults();
    game = new Game();
    game.initializeGame(GameType.BOT_VS_BOT);
  }

  @Override
  public void run() {
    int i = 0;

    // Add starting board
    String move = "";
    results.addBoard(game.getCompleteBoard());

    while (!game.isGameOver()) {

      int player = (i % 2) + 1;
      
      //TODO: this line is here to make testing with arena and human players easier.
      //      The human player should be player1
      System.out.println("Wait for player ones move");
      System.out.flush();
      
      if (player == 1) {
        move = player1.getMove(game.getPlayerOneBoard(), game.getBotTimeoutInMilliseconds());
        results.addMove(move, player);
      } else {
        move = player2.getMove(game.getPlayerTwoBoard(), game.getBotTimeoutInMilliseconds());
        results.addMove(move, player);
      }

      if (game.validateMove(move, player) == null) {
        game.updateBoard(move, "", player);
        results.addBoard(game.getCompleteBoard());

        if (game.isGameOver()) {
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
	  //TODO: JSON String should be the underlying representation of this object.
	  //	The interface methods for get(Initial|Mid|Final)GameState should be called
	  //	to populate this object as the game is running.
	  return null;
	  //return game.getJSONstringFromGameResults(results);
  }

  @Override
  public String toString() {
    return "GameManager [\n\tplayer1=" + player1 + ",\n\tplayer2=" + player2 + ",\n game="
        + game.getName() + ",\n results=" + results + "]";
  }


}

