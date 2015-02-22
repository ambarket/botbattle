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
	
	public String toJSONobject(){
		return null;
		//TODO implement toJSON function in game results
	}
}
