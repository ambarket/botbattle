package game.manger;

import java.util.ArrayList;
import java.util.List;


public class GameResults {
	private List<String> boards;
	private List<String> player1Moves;
	private List<String> player2Moves;
	private int winner;
	
	public GameResults() {
		boards = new ArrayList<String>();
		player1Moves = new ArrayList<String>();
		player2Moves = new ArrayList<String>();
		winner = -1; //TODO use enumeration for players
	}
	
	@Override
	public String toString() {
		String results = "";
		
		int i = 0;
		
		for (String board : boards) {
			results += "Board: " + board + "\n";
			
			if(i % 2 == 0){
				if(i/2 < player1Moves.size())
					results += "\tPlayer 1: " + player1Moves.get(i/2) + "\n";
			}
			else{
				if(i/2 < player2Moves.size())
					results += "\tPlayer 2: " + player2Moves.get(i/2) + "\n";
			}
			i++;
		}
		
		return results;
	}

	public void addMove(String move, int player){
		if(player == 1)
			player1Moves.add(move);
		else //(player == 2) //TODO change player to enum and maybe fix this if
			player2Moves.add(move);
	}
	
	public void addBoard(String board){
		boards.add(board);
	}

	public int getWinner() {
		return winner;
	}

	public void setWinner(int winner) {
		this.winner = winner;
	}
	
	//TODO: remove new lines and tabs once this gets approved
	//TODO: move this to game class
	public String toJSONString(){
		String jsonString = "{\n";
		
		int i = 0;
		for (String board : boards) {
			jsonString += "Round" + (i+1) + ": {\n";
			jsonString += "\tboard: " + board + ",\n";
			if(i % 2 == 0){
				if(i/2 < player1Moves.size()){
					jsonString += "\tplayer: 1,\n"; 
					jsonString += "\tmove: " + player1Moves.get(i/2) + "\n";
				}
			}
			else{
				if(i/2 < player2Moves.size()){
					jsonString += "\tplayer: 2,\n"; 
					jsonString += "\tmove: " + player2Moves.get(i/2) + "\n";
				}
			}
			
			jsonString += "\t},\n";
			i++;
		}
		jsonString += "winner: " + winner;
		jsonString += "\n}";
		
		return jsonString;
	}
}
