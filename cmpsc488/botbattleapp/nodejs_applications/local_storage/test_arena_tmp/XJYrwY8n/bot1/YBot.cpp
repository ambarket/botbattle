/// https://euler.hbg.psu.edu:6058/



#include <string>
#include <iostream>
#include <vector>
using namespace std;

// Bot battle.

string getNextMove(int moveNum) ;
void Command(string commandName, int tile, int reps) ;
void getBoardData (int & playerNum, int & myPos, int & hisPos, vector<int> & tiles) ;
int getModeTile(vector <int> tiles) ;
int getRepsTile(vector <int> tiles, int tileNum) ;
int getMaxTile(vector <int> tiles) ;
int getMaxNotModeTile(vector <int> tiles) ;
int getMinTile(vector <int> tiles) ;
bool getDoesTileExist(vector<int> tiles, int tileNum) ;
string getSmartDefend(int playerNum, int myPos, int hisPos, vector<int> tiles) ;
bool getSmartAttack(int playerNum, int myPos, int hisPos, vector<int> tiles) ;


int main() {
	int shuffles = 0 ;
	int moveNum = 0 ;
	while (true) {
		cerr << getNextMove(moveNum) ;
		moveNum++ ;
		cerr << "Move #" << moveNum ;
	}
	return 0 ;
}


string getNextMove(int moveNum) {
	// Get board input
	// if bot 1 //****************************
	// let's code bot 1 first // *************

	// VARS //// VARS //// VARS //// VARS //
	// myPos
	int myPos = 0 ;
	int hisPos = 14 ;
	int distance = 14 ; // when game begins
	int playerNum = 1 ;
	vector<int> tiles;

	getBoardData(playerNum, myPos, hisPos, tiles) ;
	distance = hisPos-myPos ;
	cerr << "Distance before this move is: " << distance << endl ;
	// hisPos
	// Distance between us
	// tile array

	// now if statements for priority
	// when game starts
	if (moveNum == 0) 
	{
		// move farthest distance I got
		// get farthest distance
		// move farthest distance
		int farthest = getMaxTile(tiles) ;
		Command("move",farthest,1) ;
		return "First Move Completed" ;
		// another option here would be to use something that is not the mode
		// the mode is useful for attacks and defence
	}
	if (distance > 8)
	{
		int tile = getMaxNotModeTile(tiles) ;
		Command("move",tile,1) ;
		return "Moved Max not mode because distance is high." ;
	}
	if (distance <= 8 && distance > 4)
	{ // when I can set up a 4 tile defence etc.
		int minTile = getMinTile(tiles) ;
		return getSmartDefend(playerNum, myPos, hisPos, tiles) ;
	}
	// when opponent is close enough to hit me/I can hit him
	if (distance <= 4)
	{
		// what is the number I have most of? (maybe more than 1)
		int mode = getModeTile(tiles) ;
		int attacked = getSmartAttack(playerNum, myPos, hisPos, tiles) ;
		if (attacked)
		{
			return "Attacked." ;
		}
		return getSmartDefend(playerNum, myPos, hisPos, tiles) ;

		// if I have more than 2 tiles in a number, can I move to that tile?
		// 
	}

	// Last case scenario...
	int minTile = getMinTile(tiles) ;
	return getSmartDefend(playerNum, myPos, hisPos, tiles) ;

	// if bot 2 then invert ********************
	// if bot 2 then we do this ****************

}

// Prints the command
void Command(string commandName, int tile, int reps) {
	cout << commandName << ";" ;
	for (int i = 0; i < reps; ++i)
	{
		cout << tile ;
	}
	cout << endl ;
}

void getBoardData (int & playerNum, int & myPos, int & hisPos, vector<int> & tiles) {
	// right now only works for player 1.
	string board ;
	while (true) {
		cin >> board ;
		if (board != "") break ;
	}
	// reading done, now I have to organize it
	playerNum = board[0] - 48 ;

	// GETS TILES
	tiles.clear() ;
	for (int countI = 2; countI < 7; ++countI)
	{
		tiles.push_back(board[countI] - 48) ; // gets tiles
	}

	// GETS MYPOS and HISPOS
	for (int countK = 0; countK < 15; ++countK)
	{
		if (board[8+countK] - 48 == 1) {
			myPos = countK ;
		}
		if (board[8+countK] - 48 == 2) {
			hisPos = countK ;
			break ;
		}
	}
	cerr << "Got Board Data at pos: " << myPos ;
}

int getModeTile(vector <int> tiles) {
	int reps[5] = {0} ;
	for (int i = 0; i < tiles.size(); ++i)
	{
		reps[tiles[i]] += 1 ;
	}

	int Mode = 0 ;
	int ModeReps = 0 ;
	for (int i = 1; i < 5; ++i)
	{
		if (reps[i] > ModeReps) {
			ModeReps = reps[i] ;
			Mode = i ;
		}
	}

	return Mode ;
}

