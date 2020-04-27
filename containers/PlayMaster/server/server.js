const io = require('socket.io')()
const MongoClient = require('mongodb').MongoClient;

var myArgs = process.argv.slice(2);

const PMID = "0683424";
var games = {}   //find quickly the receiver
var pending = {}

// pending['1234'] = '345346';
// pending['4567'] = '345346';

// game['roundID'] = [{'token', 'socket'}]

//How to TEST
// node server.js
// cd to-game
//npm start
// go to http://localhost:3000/?host=http://localhost:1337&token=1234
// go to http://localhost:3000/?host=http://localhost:1337&token=4567

// const url = "mongodb://root:rootpassword@mongodb:27017/";


var mongo_conn = null;
var dbo = null;


// MongoClient.connect(url,function(err, db){  
//   if(err) 
//     console.log(err);
//   else
//   {
//     console.log('Mongo Conn....');

//   }
// });

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   dbo = db.db("play_repo");
//   console.log("Connected to mongodb!");
//   mongo_conn = db;
//   dbo.createCollection(PMID, function(err, res) {
//   if (err) throw err;
//     console.log("Collection created!");
//   });
// });


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

			games[roundID]['players'][1] ={
				'token': token,
				'socket': socket
			}

			//Save to db 
			gameCommit(games[roundID]);

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
			games[roundID]['players'] = Array(2)
			games[roundID]['players'][0] ={
				'token': token,
				'socket': socket
			}

		  console.log('first Player connected with token '+token)
		  socket.emit('wait', {'roundID' : roundID})
		}
	}else{
		socket.disconnect()
	}


	//read the board
	socket.on('update', function (message) {
		let roundID = message['roundID']  //find the game
		let board = message['board']
		let players = games[roundID]['players']

		//Transmit the board to the other player
		let sender = players[0]['socket'] === socket ? 0 : 1;
		players[invert(sender)]['socket'].emit('board', board)

	})


	socket.on('endgame', function (message) {
		let roundID = message['roundID'] 
		let players = games[roundID]['players'];
		let sender = players[0]['socket'] === socket ? 0 : 1;

		switch(message['winner']){
			case 0:
				createScore(roundID, null)
				break;
			case 1:
				createScore(roundID, sender)
				break;
			case -1:
				createScore(roundID, invert(sender))
				break;

		}

		delete games[roundID];

	})


	socket.on('disconnect', function (message) {

		//Check every game
		for (round in games) {
			var players = games[round]['players'];

			//check every player in the round
			for (var i = 0; i < 2; i++) {
				if (players[i] != undefined) {

					//find who disconnected
					if (players[i]['socket'] === socket) {

						//announce as winner the other player
						if (players[invert(i)] != undefined) {
							players[invert(i)]['socket'].emit('endgame', null);
							createScore(round, invert(i));
							break;
						}
					}
				}
			}
		}
	})

})


//Easy way to go from 0 to 1 and otherwise
function invert(a){
	return (a + 1) % 2
}

function createScore(roundID, winner){

	var score = {
	  game : games[roundID]['type'],
	  winner: null,
	  player1: games[roundID]['players'][0]['token'],
	  player2: games[roundID]['players'][1]['token'],
	}

	if (winner == null) {
		score['winner'] = null;
	}else{
		score['winner'] = games[roundID]['players'][winner]['token'];
	}

	delete games[roundID];

	console.log(score)

}


const port_client = myArgs[1]
io.listen(port_client)
console.log('Listening on port for clients ' + port_client + '...')



// Listen for Game Master commands
const express = require('express')
const bodyParser = require('body-parser');
const uniqid = require('uniqid');

const app = express();


app.use(bodyParser.json());

app.post('/', function(request, response){
  let id = uniqid();
  let game = request.body['game'];
  let players = request.body['players'];
  let tournament_id = request.body['tournament_id'];
  let p1 = players[0];
  let p2 = players[1];

  pending[p1] = {
	'roundID' : id,
	'game' : game,
	'tournament_id': tournament_id
  };
  pending[p2] = pending[p1];
  
  response.writeHead(200);
  response.end();

});

const port_gm = myArgs[0];
app.listen(port_gm);

console.log('Listening on port for GM ' + port_gm + '...')



function gameCommit(game) {
  // let players = game['players']
  // let data = {
  //   type: game['type'],
  //   players: [players[0]['token'], players[1]['token']]
  //}

  // dbo.collection(PMID).insertOne(data, function(err, res) {
  //   if (err) throw err;
  // });
}

function gameFree(roundID) {
  // let myquery = {roundID: roundID };

  // dbo.collection(PMID).deleteOne(myquery, function(err, obj) {
  //   if (err) throw err;
  // });
}





