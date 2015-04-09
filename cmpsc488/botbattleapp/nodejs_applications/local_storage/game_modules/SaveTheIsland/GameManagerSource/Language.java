
public enum Language {
  INVALID, JAVA, CPP, GO, PYTHON, RUBY;
  
  private String command;

  static {
    INVALID.command = "";
    JAVA.command = "java";
    CPP.command = "";
    GO.command = "";
}
  
  public String getRunCommand() {
   return command;
  }
}

