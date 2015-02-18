/* Austin Barket
 * CMPSC 470
 * Assignment 1
 * Problem 3b
 */

#include <iostream>
#include <string>
using namespace std;

int main()
{
        // Rows: states ( 1 through 9, row 0 is never used )
        // Columns: input symbols { 'a' = 0, 'b' = 1, 'c' = 2 }
        // Value at (row, col) represents state that is transitioned to.
        char DFA[10][3] = {
                { -1, -1, -1 },
                { 2, 3, 4 },
                { 5, 6, 7 },
                { 8, 8, 9 },
                { 8, 8, 9 },
                { 5, 6, 7 },
                { 8, 8, 8 },
                { 8, 8, 8 },
                { 8, 8, 8 },
                { 8, 8, 9 }
        };

        string input;
        cout << "Please enter a string over the alphabet {'a', 'b', 'c': ";
        cin >> input;

        int state = 1;
        for ( int i = 0; i < input.size(); i++ ) {
                char sym = input.at(i);
                if (sym < 97 || sym > 99) {
                        // Invalid input symbol, cannot continue.
                        state = -1;
                        break;
                }
                int newState = DFA[state][sym - 97];
                cout << "Initial State: " << state << " Symbol Processed: " << input.at(i) << " New State: " << newState << "\n";
                state = newState;
        }

        switch (state) {
                case -1:
                        cout << "Invalid input string.\n";
                        break;
                case 3:
                case 4:
                case 6:
                case 7:
                case 9:
                        cout << "Accepted!!\n";
                        break;
                default:
                        cout << "Rejected\n";
        }

        return 0;
}