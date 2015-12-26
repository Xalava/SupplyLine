// ** Models **

//small utility function
function aleaJactaEst(){
	return Math.floor((Math.random() * 100) + 1);
}

var Player = function(id, color, name) {
	this.id = id;
	this.name = name;
	this.color = color;
	this.nbCities = 0;
	this.nbRsv = 0;
	if(id === 0) {
		this.alive=false;
	} else {
		this.alive= true;
	}
}


var Game = function (nbPlayers, water, cities, mapX, mapY, players) {
  console.log("game created");
  this.nbPlayers = nbPlayers;
  this.currentPlayer = 1;
  this.players = players;
  this.mapX = mapX;
  this.mapY = mapY;
  this.map = this.generateMap(mapX, mapY, water, cities);
};

Game.WATER = -1;
Game.EMPTY = 0;
Game.CITY = 1;
Game.HQ = 2;


Game.prototype.generateMap = function(mapX, mapY, water, cities) {
	var map = [];
	// init

	for (var j = mapY - 1; j >= 0; j--) {
		map[j] = []; 
		//! nb it's [line][col]
		for (var i = mapX - 1; i >=0; i--) {
			//Default (and avoid JS errors)

			map[j][i] = {
				owner: 0,
				feature: 0,
				supplied: true,// essential for first turn
				occupied: false,
				x:i,// I know weird, best solution so far,
				y:j // open for ideas to retreive their location and place them correctly with v-for
			}

			var aleat = aleaJactaEst();

			if (aleat < water) {
				map[j][i].feature = -1;

			} else{
				if (aleat > (100 - cities)){
					map[j][i].feature = 1;
				}
			}

			//owner
			if (i <this.mapX/3) {
				map[j][i].owner = 1;
			} else if (i > mapX * 2/3) {
				map[j][i].owner = 2;
			} else {
				map[j][i].owner = 0;

			}	 
		}
	} //end double for

	//placing HQ
	map[0][0].feature = 2;
	//map[mapX - 1][mapY - 1].feature = 2;

	return map;

}

Game.prototype.squareAction = function(x, y) {
	var cs = this.map[x][y]
	if (cs.feature === Game.WATER ) {
		//throw this is water!
	} else {
		if (cs.owner === this.currentPlayer){
			if (cs.supplied){
				if(cs.occupied === false && this.players[this.currentPlayer].nbRsv > 0){
					cs.occupied = true;
					this.players[this.currentPlayer].nbRsv -= 1
				} else {
					cs.occupied = false;
					this.players[this.currentPlayer].nbRsv += 1
				}
			} else {
				//TODO throw unsupplied territory
			}
		} else {
			if( this.players[this.currentPlayer].nbRsv > 0){
				//Try to conquer the square
				var difficulty = 10;
				difficulty += cs.feature * 20
				if (cs.occupied){difficulty += 20}
				if (cs.owner !== 0){difficulty += 20}

				// TODO: lower difficulty if surrounding
				//maybe lower diff if unsupplied
				if (difficulty<aleaJactaEst()){
					cs.owner= this.currentPlayer
					cs.occupied = true
					cs.supplied = true
				}
				
				//removing a troup anyway
				this.players[this.currentPlayer].nbRsv -= 1
			}else {
				//TRrow not enough soldier
			}



		}
	} // end "else than water"

}


Game.prototype.updateSupplies = function() {
	//todo (not critical)

}


Game.prototype.changePlayer = function(){
	if (this.currentPlayer >= this.nbPlayers){
		this.currentPlayer = 1;
	} else {
		this.currentPlayer = this.currentPlayer + 1
	}
}

Game.prototype.endTurn = function() {
	this.updateSupplies();
	this.changePlayer();


}
