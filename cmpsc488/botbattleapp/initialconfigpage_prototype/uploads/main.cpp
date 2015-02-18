/*
 * main.cpp
 *
 *  Created on: Jan 24, 2015
 *      Author: Austin Barket
 *
 *  5251 Let Me Count The Ways -
 *  	Problem: Find total number of ways to give change for any given cent amount between 0 and 30000 inclusive
 */

#include <iostream>
using namespace std;
int main()
{
	// row 0: solutions when restricted to only only 1c
	// row 1: solutions when restricted to only 1c and 5c
	// row 2: solutions when restricted to only 1c, 5c, and 10c
	// row 3: solutions when restricted to only 1c, 5c, 10c, and 25c
	// row 4: solutions when restricted to only 1c, 5c, 10c, 25c, and 50c
	long solns[5][30001] = {0};

	for (int i = 0; i < 5; i++)
	{
		for (int j = 0; j <= 30000; j++)
		{
			// Always one way if using only pennies
			if (i == 0)
			{
				solns[i][j] = 1;
			}
			// Sum of using only pennies; and using nickles and pennies
			else if (i == 1)
			{
				solns[i][j] = solns[i-1][j] + ((j - 5 >= 0) ? solns[i][j-5] : 0);
			}
			// Sum of using only nickles and pennies; and using dimes, nickles, and pennies
			else if (i == 2)
			{
				solns[i][j] = solns[i-1][j] + ((j - 10 >= 0) ? solns[i][j-10] : 0);
			}
			// Sum of using only dimes, nickles, and pennies; and using quarters, dimes, nickles, and pennies
			else if (i == 3)
			{
				solns[i][j] = solns[i-1][j] + ((j - 25 >= 0) ? solns[i][j-25] : 0);
			}
			// Sum of using only quarters, dimes, nickles, and pennies; and using half-dollars, quarters, dimes, nickles, and pennies
			else
			{
				solns[i][j] = solns[i-1][j] + ((j - 50 >= 0) ? solns[i][j-50] : 0);
			}
		}
	}

	int n;
	while ((cin >> n))
	{

		if (solns[4][n] == 1)
		{
			cout << "There is only 1 way to produce " << n << " cents change." << endl;
		}
		else
		{
			cout << "There are " << solns[4][n] << " ways to produce " << n << " cents change." << endl;
		}
	}
	return 0;
}

