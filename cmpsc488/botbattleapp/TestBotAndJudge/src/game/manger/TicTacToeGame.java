package game.manger;

public class TicTacToeGame implements GameInterface {
	
	private String board;
	
	public TicTacToeGame() {
		board = "111222333";
	}
	
	@Override
	public String getBoard() {
		return board;
	}

	@Override
	public void updateBoard(String move) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public boolean isValidMove(String move) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isGameOver() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public String getHTMLForBoard() {
		// TODO Auto-generated method stub
		return null;
	}

}
