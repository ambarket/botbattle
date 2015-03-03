package game.manger;

import java.io.BufferedReader;
import java.util.TimerTask;
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
public class Player implements Runnable {
	protected String botFilePath;
	protected Process botProcess;
	protected String usersName;
	protected BufferedReader reader;
	protected BufferedWriter writer;
	protected volatile boolean read;
	protected volatile String move;
	
	
	//TODO: change thrown exception to try catch block or
	//		maybe add try catch block in gameManager
	/**
	 * 
	 * @param botFilePath
	 * @param usersName
	 * @throws IOException
	 */
	public Player(String botFilePath, String usersName) throws IOException {
		this.botFilePath = botFilePath;
		this.usersName = usersName;
		
		ProcessBuilder builder = new ProcessBuilder("java", usersName);//TODO: remove false; its just for testing
		builder.directory(new File(botFilePath));
		
		botProcess = builder.start();
		
		OutputStream stdin = botProcess.getOutputStream(); 
        InputStream stdout = botProcess.getInputStream();

        reader = new BufferedReader(new InputStreamReader(stdout));
        writer = new BufferedWriter(new OutputStreamWriter(stdin));
        read = false;  
        move = null;
	}
	
	public String getMove(String board) throws InterruptedException{
		

		try {
			writer.write(board + "\n");
			writer.flush();
			read = false;
			Thread t = new Thread(this);
			t.start();
			t.join(3000);

			if(read == true){
				return move;
			}
			else{
				System.out.println("Sending eof");
				writer.write("\n\n\n\u001a\n\u001a");
				writer.flush();
				System.out.println("trying to close");
				reader.close();
				System.out.println("Closed");
			}

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

	@Override
	public void run() {
		
			System.out.println("Trying to read move");
			try {
				move = reader.readLine();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			System.out.println("Move read: " + move);
			read = true;
			
	}

	@Override
	public String toString() {
		return "Player [\n\t\tbotFilePath=" + botFilePath + ",\n\t\t usersName="
				+ usersName + "]";
	}
	
	
}
