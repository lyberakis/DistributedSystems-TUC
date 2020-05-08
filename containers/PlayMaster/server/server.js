const myArgs = process.argv.slice(2);
const zookeeper = require("./zookeeper.js");
const kafka = require("./kafka.js");
const io = require('socket.io')()

const port_gm = myArgs[0];
const port_client = myArgs[1];


zookeeper.clientInit(port_gm, port_client);
kafka.clientInit();

var games = {}   //find quickly the receiver
var spectators = {}
var pending = {}
var gameCounter = 0

//How to TEST
// node server.js 8080 1337
// cd to-game
// npm start
// go to http://localhost:3000/?pm=1337&gm=9000&token=1
// go to http://localhost:3000/?pm=1337&gm=9000&token=2

// Set event handlers for websockets
io.on('connection', (socket) => {
  
	var token = socket.request._query['token'];

	//check the client sent token
	if (token == undefined) {
		socket.disconnect()
	}

	//check if token is valid
	if (token in pending) {
		let roundID = pending[token]['roundID'];
		let tournament_id = pending[token]['tournament_id'];
		let game = pending[token]['game'];
		delete pending[token]

		//check if the game is initilized
		if (roundID in games) {
			//Configure second player's connection

			games[roundID]['players'].push({
				'token': token,
				'socket': socket
			})

			console.log('second Player with token '+token)

			let message1 = {
				'roundID' : roundID,
				'turn' : true
			}

			let message2 = {
				'roundID' : roundID,
				'turn' : false
			}

			if (games[roundID]['players'][0]['socket']['connected'] == false) {
				createScore(roundID, 1)
				socket.emit('endgame', null);
				return;
			}

			//inform players that they are ready to play
			games[roundID]['players'][0]['socket'].emit('init', message1)
			socket.emit('init', message2)

		}else{
			//Configure first player's connection
			games[roundID] = {}
			games[roundID]['type'] = game;
			games[roundID]['tournament_id'] = game;
			games[roundID]['players']=[{
				'token': token,
				'socket': socket
			}]
			games[roundID]['spectators'] = [];

		  console.log('first Player connected with token '+token)
		  socket.emit('wait', {'roundID' : roundID})
		}
	}else if (token in spectators){
		console.log('Spectator connected with token '+token)

		let roundID = spectators[token];
		games[roundID]['spectators'].push(socket);
		delete spectators[token];
		let board = Array(9)
		socket.emit('viewer', board);
	}else{
		socket.disconnect()
	}


	//read the board
	socket.on('update', function (message) {
		var roundID = message['roundID']  //find the game
		var board = message['board']
		var progress = message['progress']
		var players = games[roundID]['players']

		var response = {
			board: board,
			progress: progress
		};

		//Transmit the board to the other player
		var sender = players[0]['socket'] === socket ? 0 : 1;
		players[invert(sender)]['socket'].emit('board', message)

		//Forward the game to the spectator
		for (i in games[roundID]['spectators']){
			games[roundID]['spectators'][i].emit('viewer', board);
			console.log("Transmit to spectator")
		}

		//Check for the game progress
		if (progress == 1) {
			createScore(roundID, sender);
		}else if (progress == 2) {
			createScore(roundID, null);
		}

	})

	socket.on('disconnect', function (message) {
		var found = false;

		//Check every game
		for (round in games) {
			var players = games[round]['players'];
			var spectators = games[round]['spectators'];

			//check every player in the round
			for (i in players) {
				if (players[i] != undefined) {
					//find who disconnected
					if (players[i]['socket'] === socket) {

						console.log("Player with token: "+players[i]['token'] +" left." )

						//announce as winner the other player
						if (players[invert(i)] != undefined) {
							players[invert(i)]['socket'].emit('endgame', null);
							createScore(round, invert(i));
						}

						for (j in spectators){
							spectators[j].emit('endgame', null);
						}
						break;


					}
				}
			}
		}
	})

})


//Easy way to go from 0 to 1 and otherwise
function invert(a){
	return (a + 1) % 2

	// TODO: Extend broadcast to more that 2 players game
}

function createScore(roundID, winner){

	var score = {
		roundID: roundID,
		game : games[roundID]['type'],
		winner: null,
		players: [games[roundID]['players'][0]['token'], games[roundID]['players'][1]['token']]
	}

	if (winner == null) {
		score['winner'] = null;
	}else{
		score['winner'] = games[roundID]['players'][winner]['token'];
	}

	delete games[roundID];

	console.log(score)


	// Send the score to GameMaster via Kafka
	kafka.send(score);

	gameCounter-=1;
	
	// update the state to zookeeper
  	// zookeeper.updateState(gameCounter);
}

io.listen(port_client)

console.log('Listening on port for clients ' + port_client + '...')

// ======================================================================

// Listen for Game Master commands
const express = require('express')
const bodyParser = require('body-parser');
// const uniqid = require('uniqid');

const app = express();

app.use(bodyParser.json());

app.post('/', function(request, response){
  // let id = uniqid();
  var roundID = request.body['roundID'];
  var spectatorMode = request.body['spectator'];
  var game = request.body['game'];
  var players = request.body['players'];

  if (!spectatorMode) {
  	console.log("Received active game")
	let p1 = players[0];
	let p2 = players[1];
	pending[p1] = {
	'roundID' : roundID,
	'game' : game
	};
	pending[p2] = pending[p1];

	gameCounter+=1;

	// update the state to zookeeper
  	// zookeeper.updateState(gameCounter);
  }else{
  	spectators[players[0]] = roundID;
  }

 
  response.writeHead(200);
  response.end();

});


app.listen(port_gm);
console.log('Listening on port for GM ' + port_gm + '...')

