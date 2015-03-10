package game.manger;

public class CompetitorData {

	String users[];
	String botPaths[];
	
	public CompetitorData(String JSONstring) {
		
	}
	
	public int getNumberOfCompetitors() {
		return users.length;
	}
	public String getUser(int i){
		return users[i];
	}
	public String getBotPath(int i) {
		return botPaths[i];
	}
}
