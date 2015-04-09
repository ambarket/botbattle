

public class ArenaGameInstance {
  
  private Player bot1;
  private Player bot2;
  private GameInterface game;



  public ArenaGameInstance(Player bot1, Player bot2) {
    this.bot1 = bot1;
    this.bot2 = bot2;
    game = new Game();
  }

  public void runArenaGame() {
    int i = 0;    
    String move = "";

    //Send starting board to the test arena
    System.out.println(game.getJSONStringForThisTurn());
    
    while (!game.isGameOver()) {

      int player = (i % 2) + 1;
      
      if (player == 1) {  
        move = bot1.getMove(game.getBoard());  
      } else {
        move = bot2.getMove(game.getBoard());        
      }
      System.err.println("\nMOVE:" + move + ", PLAYER: " + player + "\n");
      if (game.isValidMove(move, player)) {
        game.updateBoard(move, player);
        
        //Sent to stdout for Arena to see
        System.out.println(game.getJSONStringForThisTurn());
        
        if (game.isGameWon()) {
          System.out.println("Game Won by player" + player);
          break;
        }
      } else {
        System.out.println(game.getJSONStringForThisTurn());
      }

      i++;
    }
    
  }

  @Override
  public String toString() {
    return "ArenaGameInstance [\n\tplayer1=" + bot1 + ",\n\tplayer2=" + bot2 + ",\n game="
        + Game.getName()  + "]";
  }

}
