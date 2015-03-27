package game.manger;

import java.io.IOException;

/**
 * @author Randall Hudson
 *
 */
public class GameManager {
  
  //You will need to change this path
  public static  String path = "C:\\Users\\Kitty\\git\\botbattle\\cmpsc488\\botbattleapp\\TestBotAndJudge\\bin";

  // TODO create simple save the island bot
  // TODO test save the island game with simple bot
  // TODO write unit tests for rounds
  // TODO write unit tests for tournaments
  // TODO write unit tests for Competitor Data
  // TODO write unit tests for game manager
  // TODO look into integration testing
  // TODO decide if we need gameInterface, if so update it.
  // TODO clean up players construcotrs, could combine most of that work.

  /**
   * @param args
   * @throws IOException
   * @throws InterruptedException 
   */
  public static void main(String[] args) throws IOException, InterruptedException {

    //TournamentTest();
    humanPlayersTest();
  }
  
  public static void humanPlayersTest() throws IOException, InterruptedException {
    System.out.flush();
    Player p1 = new Player(path);
    System.out.flush();
    Player p2 = new Player(path, "rvh5220");
    
    GameInstance game = new GameInstance(p1, p2);
    Thread runningGame = new Thread(game);
    runningGame.start();
    runningGame.join();
  }

  // This test is for a tic tac toe tournament
  public static void TournamentTest() {
    CompetitorData c = new CompetitorData();
    c.addUser("rvh5220", path);
    c.addUser("rvh5221", path);
    c.addUser("rvh5222", path);
    c.addUser("rvh5223", path);

    Tournament t = new Tournament(null, null, c);
    try {
      t.runTournament();
    } catch (IOException e) { // TODO this should probablly be caught lower down
      e.printStackTrace();
    }
  }

}
