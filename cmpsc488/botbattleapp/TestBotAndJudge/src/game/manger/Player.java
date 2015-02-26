package game.manger;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;

/**
 * @author Randall
 *
 */
public class Player {
	private String botFilePath;
	private Process botProcess;
	private String usersName;
	private BufferedReader reader;
	private BufferedWriter writer;
	
	
	//TODO: change thrown exception to try catch block or
	//		maybe add try catch block in gameManager
	/**
	 * @param botFilePath
	 * @param botProcess
	 * @param usersName
	 * @throws IOException 
	 */
	public Player(String botFilePath, String usersName) throws IOException {
		this.botFilePath = botFilePath;
		this.usersName = usersName;
		
		ProcessBuilder builder = new ProcessBuilder("java", usersName);
		builder.directory(new File(botFilePath));
		
		botProcess = builder.start();
		
		OutputStream stdin = botProcess.getOutputStream(); 
        InputStream stdout = botProcess.getInputStream();

        reader = new BufferedReader(new InputStreamReader(stdout));
        writer = new BufferedWriter(new OutputStreamWriter(stdin));
	}
	
	public String getMove(String board){
		
		try {
			writer.write(board);
			return reader.readLine();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return null;
	}

	//TODO: determine if these Streams are needed outside of this class
	//		if they are not then remove these getters
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
	
	
	public String getBotFilePath() {
		return botFilePath;
	}

	public String getUsersName() {
		return usersName;
	}
	
	
}
