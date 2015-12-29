console.log("Supply Line on the console");
var daGame
var game
window.onload = function () {
	var backgroundAudio = document.getElementById("bgAudio");
	backgroundAudio.volume = 0.1;
	// document.getElementById('bgAudio').play()
	launchGame();
}
// testing objects
var settings = {
	nbPlayers: 2,
	water: 10,
	squareSize: 25,
	mapX: 20,
	mapY: 16,
	cities: 3
}
var playersList = [{
	name: "Neutral",
	color: "#333",
	colorClass: "colorNeutral"
}, {
	name: "Lefty",
	color: "#F34",
	colorClass: "colorA"
}, {
	name: "Righty",
	color: "#AEC",
	colorClass:"colorB"
}]

function launchGame() {
	var players = [];
	for (var i = playersList.length - 1; i >= 0; i--) {
		players[i] = new Player(i, playersList[i].name, playersList[i].color,playersList[i].colorClass)
	};


	daGame = new Game(settings.nbPlayers, settings.water, settings.cities, settings.mapX, settings.mapY, players, settings.squareSize);
	console.log(daGame);
	daGame.newTurn();


	// Vue.js
	game = new Vue({
		el: '#game',
		data: daGame,
		computed: {
			currentPlayerName: function () {
				return this.players[this.currentPlayer].name;
			},
			daPlayer: function () {
				return this.players[this.currentPlayer];
			},
			mapWidth: function () {
				return this.mapX * this.squareSize;
			},
			mapHeight: function () {
				return this.mapY * this.squareSize;
			},
			squarelocation: function () {
				return this.mapY * this.squareSize;
			},
			squares: function () {
				return this.board.reduce(function (a, b) {
					return a.concat(b);
				});
			},
			rows: function () {
				return this.board;
			}
		},
		components: {
			// <-component> will only be available in Parent's template
			'square-component': {
				props: {
					sq: Object
				},
				template: '#square-template',
				data: function () {
					return this.sq;
				}, // !??
				computed: {
					// isWater: function () {
					// 	if (this.feature == -1) {
					// 		return true;
					// 	} else {
					// 		return false;
					// 	}
					// },
					isCity: function () {
						if (this.feature == 1) {
							return !this.occupied;
						} else {
							return false;
						}
					},
					isHQ: function () {
						if (this.feature == 2) {
							return !this.occupied;
						} else {
							return false;
						}
					},
					proba: function () {
						return daGame.estimateDifficulty(this.y,this.x);
					},
					diplayFeature: function () {
						
					},
					// playerColor: function () {
					// 	//should be passed from parent
					// 	if (this.owner > 0) {
					// 		return daGame.players[this.owner].color;
					// 	}
					// },
					ownerColorClass: function () {
						if (this.feature == -1) {
							return "water";
						} else {
							if (this.supplied) {
								return daGame.players[this.owner].colorClass;
							} else {
								return daGame.players[this.owner].colorClass + ' ' + 'unsupplied';

							}

							
						 }
						
					},
					methods: {
						sqAction: function () {
							daGame.squareAction(this.boardCol, this.boardRow);
						}
					}
				}
			} // End square
		} // End components
	}); // vue object
	// todo shufflemap function
}

function endTurn() {
	daGame.endTurn();
}