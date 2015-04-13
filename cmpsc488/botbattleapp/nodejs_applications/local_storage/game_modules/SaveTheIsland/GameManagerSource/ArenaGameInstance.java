

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
    boolean botVsHuman = bot2.humanOrBot == Player.HUMAN;
    //Send starting board to the test arena
    System.out.println(game.getJSONStringForThisTurn(botVsHuman));
    
    while (!game.isGameOver()) {

      int player = (i % 2) + 1;
      
      if (player == 1) {  
        move = bot1.getMove(game.getBoard());  
      } else {
        move = bot2.getMove(game.getBoard());        
      }
      System.err.println("\nMOVE:" + move + ", PLAYER: " + player + "\n");
      if (game.isValidMove(move, player)) {
        
        if(player == 2 && bot2.humanOrBot == Player.HUMAN){
          System.out.println(game.getValidMoveJSON());
        }
       
        game.updateBoard(move, player);
        System.err.println(game.getBoard());
        //Sent to stdout for Arena to see
        
        System.out.println(game.getJSONStringForThisTurn(botVsHuman));
        
        if (game.isGameWon()) {
          // TODO: This needs to be integrated into the final game state as the turn description so it is displayed
          System.out.println("Game Won by player" + player);
          break;
        }
        
        i++;
        
      } else {
        if(player == 2 && bot2.humanOrBot == Player.HUMAN){
          System.out.println(game.getInvalidMoveJSON());
        } else {
          game.setOver(true);
          // TODO: sends duplicate information as the previous game state because the board wasn't updated.
          System.out.println(game.getJSONStringForThisTurn(botVsHuman));    
          System.err.println("Ending game due to bots invalid move.");
          break;
        }
        
      }

    }
    
  }

  @Override
  public String toString() {
    return "ArenaGameInstance [\n\tplayer1=" + bot1 + ",\n\tplayer2=" + bot2 + ",\n game="
        + Game.getName()  + "]";
  }

}
