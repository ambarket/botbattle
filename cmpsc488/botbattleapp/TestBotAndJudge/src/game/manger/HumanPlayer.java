package game.manger;

import java.util.Scanner;

public class HumanPlayer implements Player {

	@Override
	public String getMove(String board) {
		// TODO Auto-generated method stub
		
		Scanner scner = new Scanner(System.in);
		String move = scner.nextLine();
		
		return move;
	}

}
