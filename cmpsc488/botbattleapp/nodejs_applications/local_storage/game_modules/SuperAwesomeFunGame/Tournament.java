

import java.io.IOException;


public class Tournament {

	private Round rounds[];
	private String pathToRulesPDF;
	private String tournamentName;
	
	
	public Tournament(String pathToRulesPDF, String tournamentName, CompetitorData competitors) {
		this.pathToRulesPDF = pathToRulesPDF;
		this.tournamentName = tournamentName;
		int numberOfCompetitors = competitors.getNumberOfCompetitors();
		rounds = new Round[(int)(Math.log(numberOfCompetitors)/Math.log(2))];
		
		try {
			rounds[0] = new Round(competitors);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			System.out.println("Failed to create tournament; exception was thrown");
			e.printStackTrace();
		}
	}
	
	public void runTournament() throws IOException {
		
		rounds[0].runRound();
		CompetitorData winners = rounds[0].getWinners();
		
		for (int i = 1; i < rounds.length; i++) {
			rounds[i] = new Round(winners);
			rounds[i].runRound();
			winners = rounds[i].getWinners();
		}
	}
	
	public String toHTML(){//TODO toHTML for Tournaments
		String html = "";
		
		for (Round round : rounds) {
			html += round.toHTML();
		}
		
		return html;
	}
	
	
}
