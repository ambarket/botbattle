package game.manger;

import static org.junit.Assert.*;

import java.io.IOException;

import org.junit.Test;

public class PlayerTest {
	String path = "C:\\Users\\Kitty\\git\\botbattle\\cmpsc488\\botbattleapp\\TestBotAndJudge\\bin";
	
	@Test
	public void testPlayer() throws IOException {
		Player p1 = new Player(path, "TicTacToeBot1");
		
		assertNotNull(p1);
	}
	
	@Test
	public void testPlayerBotProcessNotNull() throws IOException {
		Player p1 = new Player(path, "TicTacToeBot1");
		
		assertNotNull(p1.botProcess);
	}
	
	@Test
	public void testPlayerReadStreamNotNull() throws IOException {
		Player p1 = new Player(path, "TicTacToeBot1");
		
		assertNotNull(p1.reader);
	}
	
	@Test
	public void testPlayerWriteStreamNotNull() throws IOException {
		Player p1 = new Player(path, "TicTacToeBot1");
		
		assertNotNull(p1.writer);
	}

	
	@Test
	public void testGetMove() throws IOException, InterruptedException {
		Player p1 = new Player(path, "TicTacToeBot1");
		
		String move = p1.getMove(TicTacToeGame.getStartingBoard());
		assertNotNull(move);
	}

	@Test
	public void testRun() throws IOException {
		Player p1 = new Player(path, "TicTacToeBot1");

		p1.writer.write(TicTacToeGame.getStartingBoard() + "\n");
		p1.writer.flush();
		p1.run();
		
		assertNotNull(p1.move);
	}
	
	@Test
	public void testGetMoveTimeout() throws IOException, InterruptedException {
		Player p1 = new Player(path, "BadTicTacToeBot1");
		
		String move = p1.getMove(TicTacToeGame.getStartingBoard());
		
		assertEquals("Bot Timed Out", move);
	}

}
