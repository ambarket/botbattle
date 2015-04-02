

import java.io.IOException;

public class ArenaGameManager {

  public static void main(String[] args) {
    if (args.length < 2) {
      System.err.println("Must supplie arguments of bot path and username.");
      System.exit(1);
    }

    String botPath = args[0];
    String username = args[1];
    Player bot = null;

    System.out.flush();
    try {
      bot = new Player(botPath, "rvh5220");
    } catch (IOException e) {
      System.out.println("An Exception was thrown.");
    }
    
    ArenaGameInstance arenaGame = new ArenaGameInstance(bot);
    
    arenaGame.runArenaGame();
  }

}
