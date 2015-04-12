

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
public class Player implements Runnable {
  public static final boolean HUMAN = false;
  public static final boolean BOT = true;
  
  protected String usersName;
  protected String botFilePath;
  
  protected Process botProcess;
  protected InputStream stderr;
  protected BufferedReader reader;
  protected BufferedWriter writer;
  
  protected boolean humanOrBot;
  protected volatile boolean read;
  protected volatile String move;

  public Player() throws IOException {
    humanOrBot = HUMAN;    
    read = false;
    move = null;
    
    InputStream stdout = System.in;
    reader = new BufferedReader(new InputStreamReader(stdout));  
  }
  
  public Player(String botFilePath, String usersName, Language lang) throws IOException {
    this.botFilePath = botFilePath;
    String cmd = lang.getRunCommand();

    //System.err.println("Cmd:"+ cmd + ", name: " + usersName + ", \nPATH: " + botFilePath);
    
    ProcessBuilder builder = new ProcessBuilder("java" , usersName);
    builder.directory(new File(botFilePath));
    botProcess = builder.start();

    OutputStream stdin = botProcess.getOutputStream();
    InputStream stdout = botProcess.getInputStream();
    stderr = botProcess.getErrorStream();
    
    reader = new BufferedReader(new InputStreamReader(stdout));
    writer = new BufferedWriter(new OutputStreamWriter(stdin));  
    
    humanOrBot = BOT;
    read = false;
    move = null;
      
  }

  public String getMove(String board) {

    if(botProcess != null && !botProcess.isAlive()){
      return "Bot exited on its own.";
    }
    
    try {
      read = false;
      Thread readFromBotThread = new Thread(this);
      readFromBotThread.start();
      
      if (humanOrBot == BOT) {
        writer.write(board + "\n");
        writer.flush();
        System.err.println("\n\tREADING FROM BOT\n");
        readFromBotThread.join(Game.getBotTimeoutInMilliseconds());
      } else if (humanOrBot == HUMAN) {
        readFromBotThread.join();//Humans dont have a time out so wait forever.
      }
      

      if (read == true) {
        return move;
      } else {
        botProcess.destroyForcibly();
        return "Bot Timed Out";
      }

    } catch (IOException e) {
      botProcess.destroyForcibly();
      return "Bot Threw Exception";
    } catch (InterruptedException e) {
      botProcess.destroyForcibly();
      return null;
    }
  }
  
  public String getAnyStderr() {
    if(  humanOrBot == HUMAN ) {
      return "";
    }

    int avalBytes;
    try {
      avalBytes = stderr.available();
      byte[] buff = new byte[avalBytes];
  
      stderr.read(buff, 0, avalBytes);
      
      return new String(buff);
    } catch (IOException e) {
      return "Exception thrown while trying to read bots stderr.";
    }  
  }
  
  public String getBotFilePath() {
    return botFilePath;
  }

  public String getUsersName() {
    return usersName;
  }

  @Override
  public void run() {
    try {
      move = reader.readLine();
      
    } catch (IOException e) {
      move = "Bot Threw Exception";
    }
    read = true;
  }

  @Override
  public String toString() {
    return "Player [\n\t\tbotFilePath=" + botFilePath + ",\n\t\t usersName=" + usersName + "]";
  }


}