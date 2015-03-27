
import java.util.Scanner;

public class HumanPlayer {


	public String getMove(String board) {
		
		// TODO Properly display board
		System.out.println(board);
		
		Scanner scner = new Scanner(System.in);
		String move = scner.nextLine();
		
		scner.close();
		return move;
	}

}
