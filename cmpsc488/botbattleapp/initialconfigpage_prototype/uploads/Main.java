import java.math.BigInteger;
import java.util.HashSet;
import java.util.Scanner;


public class Main {

      public static BigInteger[][] paths;
      public static int m, n, p, q, b, numLevels, caseNum;
      public static HashSet<Coord> blocks;

      public static  boolean inBounds(int row, int col)
      {
            return row < m && row >= 0 && col < n && col >= 0 && !blocks.contains(new Coord(row, col));
      }
      
      public static void main(String[] args) {
            Scanner sc = new Scanner(System.in);
            
            m = sc.nextInt();
            n = sc.nextInt();
            p = sc.nextInt();
            q = sc.nextInt();
            b = sc.nextInt();
            numLevels = 0;
            blocks = new HashSet<Coord>();
            caseNum = 1;
            StringBuffer sb = new StringBuffer();
            
            while (m != 0 && n != 0)
            {

                        for (int i = 0; i < b; i++)
                        {
                              blocks.add(new Coord(sc.nextInt(), sc.nextInt()));
                        }
                        
                        HashSet<Coord> currLevel = new HashSet<Coord>();
                        HashSet<Coord> nextLevel = new HashSet<Coord>();
                        
                        paths = new BigInteger[m][n];
                        paths[0][0] = BigInteger.ONE;
                        
                        if (inBounds(p, q))
                        {
                              currLevel.add(new Coord(p, q));
                        }
                        if (inBounds(q, p))
                        {
                              currLevel.add(new Coord(q, p));
                        }
                        
                        do
                        {
                              for (Coord curr : currLevel)
                              {      
                                    
                                    if (paths[curr.row][curr.col] == null)
                                    {
                                          paths[curr.row][curr.col] = BigInteger.ZERO;
                                    }
                                    
                                    int r1 = curr.row - p, c1 = curr.col - q;
                                    int r2 = curr.row - q, c2 = curr.col - p;
                                    int r3 = curr.row + p, c3 = curr.col + q;
                                    int r4 = curr.row + q, c4 = curr.col + p;
                                    
                                    if (inBounds(r1, c1))
                                    {
                                          if (paths[r1][c1] != null)
                                          {
                                                paths[curr.row][curr.col] = paths[curr.row][curr.col].add(paths[r1][c1]);
                                          }                  
                                    }
                                    
                                    if (inBounds(r2, c2) && (r1 != r2 || c1 != c2))
                                    {
                                          if (paths[r2][c2] != null)
                                          {
                                                paths[curr.row][curr.col] = paths[curr.row][curr.col].add(paths[r2][c2]);
                                          }
                                    }
                                    
                                    if (inBounds(r3, c3))
                                    {
                                          nextLevel.add(new Coord(r3, c3));
                                    }
                                    if (inBounds(r4, c4))
                                    {
                                          nextLevel.add(new Coord(r4, c4));
                                    }
                              }
                              currLevel = nextLevel;
                              nextLevel = new HashSet<Coord>();
                              numLevels++;
                        } while (!currLevel.isEmpty());
                              
                        if (paths[m-1][n-1] == null)
                        {
                              System.out.println(("Case " + caseNum + ": Impossible"));
                        }
                        else
                        {
                              String num = paths[m -1][n-1].toString();
                              System.out.println(("Case " + caseNum + ": " + numLevels + " " + num  ));
                        }
                        
                        m = sc.nextInt();
                        n = sc.nextInt();
                        p = sc.nextInt();
                        q = sc.nextInt();
                        b = sc.nextInt();
                        numLevels = 0;
                        blocks = new HashSet<Coord>();
                        caseNum++;
                  }      
            
                 // System.out.println(sb.substring(0, sb.length()-1));
            }

       static class Coord
       {
            public int row, col;
            public Coord (int r, int c)
            {
                  row = r;
                  col = c;
            }
            
            @Override
            public boolean equals(Object o)
            {
                  if (this == o) return true;
                  if (o == null) return false;
                  if (o.getClass() != this.getClass()) return false;
                  Coord that = (Coord)o;
                  return this.row == that.row && this.col == that.col;
            }
            
            @Override
            public int hashCode()
            {
            	  return 37 * row + 17 * col;
            }
      }
}
