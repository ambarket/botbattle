package game.manger;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * @author Randall
 *
 */
public class Player {
	private String botFilePath;
	private Process botProcess;
	private String usersName;
	
	/**
	 * @param botFilePath
	 * @param botProcess
	 * @param usersName
	 */
	public Player(String botFilePath, String usersName) {
		this.botFilePath = botFilePath;
		this.usersName = usersName;
		
		try {
			this.botProcess = Runtime.getRuntime().exec("java " + botFilePath + "/" + usersName);
		} catch (IOException e) {
			this.botProcess = null;
		}
	}
	
	public String getBotFilePath() {
		return botFilePath;
	}

	public String getUsersName() {
		return usersName;
	}
	
	public OutputStream getOutputStream(){
		if(botProcess != null)
			return botProcess.getOutputStream();
		else
			return null;
	}
	
	public InputStream getInputStream(){
		if(botProcess != null)
			return botProcess.getInputStream();
		else
			return null;
	}
	
	
	
}
