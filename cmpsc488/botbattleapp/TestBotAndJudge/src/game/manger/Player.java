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
public class Player implements Runnable {
  public static final boolean HUMAN = false;
  public static final boolean BOT = true;
  
  protected String botFilePath;
  protected Process botProcess;
  protected String usersName;
  protected BufferedReader reader;
  protected BufferedWriter writer;
  protected boolean humanOrBot;
  protected volatile boolean read;
  protected volatile String move;

  //This constructor is for human players
  public Player(String botFilePath) throws IOException {
    humanOrBot = HUMAN;
    
    ProcessBuilder builder = new ProcessBuilder("java", "HumanPlayer");
    builder.directory(new File(botFilePath));
    botProcess = builder.start();

    OutputStream stdin = botProcess.getOutputStream();
    InputStream stdout = botProcess.getInputStream();

    reader = new BufferedReader(new InputStreamReader(stdout));
    writer = new BufferedWriter(new OutputStreamWriter(stdin));
    
    read = false;
    move = null;
  }

  // TODO: change thrown exception to try catch block or maybe add try catch block in gameManager
  public Player(String botFilePath, String usersName) throws IOException {
    this.botFilePath = botFilePath;
    this.usersName = usersName;

    ProcessBuilder builder = new ProcessBuilder("java", usersName); // TODO do somthing with file
                                                                    // path here?
    builder.directory(new File(botFilePath));
    botProcess = builder.start();

    OutputStream stdin = botProcess.getOutputStream();
    InputStream stdout = botProcess.getInputStream();

    reader = new BufferedReader(new InputStreamReader(stdout));
    writer = new BufferedWriter(new OutputStreamWriter(stdin));
    
    humanOrBot = BOT;
    read = false;
    move = null;
  }


  public String getMove(String board) {

    if(!botProcess.isAlive()){
      return "Bot exited on its own.";
    }
    
    try {
      writer.write(board + "\n");
      writer.flush();
      read = false;
      Thread readFromBotThread = new Thread(this);
      readFromBotThread.start();
      
      if (humanOrBot == BOT) {
        
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
  
  //This is the bots stdin, we write to it
  public OutputStream getOutputStream() {
    if (botProcess != null && botProcess.isAlive())
      return botProcess.getOutputStream();
    else
      return null;
  }

  //This is the bots stdout, we read from it
  public InputStream getInputStream() {
    if (botProcess != null && botProcess.isAlive())
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
