package game.manger;

import static org.junit.Assert.*;

import java.io.IOException;

import org.junit.Test;

public class PlayerTest {
	String path = "C:\\Users\\Kitty\\git\\botbattle\\cmpsc488\\botbattleapp\\TestBotAndJudge\\bin";
	@Test
	public void testPlayer() throws IOException {
		Player p1 = new Player(path, "TicTacToeBot");
		
		assertNotNull(p1);
	}
	
	@Test
	public void testPlayer2() throws IOException {
		Player p1 = new Player(path, "TicTacToeBot");
		
		assertNotNull(p1.botProcess);
	}
	
	@Test
	public void testPlayer3() throws IOException {
		Player p1 = new Player(path, "TicTacToeBot");
		
		assertNotNull(p1.reader);
	}
	
	@Test
	public void testPlayer4() throws IOException {
		Player p1 = new Player(path, "TicTacToeBot");
		
		assertNotNull(p1.writer);
	}
	
	@Test
	public void testPlayer5() throws IOException {
		Player p1 = new Player(path, "TicTacToeBot");
		
	}
	
	@Test
	public void testGetMove() throws IOException {
		Player p1 = new Player(path, "TicTacToeBot");
		
	}

	@Test
	public void testRun() {
		fail("Not yet implemented");
	}

}
