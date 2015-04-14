

public class ArenaGameInstance {
  
  private Player bot1;
  private Player bot2;
  private GameInterface game;
  private GameType gameType;


  public ArenaGameInstance(Player bot1, Player bot2, GameType gameType) {
    this.bot1 = bot1;
    this.bot2 = bot2;
    this.gameType = gameType;
    game = new Game();
  }

  public void runArenaGame() {
    int i = 0;    
    String move = "", stderr = "";

    //Send starting board to the test arena
    game.initializeGame(gameType);
    System.out.println(game.getInitialGamestate());
    
    while (!game.isGameOver()) {

      int player = (i % 2) + 1;
      
      if (player == 1) {  
        move = bot1.getMove(game.getPlayersOneBoard());  
        stderr = bot1.getAnyStderr();
      } else {
        move = bot2.getMove(game.getPlayersTwoBoard());    
        stderr = bot2.getAnyStderr();
      }
      System.err.println("\nMOVE:" + move + ", PLAYER: " + player + "\n");
      if (game.isValidMove(move, player)) {
       
        game.updateBoard(move, player);
        System.err.println(game.getBoard());
        //Sent to stdout for Arena to see
        
        if (game.isGameWon()) {
          game.setOver(true);
          System.out.println(game.getFinalGamestate("Player " + player + " won the game!"));
        }
        else {
          System.out.println(game.getMidGamestate(stderr));
        }
        
        i++;
        
      } else {
        boolean playerIsAHuman = player == 2 && bot2.humanOrBot == Player.HUMAN;
        System.out.println(game.getInvalidMoveJSON(move, player));
        if(!playerIsAHuman){
          game.setOver(true);
          System.out.println(game.getFinalGamestate("Player " + player + " has been disqualified due to invalid move."));
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
