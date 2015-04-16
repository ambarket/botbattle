#include <iostream>
#include <string>
using namespace std;

// TODO: Seriously need to make sure the GameManager cleans the JSON using a library
//	sending unprintable characters e.g. ascii 14 for distance causes no message to get to
//	the client but the game to go on if the moves are right.
int main() {
	string tilesAndBoard = "";

	while (cin >> tilesAndBoard) {
		string playerNum = tilesAndBoard.substr(0, 1);
		string tiles = tilesAndBoard.substr(2, 5);
		string board = tilesAndBoard.substr(8);
		char distance = (board.find("2") - board.find("1"));
		cerr << "playerNum: " << playerNum << " tiles: " << tiles << " board: " << board << " dist: " << (int)(distance) <<  endl;

		string move = "";
		for (int i = 0; i < 5; i++) {
			if ((tiles[i]-48) == distance) {
				move += "attack;";
				move += tiles[i];
				for (i+=1; i < 5; i++) {
					if ((tiles[i]-48) == distance) {
						move += tiles[i];
					}
				}
				break;
			}
			else if ((tiles[i]-48) < distance){
				move += "move;";
				move += tiles[i];
				break;
			}
		}
		if (move == "") {
			move += "retreat;";
			move += tiles[0];
		}
		cout << move << endl;
	}
}

