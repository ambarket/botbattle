/************************************/
/*			Austin Barket			*/
/*		CMPSC 470: Code Generator 	*/
/*			12-7-2014				*/
/************************************/

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Scanner;

public class CodeGenerator {

	public static void main(String[] args)
	{
		// Get list of scores from user
		ArrayList<Double> input = new ArrayList<Double>();

		Scanner sc = new Scanner(System.in);
		double tmpInput;
		boolean done = false;
		while (!done)
		{
			System.out.println("Enter an exam score, -99 to end input: ");
			tmpInput = sc.nextDouble();
			if (tmpInput == -99)
			{
				done = true;
				break;
			}
			else
			{
				input.add(tmpInput);
			}
		}

		// Build the Jasmin file

		String classSetup = 
			".class public MinMax" 											+ "\n" +
			".super java/lang/Object" 										+ "\n" +
			";" 															+ "\n" +
			"; standard initializer (calls java.lang.Object's initializer)" + "\n" +
	    	";"																+ "\n" +
	    	".method public <init>()V" 										+ "\n" +
	    	"   aload_0" 													+ "\n" +
	    	"   invokenonvirtual java/lang/Object/<init>()V" 				+ "\n" +
	    	"   return" 													+ "\n" +
	    	".end method" 													+ "\n";

		String mainMethod = 
			";"																			+ "\n" +
	    	"; main() - setup scores array and call computerMin and computeMax" 		+ "\n" +
			";" 																		+ "\n" +
			".method public static main([Ljava/lang/String;)V" 							+ "\n" +
			".limit stack 4              ; up to four items can be pushed" 	+ "\n" +
			".limit locals 3             ; 3 local variables" 				+ "\n";

		// Local var: 0 - String[], 1 - scores array size, 2 - scores array
		String createDoubleArray = 
			"ldc " + input.size()   + "\t\t\t\t ;  Push number of exam scores (size of array)" 		+ "\n" +
			"istore_1                 ;  Store array size in local variable 1" 			+ "\n" +
			"iload_1                  ;  Push array size to stack" 						+ "\n" +
			"newarray double          ;  ...and create new double array of that length" + "\n" +
			"astore 2                 ;  Store new array in local variable 2" 			+ "\n";
				
			for (int i = 0; i < input.size(); i++)
			{
				createDoubleArray +=
						"aload 2"						+ "\t\t\t\t ;  Push array to stack" 				+ "\n" +
						"ldc " + i 				+ "\t\t\t\t ;  Push index " 						+ "\n" +
						"ldc2_w " + input.get(i) + "\t\t\t\t ;  Push value " 							+ "\n" +
						"dastore"						+ "\t\t\t\t ;  store value in array[index]" 		+ "\n";
			}
			
		String callComputeMax =
			"aload 2                                       ;  Push array to stack" 			+ "\n" +
			" invokestatic MinMax/computeMax([D)V          ;  Call computeMax"				+ "\n";

		String callComputeMin =
			"aload 2                                       ;  Push array to stack" 			+ "\n" +
			" invokestatic MinMax/computeMin([D)V          ;  Call computeMax"				+ "\n";

		// Used by all methods
		String returnVoid =
				"return" 	  + "\n" +
				".end method" + "\n";

		mainMethod += createDoubleArray;
		mainMethod += callComputeMax;
		mainMethod += callComputeMin;
		mainMethod += returnVoid;
		//End main()
			 
		// Locals: 0 - scores[], 1 - array size, 2-3 - curr_min, 4 - loop counter
		String computeMaxMethod =
			";"																				+ "\n" +
			"; computeMax() - print maximum score in the array"					 			+ "\n" +
			";" 																			+ "\n" +
			".method public static computeMax([D)V" 										+ "\n" +
			".limit stack  4            ;  up to three items can be pushed" 	+ "\n" +
			".limit locals 5            ;  5 local variables are used" 			+ "\n";
		String calcMax =
			"ldc "+input.size()+ "\t\t  ;  Push number of exam scores (size of array)" 		+ "\n" +
			"istore_1                   ;  Store array size in local variable 1" 			+ "\n" +
			"aload_0                    ;  Push array onto stack"							+ "\n" +
			"iconst_0                   ;  Push index  0 onto stack"						+ "\n" +
			"daload                     ;  Push value at array[0]"							+ "\n" +
			"dstore_2                   ;  Start Min (local var 2-3) off at array[0]" 		+ "\n" +

			"iconst_1                   ;  Push int constant 1" 							+ "\n" +
			"istore 4                   ;  Store into loop counter (local var 4) (i=1)" 	+ "\n" +
			"goto Label_Compare         ;  Skip inc, compare, then run body"				+ "\n" +
			
			"Label_Body:"				 													+ "\n" +
			"aload_0                    ;  Push array onto stack"							+ "\n" +
			"iload 4                    ;  Push index onto stack"							+ "\n" +
			"daload                     ;  Push value at array[index]"						+ "\n" +
			"dload_2                    ;  Push current max"								+ "\n" +
			"dcmpl                      ;  Push -1, 0, or 1 for <, =, >"					+ "\n" +
			"iflt Label_Inc             ;  If array[index] < Max, continue"					+ "\n" +
			"                           ;  Otherwise set max = array[index]"				+ "\n" +
			"aload_0                    ;  Push array onto stack"							+ "\n" +
			"iload 4                    ;  Push index onto stack"							+ "\n" +
			"daload                     ;  Push value at array[index]"						+ "\n" +
			"dstore_2                   ;  Store array[index] in max"						+ "\n" +

			"Label_Inc:"																	+ "\n" +
			"iinc 4 1                   ;  i++, no change to stack"							+ "\n" +

			"Label_Compare:" 																+ "\n" +
			"iload 4                    ;  push current index"								+ "\n" +
			"iload_1                    ;  push size of array"								+ "\n" +
			"if_icmplt Label_Body       ;  keep looping if i < size"						+ "\n";
 	
		// Used by both computeMin and computeMax
		String printToScreen =
				"getstatic java/lang/System/out Ljava/io/PrintStream;"											     + "\n" +
				"dload_2                                             ; Push max, will be passed as argument"		 + "\n" +
				"invokevirtual java/io/PrintStream/println(D)V       ; invokes java.io.PrintStream.println(double);" + "\n";
		
		computeMaxMethod += calcMax;
		computeMaxMethod += printToScreen;
		computeMaxMethod += returnVoid;
		// End computeMax()
		
		 
		// Locals: 0 - scores[], 1 - array size, 2-3 - curr_min, 4 - loop counter
		String computeMinMethod =
			";"																				+ "\n" +
			"; computeMin() - print Minimum score in the array"					 			+ "\n" +
			";" 																			+ "\n" +
			".method public static computeMin([D)V" 										+ "\n" +
			".limit stack  4            ;  up to three items can be pushed" 	+ "\n" +
			".limit locals 5            ;  5 local variables are used" 			+ "\n";
		
		String calcMin =
			"ldc "+input.size()+ "\t\t  ;  Push number of exam scores (size of array)" 		+ "\n" +
			"istore_1                   ;  Store array size in local variable 1" 			+ "\n" +
			"aload_0                    ;  Push array onto stack"							+ "\n" +
			"iconst_0                   ;  Push index  0 onto stack"						+ "\n" +
			"daload                     ;  Push value at array[0]"							+ "\n" +
			"dstore_2                   ;  Start Min (local var 2-3) off at array[0]" 		+ "\n" +

			"iconst_1                   ;  Push int constant 1" 							+ "\n" +
			"istore 4                   ;  Store into loop counter (local var 4) (i=1)" 	+ "\n" +
			"goto Label_Compare         ;  Skip inc, compare, then run body"				+ "\n" +

			"Label_Body:"				 																+ "\n" +
			"aload_0                    ;  Push array onto stack"							+ "\n" +
			"iload 4                    ;  Push index onto stack"							+ "\n" +
			"daload                     ;  Push value at array[index]"						+ "\n" +
			"dload_2                    ;  Push current Min"								+ "\n" +
			"dcmpl                      ;  Push -1, 0, or 1 for <, =, >"					+ "\n" +
			"ifgt Label_Inc             ;  If array[index] > Min, continue"					+ "\n" +
			"                           ;  Otherwise set Min = array[index]"				+ "\n" +
			"aload_0                    ;  Push array onto stack"							+ "\n" +
			"iload 4                    ;  Push index onto stack"							+ "\n" +
			"daload                     ;  Push value at array[index]"						+ "\n" +
			"dstore_2                   ;  Store array[index] in Min"						+ "\n" +
																										  "\n" +
			"Label_Inc:"																				+ "\n" +
			"iinc 4 1                   ;  i++, no change to stack"							+ "\n" +
																										  "\n" +
			"Label_Compare:" 																			+ "\n" +
			"iload 4                    ;  push current index"								+ "\n" +
			"iload_1                    ;  push size of array"								+ "\n" +
			"if_icmplt Label_Body       ;  keep looping if i < size"						+ "\n";

		computeMinMethod += calcMin;
		computeMinMethod += printToScreen;
		computeMinMethod += returnVoid;
		// End computeMin()
	
		
		
		PrintWriter writer;
		try {
			writer = new PrintWriter("MinMax.j", "UTF-8");
			writer.println(classSetup);
			writer.println(mainMethod);
			writer.println(computeMaxMethod);
			writer.println(computeMinMethod);
			writer.close();
		} catch (FileNotFoundException | UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		try {
			System.out.println("\nCompiling MinMax.j file into MinMax.class.....");
			
			InputStream is = Runtime.getRuntime().exec("java -jar jasmin.jar MinMax.j").getInputStream();
			InputStreamReader isr = new InputStreamReader(is);
			BufferedReader buff = new BufferedReader (isr);

			String line;
			while((line = buff.readLine()) != null)
			    System.out.println(line);
			
			System.out.println("\nRunning java MinMax......");
			is = Runtime.getRuntime().exec("java MinMax").getInputStream();
			isr = new InputStreamReader(is);
			buff = new BufferedReader (isr);

			while((line = buff.readLine()) != null)
			    System.out.println(line);
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
