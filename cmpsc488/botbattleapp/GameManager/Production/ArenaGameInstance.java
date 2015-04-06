

import java.util.Scanner;

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
    Scanner scner = new Scanner(System.in);
    // Add starting board
    String move = " ; ";
    String board = game.getStartingBoard();

    //Send starting board to the test arena
    System.out.println(game.getJSONStringForThisTurn(board, move, 0));
    
    while (!game.isGameOver(board)) {

      int player = (i % 2) + 1;
      
      if (player == 1) {  
        move = bot1.getMove(board);  
      } else {
        move = bot2.getMove(board);        
      }
      System.err.println("\nMOVE:" + move + ", PLAYER: " + player + "\n");
      if (game.isValidMove(move, board, player)) {
        board = game.updateBoard(move, board, player);
        
        //Sent to stdout for Arena to see
        System.out.println(game.getJSONStringForThisTurn(board, move, player));
        
        if (game.isGameWon(board)) {
          System.out.println("Game Won by player" + player);
          break;
        }
      } else {
        System.out.println(game.getJSONStringForThisTurn(board, move, player));
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
