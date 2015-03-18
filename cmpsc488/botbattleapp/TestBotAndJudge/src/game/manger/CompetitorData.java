package game.manger;

import java.util.ArrayList;

public class CompetitorData {

//	String users[];
//	String botPaths[];
	ArrayList<String> users;
	ArrayList<String> botPaths;
	
	public CompetitorData() {
		users = new ArrayList<String>();
		botPaths = new ArrayList<String>();
	}
	
	public CompetitorData(String JSONstring) {
		
	}
	
	public void addUser(String user, String botpath) {
		users.add(user);
		botPaths.add(botpath);
	}
	
	public int getNumberOfCompetitors() {
		return users.size();
	}
	public String getUser(int i){
		return users.get(i);
	}
	public String getBotPath(int i) {
		return botPaths.get(i);
	}
}