int getRepsTile(vector <int> tiles, int tileNum) {
	int reps[5] = {0} ;
	for (int i = 0; i < tiles.size(); ++i)
	{
		reps[tiles[i]] += 1 ;
	}

	return reps[tileNum] ;
}

int getMaxTile(vector <int> tiles) {
	int MaxTile = 0 ;
	for (int i = 0; i < tiles.size(); ++i)
	{
		if (tiles[i] > MaxTile) MaxTile = tiles[i] ;
	}

	return MaxTile ;
}

int getMaxNotModeTile(vector <int> tiles) {
	int MaxTile = getMinTile(tiles) ;
	int Mode = getModeTile(tiles) ;

	for (int i = 0; i < tiles.size(); ++i)
	{
		if (tiles[i] > MaxTile && tiles[i] != Mode) MaxTile = tiles[i] ;
	}

	return MaxTile ;
}

int getMinTile(vector <int> tiles) {
	int MinTile = 5 ;
	for (int i = 0; i < tiles.size(); ++i)
	{
		if (tiles[i] < MinTile) MinTile = tiles[i] ;
	}

	return MinTile ;
}

bool getDoesTileExist(vector<int> tiles, int tileNum) {
	for (int i = 0; i < tiles.size(); ++i)
	{
		if (tileNum == tiles[i])
		{
			return true ;
		}
	}
	return false ;
}

// MUST ALWAYS OUTPUT COMMAND
string getSmartDefend(int playerNum, int myPos, int hisPos, vector<int> tiles) {
	// So here I want to check first if I can move to a place where my mode can DEFEND
	// cout << "TEST NO SmartDefend" << endl ; // TESTDEBUG
	int distance = hisPos - myPos ;
	// cout << "TEST NO distance: " << distance << endl ; // TESTDEBUG
	int modeTile = getModeTile(tiles) ;
	// cout << "TEST NO modeTile: " << modeTile << endl ; // TESTDEBUG
	int targetTile = 0 ; // tile I need to move to defensive position.
	// cout << "TEST NO targetTile: " << targetTile << endl ; // TESTDEBUG
	string moveOrRetreat = "move" ;

	if (distance > modeTile)
	{
		targetTile = distance - modeTile ;
		// cout << "TEST NO targetTile: " << targetTile << endl ; // TESTDEBUG
		moveOrRetreat = "move" ;
	} else if (distance < modeTile)
	{
		targetTile = modeTile - distance ;
		// cout << "TEST NO targetTile: " << targetTile << endl ; // TESTDEBUG
		moveOrRetreat = "retreat" ;
	}

	if (getDoesTileExist(tiles, targetTile)) {
		// if the target tile exists then we use it.
		Command(moveOrRetreat,targetTile,1) ;
		return "Used Smart Defend with Mode " ;
	}

	// If target tile does not exist we look for another option...
	else {
		for (int countK = 0; countK < tiles.size(); ++countK)
		{
			if (distance > tiles[countK])
			{
				targetTile = tiles[countK] - distance ;
				moveOrRetreat = "retreat" ;
			} else if (distance > tiles[countK])
			{
				targetTile = distance - tiles[countK] ;
				moveOrRetreat = "move" ;
			}

			if (getDoesTileExist(tiles, targetTile)) {
				// if the target tile exists then we use it.
				Command(moveOrRetreat,targetTile,getRepsTile(tiles, targetTile)) ;
				return "Used Smart Defend without! Mode " ;
			}
		}
	}

	if (getDoesTileExist(tiles, distance-1)) {
		Command("move",distance-1,1) ;
		return "Moving infront of the enemy bot. Dist 1 " ;
	}

	if (getDoesTileExist(tiles, distance-2)) {
		Command("move",distance-2,1) ;
		return "Moving infront of the enemy bot. Dist 2 " ;
	}

	if (getDoesTileExist(tiles, distance-3)) {
		Command("move",distance-3,1) ;
		return "Moving infront of the enemy bot. Dist 2 " ;
	}

	if (getDoesTileExist(tiles, distance-4)) {
		Command("move",distance-2,1) ;
		return "Moving infront of the enemy bot. Dist 2 " ;
	}
	// cout << "shuffle" << endl ;
	// return "Shuffled the tiles. " ;

	// Otherwise we can just retreat...
	Command("retreat",getMaxTile(tiles),1) ;
	return "Last option, just retreated with max tile." ;
	// will try advancing instead of retreating later.

}

// DOES NOT NECESSARILY NEED TO OUTPUT COMMAND
bool getSmartAttack(int playerNum, int myPos, int hisPos, vector<int> tiles) {
	int distance = hisPos - myPos ;
	int modeTile = getModeTile(tiles) ;
	int reps = getRepsTile(tiles, modeTile) ;

	if (modeTile == distance)
	{
		Command("attack",modeTile,reps) ;
		cerr << "Used Smart Attack." ;
		return true ;
	}

	if (getDoesTileExist(tiles, distance))
	{
		Command("attack",modeTile,getRepsTile(tiles,modeTile)) ;
	}
	
	cerr << "No Smart Attack available." ;
	return false ;
}