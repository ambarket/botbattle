

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

@RunWith(Suite.class)
@SuiteClasses({ BoardTests.class, PlayerTest.class,
		SaveTheIslandGameTest.class, TicTacToeGameTest.class })
public class AllTests {

}
