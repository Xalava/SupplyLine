console.log("Supply Line on the console");



window.onload = function() {
    var backgroundAudio=document.getElementById("bgAudio");
    backgroundAudio.volume=0.1;
   // document.getElementById('bgAudio').play()
}


// test objects

var settings = {
	nbPlayers: 2,
	water: 15,
	size: 20,
	mapX: 30,
	mapY: 20,
	cities: 3
}

var playersList = [
   			{name: "Neutral", color:"#333", nbCities:0,nbRsv:0, alive: false },
   			{name: "Lefty", color:"#234", nbCities:0,nbRsv:0, alive: true },
   			{name: "Righty", color:"#AEC", nbCities:0,nbRsv:0, alive: true }
   		]


function launchGame() {
	var players= [];
	for (var i = playersList.length - 1; i >= 0; i--) {
		players[i] = new Player(i,playersList[i].name, playersList[i].color)
	};

	var daGame = new Game(settings.nbPlayers,settings.water,settings.cities,settings.mapX,settings.mapY,players);


var game = new Vue({
   el: '#game',
   data: {
   		map: daGame.Board,
   		players: players,
   		message: toDisplay,
   		
   }


});

// todo shufflemap function


}




