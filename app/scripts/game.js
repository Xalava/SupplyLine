// ** Models **
// idee: timer
//small utility function
function aleaJactaEst() {
	return Math.floor((Math.random() * 100) + 1);
}
var Player = function (id, name, color, colorClass) {
	this.id = id;
	this.name = name;
	this.color = color; // may be rundundant used for non square
	this.colorClass = colorClass;
	this.nbCities = 0;
	this.nbRsv = 5;
	if (id === 0) {
		this.alive = false;
	} else {
		this.alive = true;
	}
}
var Game = function (nbPlayers, water, cities, mapX, mapY, players, squareSize) {
	this.nbPlayers = nbPlayers;
	this.currentPlayer = 1;
	this.players = players;
	this.mapX = mapX;
	this.mapY = mapY;
	this.squareSize = squareSize;
	this.board = this.generateMap(mapX, mapY, water, cities, squareSize, nbPlayers);
	this.mTxt = "Welcome to Supply Line"
	this.mType = "success"
	//should be on the view side, quick and dirty for the moment
	this.nextSquare = this.board[0][0];
	this.nextProba = 0;
	console.log("game created");
};
Game.WATER = -1;
Game.EMPTY = 0;
Game.CITY = 1;
Game.HQ = 2;
Game.prototype.generateMap = function (mapX, mapY, water, cities, squareSize, nbPlayers) {
	var map = [];
	// init
	for (var j = mapY - 1; j >= 0; j--) {
		map[j] = [];
		//! nb it's [row][col]
		for (var i = mapX - 1; i >= 0; i--) {
			//Default (and avoid JS errors)
			//make this an object
			map[j][i] = {
				owner: 0,
				feature: 0,
				supplied: true, // essential for first turn
				isChecked: false,
				isDone: false,
				occupied: false,
				boardCol: i,
				boardRow: j,
				x: i * squareSize, // temp // I know weird, best solution so far,
				y: j * squareSize // open for ideas to retreive their location and place them correctly with v-for
			}
			var aleat = aleaJactaEst();
			if (aleat < water) {
				map[j][i].feature = -1;
			} else {
				if (aleat > (100 - cities)) {
					map[j][i].feature = 1;
				}
				//todo adapt to severaly players
				switch (nbPlayers) {
				case 2:
					var limit = Math.floor(this.mapX * 48 / 100)
					if (i < limit) {
						map[j][i].owner = 1;
					} else if (i > mapX - limit) {
						map[j][i].owner = 2;
					}
					break;
				case 3:
					//todo
					break;
				case 4:
					break;
				default:
					//todo
					break;
				}
			}
			//owner
		}
	} //end double for
	//placing HQ
	map[1][1].feature = Game.HQ;
	map[1][1].owner = 1; // if water removed ownership
	map[mapY - 2][mapX - 2].feature = Game.HQ;
	map[mapY - 2][mapX - 2].owner = 2;
	return map;
}
Game.prototype.message = function (txt, type) {
	this.mTxt = txt;
	this.mType = type;
	//success, info, warning, danger
}
Game.prototype.squareAction = function (x, y) {
	var cs = this.board[y][x]
	if (cs.feature === Game.WATER) {
		this.message("Going for a swim?", "warning")
	} else {
		if (cs.owner === this.currentPlayer) {
			if (cs.supplied) {
				this.message("", "")
				if (cs.occupied === false) {
					if (this.players[this.currentPlayer].nbRsv > 0) {
						cs.occupied = true;
						this.players[this.currentPlayer].nbRsv -= 1
					} else {
						//throw not enought troupe
					}
				} else {
					cs.occupied = false;
					this.players[this.currentPlayer].nbRsv += 1
				}
			} else {
				//TODO throw unsupplied territory
				this.message("unsupplied territory", "warning")
			}
		} else {
			if (this.players[this.currentPlayer].nbRsv > 0) {
				if (this.reachableFor(y, x, this.currentPlayer)) {
					//Try to conquer the square
					var difficulty = this.estimateDifficulty(cs);
					if (difficulty < aleaJactaEst()) {
						cs.owner = this.currentPlayer;
						cs.occupied = true;
						cs.supplied = true;
						this.updateSupplies(y, x);

						if (cs.feature == Game.HQ){
							this.message("You Won !","success");
						} else {
							this.message("New territory!", "success");
						} 

					} else {
						this.message("Battle lost", "warning");
					}
					//removing a troup anyway
					this.players[this.currentPlayer].nbRsv -= 1
				} else {
					this.message("You need to be adjacent to your territories", "warning")
				}
			} else {
				//TRrow not enough soldier
				this.message("No troups left", "warning");
			}
		}
	} // end "else than water"
}
Game.prototype.reachableFor = function (y, x, player) {
	var adj = this.adjacentCells(y, x);
	for (var i = adj.length - 1; i >= 0; i--) {
		if (adj[i].owner == player && adj[i].supplied)
			return true;
	};
	return false;
}
Game.prototype.squareOver = function (y, x) {
	this.nextSquare = this.board[y][x];
	this.nextProba = this.estimateDifficulty(this.board[y][x]);
}
Game.prototype.estimateDifficulty = function (cs) {
	// max is 99 min is 1
	if (cs.feature == Game.WATER) {
		return 100;
	}
	if (cs.owner == this.currentPlayer) {
		return 0;
	}
	//could check again if not neighbor > 0
	var difficulty = 5; //As you have at least one adj territory, balance to 0
	difficulty += cs.feature * 20
	if (cs.occupied) {
		difficulty += 20
	}
	if (cs.owner !== 0) {
		difficulty += 18
	}
	if (cs.supplied) {
		difficulty += 16;
	}
	// TODO: lower difficulty if surrounding
	var adj = this.adjacentCells(cs.boardRow, cs.boardCol)
	for (var i = adj.length - 1; i >= 0; i--) {
		if (adj[i].owner == this.currentPlayer && adj[i].supplied) {
			difficulty -= 5;
		}
	};
	//maybe lower diff if unsupplied
	return difficulty;
}
Game.prototype.adjacentCells = function (y, x) {
	//returns array of adjancent cells
	var adjacent = new Array();
	if (x - 1 >= 0 && this.board[y][x - 1].feature >= 0) {
		adjacent.push(this.board[y][x - 1])
	}
	if (y + 1 < this.mapY && this.board[y + 1][x].feature != -1) {
		adjacent.push(this.board[y + 1][x])
	}
	if (x + 1 < this.mapX && this.board[y][x + 1].feature != -1) {
		adjacent.push(this.board[y][x + 1])
	}
	if (y - 1 >= 0 && this.board[y - 1][x].feature != -1) {
		adjacent.push(this.board[y - 1][x])
	}
	return adjacent;
}
Game.prototype.looseUnsupplied = function () {
	for (var r = this.mapY - 1; r >= 0; r--) {
		for (var c = this.mapX - 1; c >= 0; c--) {
			var cs = this.board[r][c];
			if (cs.owner === this.currentPlayer && cs.supplied === false) {
				cs.owner = 0;
				cs.supplied = true;
				cs.occupied = false;
			}
		}
	}
}
Game.prototype.updateSupplies = function (y, x) {
	//update adjancent cell if recent action cut their supplies
	// // for debugging
	// var m;
	// var n; 
	// for ( m = this.mapY - 1; m >= 0; m--) {
	// 	for ( n = this.mapX - 1; n >= 0; n--) {
	// 		this.board[m][n].occupied = false; 
	// 	};
	// };
	var initadj = this.adjacentCells(y, x);
	var checkMatrix = new Array(this.mapY);
	for (var m = this.mapY - 1; m >= 0; m--) {
		checkMatrix[m] = new Array(this.mapX);
		for (var n = this.mapX - 1; n >= 0; n--) {
			checkMatrix[m][n] = -1; //more readable than typeof 'undefined.''			
		};
	};
	console.log("# Before for on ", y, x)
	for (var i = initadj.length - 1; i >= 0; i--) {
		console.log("----", i)
		if (checkMatrix[initadj[i].boardRow][initadj[i].boardCol] == -1) { // if already visited (likely), we skip!
			if (initadj[i].owner != this.currentPlayer && initadj[i].owner != 0) {
				var reachables = []; // square reachable from adj[i]
				//launching recursion for this point
				if (this.recursiveReach(initadj[i], checkMatrix, reachables, initadj[i].owner, i)) {
					//for (var j = reachables.length - 1; j >= 0; j--) {
					//	reachables[j].supplied = true;
					//};
				} else {
					//we couldn't find any any, we set unsupplied the array
					console.log("unsupplies from ", initadj[i].boardRow, initadj[i].boardCol)
					for (var j = reachables.length - 1; j >= 0; j--) {
						reachables[j].supplied = false;
					};
				}
			} else if (initadj[i].owner == this.currentPlayer && initadj[i].supplied == false) {
				this.recursiveSupply(initadj[i], checkMatrix, this.currentPlayer, i)
			}
		} else {
			console.log(initadj[i].boardRow, initadj[i].boardCol, "was already checked")
		}
	};
}
Game.prototype.recursiveSupply = function (cs, cMatrix, landlord, run) {
	//We supply all the cells we encounter avoiding loops
	console.log("Supply Supply on ", cs.boardRow, cs.boardCol, " with run ", run)
	cMatrix[cs.boardRow][cs.boardCol] = run;
	cs.supplied = true;
	var adj = this.adjacentCells(cs.boardRow, cs.boardCol);
	for (var i = adj.length - 1; i >= 0; i--) {
		if (adj[i].owner == landlord) { // we skip other players squares. 
			if (cMatrix[adj[i].boardRow][adj[i].boardCol] < run) { //not visited either this run or prior
				this.recursiveSupply(adj[i], cMatrix, landlord, run);
			}
		}
	};
}
Game.prototype.recursiveReach = function (cs, cMatrix, reachables, landlord, run) {
	cMatrix[cs.boardRow][cs.boardCol] = run; //we know this square as been visited, and at which run
	console.log("Recursion on ", cs.boardRow, cs.boardCol, " with run ", run)
	if (cs.feature > 0) {
		//we are set up
		return true;
	}
	reachables.push(cs); //saving it
	//debug 	cs.occupied = true;
	var adj = this.adjacentCells(cs.boardRow, cs.boardCol);
	for (var i = adj.length - 1; i >= 0; i--) {
		if (adj[i].owner == landlord) { // we skip other players squares. 
			if (cMatrix[adj[i].boardRow][adj[i].boardCol] > run) { // it was visited in a prior run
				console.log("visited in a prior run with positive value")
				return adj[i].supplied; // we know its info is up to date from this action and a prior run
			} else if (cMatrix[adj[i].boardRow][adj[i].boardCol] == -1) { // we get sure we are not running in circles
				if (this.recursiveReach(adj[i], cMatrix, reachables, landlord, run)) {
					return true;
					console.log("break ", cs.boardRow, cs.boardCol, "with TRUE")
				}
			}
		}
	};
	return false;
}
Game.prototype.countCities = function (player) {
	//todo (not critical)
	this.players[player].nbCities == 0;
	for (var r = this.mapY - 1; r >= 0; r--) {
		for (var c = this.mapX - 1; c >= 0; c--) {
			if (this.board[r][c].owner == player && this.board[r][c].feature == Game.CITY) {
				this.players[player].nbCities += 1;
			}
		}
	}
}
Game.prototype.changePlayer = function () {
	if (this.currentPlayer >= this.nbPlayers) {
		this.currentPlayer = 1;
	} else {
		this.currentPlayer = this.currentPlayer + 1
	}
	this.players[this.currentPlayer].nbRsv += 3;
}
Game.prototype.endTurn = function () {
	this.looseUnsupplied();
	this.changePlayer();
	this.newTurn();
}
Game.prototype.newTurn = function () {
	this.message("New turn", "info");
	console.log('New turn of ', this.currentPlayer)
	this.countCities(this.currentPlayer);
}