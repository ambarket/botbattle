/*
 * TODO: This was the original GameManager class before implementing communication
 * with the test arena, and was designed mostly with tournaments in mind. 
 * 
 * Moving forward there should be no real need to separate the program entry points 
 * if its a tournament to be run or just a single test arena instance, and the 
 * ArenaGameManager class should simply be extended to support tournaments as well,
 * and renamed accordingly.
 */

import java.io.IOException;
import java.util.Scanner;
/**
 * @author Randall Hudson
 *
 */

public class TournGameManager {
 
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
    
    TournGameInstance game = new TournGameInstance(p1, p2);
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

  