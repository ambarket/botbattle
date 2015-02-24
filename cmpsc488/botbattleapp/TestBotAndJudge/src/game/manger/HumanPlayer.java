package game.manger;

import java.util.Scanner;

public class HumanPlayer implements Player {

	@Override
	public String getMove(String board) {
		
		// TODO Properly display board
		System.out.println(board);
		
		Scanner scner = new Scanner(System.in);
		String move = scner.nextLine();
		
		return move;
	}

}
