import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Scanner;

import javax.swing.JFileChooser;


public class GameWrapper {

	public static void main(String[] args) throws NoSuchMethodException, SecurityException {

		Scanner sc = new Scanner(System.in);
		
		System.out.println("Please enter the path to the location that holds your classname.class files.");
		
		JFileChooser chooser = new JFileChooser();
		chooser.setCurrentDirectory(new java.io.File("."));
		chooser.setDialogTitle("Select Directory that holds class files");
		chooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
		chooser.setAcceptAllFileFilterUsed(false);

		if (chooser.showOpenDialog(null) == JFileChooser.APPROVE_OPTION) {
		  System.out.println("getCurrentDirectory(): " + chooser.getCurrentDirectory());
		  System.out.println("getSelectedFile() : " + chooser.getSelectedFile());
		} else {
		  System.out.println("No Selection ");
		}
		
		String path = chooser.getSelectedFile().toString();
		String choice = null;
		int fileNumber = 0;
		File folder = new File(path);
		File[] listOfFiles = folder.listFiles();

		    for (int i = 0; i < listOfFiles.length; i++) {
		      if (listOfFiles[i].isFile()) {
		        System.out.println("File " + i + ": " + listOfFiles[i].getName());
		      } else if (listOfFiles[i].isDirectory()) {
		        System.out.println("Directory " + listOfFiles[i].getName());
		      }
		    }
		
			System.out.println("Please select a class to load by entering the file number above.");
			
			choice = sc.nextLine();
			
			try{
				fileNumber = Integer.parseInt(choice);
			}
			catch(NumberFormatException e){
				fileNumber = -1;
			}
			
			while(fileNumber < 0 || fileNumber > listOfFiles.length || listOfFiles[fileNumber].isDirectory())
			{
				System.out.println("Please try again.");
				choice = sc.nextLine();
							
				try{
					fileNumber = Integer.parseInt(choice);
				}
				catch(NumberFormatException e){
					fileNumber = -1;
				}
			}
		
        // Say Class.class is the input file to be picked up.
		String className = listOfFiles[fileNumber].getName();    
		
		try { 
			System.out.println("You selected " + className);
			
			String newClassName = className.substring(0, className.length() - 6);
			
			File file = new File(chooser.getSelectedFile().toString()); 

			//System.out.println("The file name is " + file.toString());
			
			ClassLoader cl = new URLClassLoader(new URL[]{file.toURI().toURL()}); 
			Class  cls = cl.loadClass(newClassName);
			Object testInstance = null;
			
			try 
			{
				testInstance = cls.newInstance();
			} 
			catch (InstantiationException e1) 
			{
				e1.printStackTrace();
			} 
			catch (IllegalAccessException e1) 
			{
				e1.printStackTrace();
			}
			
			@SuppressWarnings("unchecked")
			Method test = null;
			
			int num = 1;
			Method[] allMethods = cls.getDeclaredMethods();
		    for (Method m : allMethods) 
		    {
				//if (!m.getName().equals(args[1])) {
				//    continue;
				//}
				System.out.println( "\nMethod " + num + ": "+ m.toGenericString());
	
				System.out.println("ReturnType " + m.getReturnType());
				System.out.println("GenericReturnType " + m.getGenericReturnType());
	
				Class<?>[] pType  = m.getParameterTypes();
				Type[] gpType = m.getGenericParameterTypes();
				for (int i = 0; i < pType.length; i++) {
				    System.out.println("ParameterType " + pType[i]);
				    System.out.println("GenericParameterType " + gpType[i]);
				}
				num++;
		    }
			
		    System.out.println("\nPlease select a method number.");
		    num = sc.nextInt();
		    
		    test = allMethods[num - 1];
			//System.out.println("Test is : " + test.getName());
			//System.out.println("cls.getName() = " + cls.getName());

			try {
				test.invoke(testInstance);
			} catch (IllegalAccessException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IllegalArgumentException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (InvocationTargetException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}          

        } 
		catch ( ClassNotFoundException | MalformedURLException e) {
        e.printStackTrace();
        }
	}

}
