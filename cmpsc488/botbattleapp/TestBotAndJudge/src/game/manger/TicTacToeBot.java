package game.manger;

public class TicTacToeBot{

	boolean temp;
	
	public TicTacToeBot(boolean temp) {
		this.temp = temp;
	}
	

	public String getMove(String board) {
		int row = 1, col = 1;
		int i = 0;
		for (char c : board.toCharArray()) {
			if(c == '0'){
				String move = row + ", " + col + ", " + (temp ? "X" : "O");
				return move;
			}
			
			col++;
			if(col == 4){
				col = 1;
				row++;
			}
		}
		
		
		// TODO Auto-generated method stub
		return null;
	}

}
