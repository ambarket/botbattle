
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
  
  public Player(String botFilePath, String executable, Language lang) throws IOException {
    this.botFilePath = botFilePath;
    String cmd = lang.getRunCommand();
    // Start of trying to do setuid thing, its only going to work for c++ bots though...
    // http://unix.stackexchange.com/questions/166817/using-the-setuid-bit-properly
    // Process p =  Runtime.getRuntime().exec("/home/amb6470/testuid");
    // p.waitFor();
    
   // System.err.println("Cmd:"+ cmd + ", name: " + executable + ", \nPATH: " + botFilePath);
    ProcessBuilder builder;
    if (!cmd.equals("")) {
      builder = new ProcessBuilder(cmd , executable);    // For java it has to be just the class name
      builder.directory(new File(botFilePath));         // And you have to set the directory.
    }
    else {
      // For c++ you have to have the whole path. And directory as done for java has no effect
      builder = new ProcessBuilder(botFilePath + "/" + executable);  
    }

    
    botProcess = builder.start();

    OutputStream stdin = botProcess.getOutputStream();
    InputStream stdout = botProcess.getInputStream();
    stderr = botProcess.getErrorStream();
    
    reader = new BufferedReader(new InputStreamReader(stdout));
    writer = new BufferedWriter(new OutputStreamWriter(stdin));  
    
    humanOrBot = BOT;
    read = false;
    move = null;
    
    Thread closeChildThread = new Thread() {
      public void run() {
        killBotProcess();
      }
    };

    Runtime.getRuntime().addShutdownHook(closeChildThread); 
      
  }
  
  public String getMove(String board, int moveTimeout) {

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
        readFromBotThread.join(moveTimeout);
      } else if (humanOrBot == HUMAN) {
    	  readFromBotThread.join(moveTimeout);
      }
      

      if (read == true) {
        return move;
      } else {
        return "MoveTimeoutExceeded";
      }

    } catch (IOException e) {
      return "ExpectionWhileReadingMove";
    } catch (InterruptedException e) {
      return "ExpectionWhileReadingMove";
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
  
  public void killBotProcess() {
    if (humanOrBot == BOT) {
      botProcess.destroyForcibly();
    }
  }
}
