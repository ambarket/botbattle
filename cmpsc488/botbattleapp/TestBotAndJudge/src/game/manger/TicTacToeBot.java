package game.manger;

public class TicTacToeBot{

	static boolean temp;
	
	public static void main(String[] args){
		temp = Boolean.parseBoolean(args[0]);
		
		//TODO add loop reading from stdin
		//check if equal to game over
		//if not get move
		//write move to output
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
