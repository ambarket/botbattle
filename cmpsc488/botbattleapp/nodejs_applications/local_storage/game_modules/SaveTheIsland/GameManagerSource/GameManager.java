

import java.io.IOException;
import java.util.Scanner;
/**
 * @author Randall Hudson
 *
 */
public class GameManager {
 
  // TODO write unit tests for rounds
  // TODO write unit tests for tournaments 
  // TODO write unit tests for Competitor Data
  // TODO write unit tests for game instance
  // TODO look into integration testing

  public static void main(String[] args) throws IOException, InterruptedException {
	
    TournamentTest();
    //humanPlayersTest();
  }
  
  public static void humanPlayersTest() throws IOException, InterruptedException {
    String path = "C:\\Users\\Kitty\\git\\botbattle\\cmpsc488\\botbattleapp\\GameManager2\\bin";
    System.out.flush();
    Player p1 = new Player();
    System.out.flush();
    Player p2 = new Player(path, "rvh5220", Language.JAVA);
    
    GameInstance game = new GameInstance(p1, p2);
    Thread runningGame = new Thread(game);
    runningGame.start();
    runningGame.join();
  }

  // This test is for a tic tac toe tournament
  public static void TournamentTest() {
    String path = "C:\\Users\\Kitty\\git\\botbattle\\cmpsc488\\botbattleapp\\GameManager2\\bin";
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
  