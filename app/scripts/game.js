// ** Models **
// idee: timer
//small utility function
function aleaJactaEst() {
	return Math.floor((Math.random() * 100) + 1);
}
var Player = function (id, name, color) {
	this.id = id;
	this.name = name;
	this.color = color;
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
			map[j][i] = {
				owner: 0,
				feature: 0,
				supplied: true, // essential for first turn
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
					var limit = Math.floor(this.mapX * 2 / 5)
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
	map[mapY - 2][mapX - 2].feature = Game.HQ;
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
		//throw this is water!
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
				if (this.board[Math.max(y - 1, 0)][x].owner == this.currentPlayer || this.board[Math.min(y + 1, this.mapY)][x].owner == this.currentPlayer || this.board[y][Math.max(x - 1, 0)].owner == this.currentPlayer || this.board[y][Math.min(x + 1, this.mapX)].owner == this.currentPlayer) {
					//Try to conquer the square
					var difficulty = 10;
					difficulty += cs.feature * 20
					if (cs.occupied) {
						difficulty += 20
					}
					if (cs.owner !== 0) {
						difficulty += 20
					}
					// TODO: lower difficulty if surrounding
					//maybe lower diff if unsupplied
					if (difficulty < aleaJactaEst()) {
						cs.owner = this.currentPlayer
						cs.occupied = true
						cs.supplied = true
						this.message("New territory!", "success");
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
Game.prototype.updateSupplies = function () {
	//todo (not critical)
}
Game.prototype.countCities = function () {
	//todo (not critical)
}
Game.prototype.newRecruits = function () {
	//todo (not critical)
}
Game.prototype.changePlayer = function () {
	if (this.currentPlayer >= this.nbPlayers) {
		this.currentPlayer = 1;
	} else {
		this.currentPlayer = this.currentPlayer + 1
	}
	this.players[currentPlayer].nbRsv += 3;
}
Game.prototype.endTurn = function () {
	this.updateSupplies();
	this.changePlayer();
	this.message("New turn", "info");
	this.countCities();
	this.newRecruits();
}