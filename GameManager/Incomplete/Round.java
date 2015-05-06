

import java.io.IOException;

public class Round {

  private TournGameInstance games[];

  public Round(CompetitorData competitors) throws IOException {
    
    //With n competitors this round we need n/2 games
    games = new TournGameInstance[(int) Math.ceil(competitors.getNumberOfCompetitors() / 2)];

    for (int i = 0; i < games.length; i++) {
      Player p1 = new Player(competitors.getBotPath(i), competitors.getUser(i), Language.JAVA);
      Player p2 = null;

      if (i + 1 > competitors.getNumberOfCompetitors()) { // Possible we have odd number of competitors
        p2 = new Player("badBot", "badBot", Language.JAVA);// TODO make generic bad bot to always time out
      } else {
        p2 = new Player(competitors.getBotPath(i + 1), competitors.getUser(i + 1), Language.JAVA);
      }

      games[i] = new TournGameInstance(p1, p2);
    }
  }

  public void runRound() {
    for (TournGameInstance gameManager : games) {
      gameManager.run();
    }
  }

  public CompetitorData getWinners() {
    CompetitorData winners = new CompetitorData();

    for (int i = 0; i < games.length; i++) {
      Player plyr = games[i].getWinner();
      if (plyr != null) {
        winners.addUser(plyr.usersName, plyr.botFilePath);
      }
    }

    return winners;
  }

  public String toHTML() { // TODO toHTML for round
    String html = "";

    for (TournGameInstance gameManager : games) {
      html += gameManager.getHTMLForEntireGame();
    }

    return html;
  }

}
