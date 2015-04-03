

import java.util.Scanner;

public class ArenaGameInstance {
  
  private Player bot;
  private GameInterface game;



  public ArenaGameInstance(Player bot) {
    this.bot = bot;
    game = new Game();
  }

  public void runArenaGame() {
    int i = 0;
    Scanner scner = new Scanner(System.in);
    // Add starting board
    String move = "";
    String board = game.getStartingBoard();

    //Send starting board to the test arena
    System.out.println(game.getHTMLForBoard(board));
    
    while (!game.isGameOver(board)) {

      int player = (i % 2) + 1;
      
      if (player == 1) {
        //Get human players move from test arena page
        move = scner.nextLine();
        
        // If the player wants to quit
        if (move.toLowerCase().equals("exit")) {
          break;
        }
      } else {
        move = bot.getMove(board);        
      }

      if (game.isValidMove(move, board, player)) {
        board = game.updateBoard(move, board, player);
        
        //Sent to stdout for Arena to see
        System.out.println(game.getHTMLForBoard(board));
        
        if (game.isGameWon(board)) {
          System.out.println("Game Won by player" + player);
          break;
        }
      } else {
        System.out.println("Invalid move made");
        break;
      }

      i++;
    }

    // This is just for testing. Can be removed later
    System.out.println("Game over");
    scner.close();
  }

  @Override
  public String toString() {
    return "ArenaGameInstance [\n\tplayer1=" + "Human" + ",\n\tplayer2=" + bot + ",\n game="
        + Game.getName()  + "]";
  }

}
