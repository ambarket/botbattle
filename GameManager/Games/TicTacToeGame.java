

import java.util.List;

/*
 * TODO: The GameInterface has changed significantly, and this Game is no longer playable.
 * Also the Game State JSON methods were never implemented for this. It was used as an
 * initial test game for the GameManager and it was only ever playable via command line
 * 
 * 
//TIC-TAC-TOE 
public class TicTacToeGame implements GameInterface {
  public String getStartingBoard() {
    return "000000000";
  }


  public String updateBoard(String move, String board, int player){
    // 0123456
    // 1, 1, X
    // Move will be of the form: row, col, value
    int row = Integer.parseInt(move.substring(0, 1));
    int col = Integer.parseInt(move.substring(3, 4));
    int index = 3 * (row - 1) + (col - 1);
    String s = move.substring(6);

    board = board.substring(0, index) + s + board.substring(index + 1);

    return board;
  }

  // Player value is not used in tic-tac-toe
  public boolean isValidMove(String move, String board, int player) {

    if (move == null) {
      return false;
    }

    // Move will be of the form: row, col, value
    int row = -1;
    int col = -1;
    String character;
    try {
      row = Integer.parseInt(move.substring(0, 1));
      col = Integer.parseInt(move.substring(3, 4));
      character = move.substring(6);
    } catch (Exception e) {
      System.out.println("Invalid move: " + move);
      return false;
    }

    if (row < 1 || row > 3 || col < 1 || col > 3)
      return false;
    if (character.length() > 1)
      return false;
    if (character.charAt(0) != 'X' && character.charAt(0) != 'O')
      return false;

    int index = 3 * (row - 1) + (col - 1);

    if (board.charAt(index) != '0')
      return false;
    else
      return true;
  }


  public boolean isGameOver(String board) {

    if (isGameWon(board)) {
      return true;
    }

    // check board is not completely full
    for (int i = 0; i < board.length(); i++) {
      if (board.charAt(i) == '0')
        return false;
    }

    return true;
  }


  public String getHTMLForBoard(String board) {
    // TODO implement getHTMLForBoard for ticTacToe game
    return null;
  }


  public static int getBotTimeoutInMilliseconds() {
    return 3000;
  }


  public boolean isGameWon(String board) {

    for (int i = 0; i < 3; i++) {
      int index = 3 * i;

      // check rows for match
      if (board.charAt(index) == 'X' || board.charAt(index) == 'O') {
        if (board.charAt(index) == board.charAt(index + 1)
            && board.charAt(index + 1) == board.charAt(index + 2)) {
          return true;
        }
      }

      // check colums for match
      if (board.charAt(i) == 'X' || board.charAt(i) == 'O') {
        if (board.charAt(i) == board.charAt(i + 3) && board.charAt(i + 3) == board.charAt(i + 6)) {
          return true;
        }
      }
    }

    // check diagnols for match
    if (board.charAt(0) == 'X' || board.charAt(0) == 'O') {
      if (board.charAt(0) == board.charAt(4) && board.charAt(4) == board.charAt(8)) {
        return true;
      }
    }
    if (board.charAt(2) == 'X' || board.charAt(2) == 'O') {
      if (board.charAt(2) == board.charAt(4) && board.charAt(4) == board.charAt(6)) {
        return true;
      }
    }

    return false;
  }

  public static String getName() {
    return "TicTacToe";
  }


  public String getJSONstringFromGameResults(GameResults results) {
    Object[] player1Moves = results.getPlayer1Moves().toArray();
    Object[] player2Moves = results.getPlayer2Moves().toArray();
    List<String> boards = results.getBoards();
    int winner = results.getWinner();
    int i = 0;

    String jsonString = "{\n";
    for (String board : boards) {
      jsonString += "Round" + (i + 1) + ": {\n";
      jsonString += "\tboard: " + board + ",\n";
      if (i % 2 == 0) {
        if (i / 2 < player1Moves.length) {
          jsonString += "\tplayer: 1,\n";
          jsonString += "\tmove: " + player1Moves[i / 2] + "\n";
        }
      } else {
        if (i / 2 < player2Moves.length) {
          jsonString += "\tplayer: 2,\n";
          jsonString += "\tmove: " + player2Moves[i / 2] + "\n";
        }
      }

      jsonString += "\t},\n";
      i++;
    }
    jsonString += "winner: " + winner;
    jsonString += "\n}";

    return jsonString;
  }

  @Override
  public String getBoard() {
    // TODO Auto-generated method stub
    return null;
  }


  @Override
  public void updateBoard(String move, int player) {
    // TODO Auto-generated method stub
    
  }


  @Override
  public boolean isValidMove(String board, int player) {
    // TODO Auto-generated method stub
    return false;
  }


  @Override
  public boolean isGameOver() {
    // TODO Auto-generated method stub
    return false;
  }


  @Override
  public boolean isGameWon() {
    // TODO Auto-generated method stub
    return false;
  }


  @Override
  public String getJSONStringForThisTurn() {
    // TODO Auto-generated method stub
    return null;
  }


  @Override
  public String getJSONStringForThisTurn(String botsStderr) {
    // TODO Auto-generated method stub
    return null;
  }


  @Override
  public String getInvalidMoveJSON() {
    // TODO Auto-generated method stub
    return null;
  }


  @Override
  public String getValidMoveJSON() {
    // TODO Auto-generated method stub
    return null;
  }


  @Override
  public void setOver(boolean over) {
    // TODO Auto-generated method stub
    
  }
}
*/
