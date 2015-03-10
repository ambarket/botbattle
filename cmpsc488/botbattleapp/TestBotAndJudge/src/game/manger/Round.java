package game.manger;

import java.io.IOException;

public class Round {
	
	private GameManager games[];
	
	public Round(CompetitorData competitors) throws IOException {
		
		games = new GameManager[(int) Math.ceil(competitors.getNumberOfCompetitors() / 2)];
		
		for (int i = 0; i < games.length; i++) {
			
			Player p1 = new Player(competitors.getUser(i), competitors.getBotPath(i));
			Player p2 = null;
			
			if( i + 1 > competitors.getNumberOfCompetitors() ) { //Possible we have odd number of competitors
				p2 = new Player("badBot", "badBot");// TODO
			} else {
				p2 = new Player(competitors.getUser(i + 1), competitors.getBotPath(i + 1));
			}
			
			games[i] = new GameManager(p1, p2);
		}
	}
	
	public void runRound(){
		for (GameManager gameManager : games) {
			gameManager.run(); 
		}
	}
	
	public CompetitorData getWinners() {		
		CompetitorData winners = new CompetitorData();
		
		for (int i = 0; i < games.length; i++) {
			Player plyr = games[i].getWinner();
			if( plyr != null ) {
				winners.addUser(plyr.usersName, plyr.botFilePath);
			}
		}
		
		return winners;
	}
	
	public String toHTML() { //TODO 
		String html = "";
		
		for (GameManager gameManager : games) {
			html += gameManager.getHTMLForEntireGame();
		}
		
		return html;
	}
	
}
