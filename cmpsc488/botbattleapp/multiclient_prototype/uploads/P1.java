import java.io.*;
import java.util.Scanner;

class P1 
{
	public static void main(String args[])
	{
		System.out.println(
				"Project 1 test driver. Enter any of the following commands:\n"+
						"  (Command prefixes are allowed)\n"+
						"\tOpen (a new scope)\n"+
						"\tClose (innermost current scope)\n"+
						"\tQuit (test driver)\n"+
						"\tDump (contents of symbol table)\n"+
						"\tInsert (symbol,integer pair into symbol table)\n"+
						"\tLookup (lookup symbol in top scope)\n"+
						"\tGlobal (global lookup of symbol in symbol table)\n"+
				"");

		// Complete this
		SymbolTable symTable = new SymbolTable();
		Scanner sc = new Scanner(System.in);

		String command = sc.next().toLowerCase();
		while (!command.equals("quit") && !command.equals("q")) 
		{
			if (command.equals("open") || command.equals("o")) 
			{
				symTable.openScope();
				System.out.println("New scope opened.");
			}
			else if (command.equals("close") || command.equals("c")) 
			{
				try 
				{
					symTable.closeScope();
					System.out.println("Top scope closed.");
				}
				catch (EmptySTException e) 
				{
					System.out.println("Can't close an empty Symbol Table");
				}
			}
			else if (command.equals("dump") || command.equals("d")) 
			{
				symTable.dump(System.out);
			}
			else if (command.equals("insert") || command.equals("i"))
			{
				System.out.println("Enter symbol:");
				String symName = sc.next();
				//System.out.println();
				int symInt = 0;
				boolean validInt = false;
				while (!validInt) {
					System.out.println("Enter associated integer:");
					String s = sc.next();
					//System.out.println();
					try {
						symInt = Integer.parseInt(s);
						validInt = true;
					}
					catch (NumberFormatException e)
					{
						System.out.println("You did not enter a valid integer, please try again.");
					}
				}

				try 
				{
					Symb symb = new TestSym(symName, symInt);
					symTable.insert(symb);
					System.out.println(symb.toString() + "entered into symbol table.");
				}
				catch (DuplicateException de) {
					System.out.println(symName + " already exists in the current scope.");
				}
				catch (EmptySTException este) {
					System.out.println("Can't insert to an empty Symbol Table");
				}
			}
			else if (command.equals("lookup") || command.equals("l")) 
			{
				System.out.println("Enter symbol:");
				String symName = sc.next();
				//System.out.println();
				Symb s = symTable.localLookup(symName);
				if (s == null) {
					System.out.println(symName + " not found in top scope");
				}
				else {
					System.out.println(s.toString() + " found in top scope");
				}
			}
			else if (command.equals("global") || command.equals("g"))
			{
				System.out.println("Enter symbol:");
				String symName = sc.next();
				//System.out.println();
				Symb s = symTable.globalLookup(symName);
				if (s == null) {
					System.out.println(symName + " not found in symbol table");
				}
				else {
					System.out.println(s.toString() + " found in symbol table");
				}
			}
			else {
				System.out.println("Invalid Command");
			}
			command = sc.next().toLowerCase();
		}	
		System.out.println("Testing done!");
		return;
	} // main
} // class P1
