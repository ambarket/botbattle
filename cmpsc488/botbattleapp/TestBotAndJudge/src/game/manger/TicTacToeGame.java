package game.manger;

public class TicTacToeGame implements GameInterface {
	
	private String board;
	
	public TicTacToeGame() {
		board = "000000000";
	}
	
	public TicTacToeGame(String board) {
		this.board = board;
	}
	
	@Override
	public String getBoard() {
		return board;
	}

	@Override
	public void updateBoard(String move) {
		// 0123456
		// 1, 1, X
		//Move will be of the form: row, col, value
		int row = Integer.parseInt(move.substring(0, 1));
		int col = Integer.parseInt(move.substring(3, 4));
		int index = 3 * (row - 1) + (col - 1);
		String s = move.substring(6);

		board = board.substring(0, index) + s + board.substring(index + 1);

	}

	@Override
	public boolean isValidMove(String move) {
		//Move will be of the form: row, col, value
		int row = -1;
		int col = -1;
		String character;
		try {
			row = Integer.parseInt(move.substring(0, 1));
			col = Integer.parseInt(move.substring(3, 4));
			character = move.substring(6);
		} catch (NumberFormatException e) {
			System.out.println("Invalid move: " + move);
			return false;
		}
		
		if(row < 1 || row > 3 || col < 1 || col > 3)
			return false;
		if(character.length() > 1)
			return false;
		if(character.charAt(0) != 'X' && character.charAt(0) != 'O')
			return false;		
		
		int index = 3 * (row - 1) + (col - 1);
		
		if(board.charAt(index) != '0')
			return false;
		else
			return true;
	}

	@Override
	public boolean isGameOver() {
		
		if(isGameWon()){
			return true;
		}
		
		//check board is not completely full
		for(int i = 0; i < board.length(); i++){
			if(board.charAt(i) == '0')
				return true;
		}
		
		return false;
	}

	@Override
	public String getHTMLForBoard() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public int getBotTimeoutInMilliseconds() {
		return 3000;
	}

	@Override
	public String toString() {
		return "TicTacToe";
	}

	@Override
	public boolean isGameWon() {
		
		for(int i = 0; i < 3; i++)
		{
			int index = 3 * i;
			
			// check rows for match
			if(board.charAt(index) == 'X' || board.charAt(index) == 'O'){
				if(board.charAt(index) == board.charAt(index + 1) 
						&& board.charAt(index + 1) == board.charAt(index + 2)){
					return true;
				}
			}
			
			//check colums for match
			if(board.charAt(i) == 'X' || board.charAt(i) == 'O'){
				if(board.charAt(i) == board.charAt(i + 3) 
						&& board.charAt(i + 3) == board.charAt(i + 6)){
					return true;
				}
			}
		}
		
		//check diagnols for match
		if(board.charAt(0) == 'X' || board.charAt(0) == 'O'){
			if(board.charAt(0) == board.charAt(4) 
					&& board.charAt(4) == board.charAt(8)){
				return true;
			}
		}
		if(board.charAt(2) == 'X' || board.charAt(2) == 'O'){
			if(board.charAt(2) == board.charAt(4) 
					&& board.charAt(4) == board.charAt(6)){
				return true;
			}
		}
		
		return false;
	}

}
