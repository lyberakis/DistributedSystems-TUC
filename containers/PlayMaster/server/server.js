const io = require('socket.io')()
// const MongoClient = require('mongodb').MongoClient;

var myArgs = process.argv.slice(2);

const PMID = "0683424";
var games = {}   //find quickly the receiver
var spectators = {}
var pending = {}

//How to TEST
// node server.js 8080 1337
// cd to-game
// npm start
// go to http://localhost:3000/?pm=1337&gm=9000&token=1
// go to http://localhost:3000/?pm=1337&gm=9000&token=2

// var kafka = require('kafka-node');
// var HighLevelProducer = kafka.HighLevelProducer;
// var Producer = kafka.Producer;
// var KeyedMessage = kafka.KeyedMessage;
// var client = new kafka.KafkaClient({kafkaHost: 'kafka:9092'});
// var producer = new HighLevelProducer(client);
// var km = new KeyedMessage('key', 'message');
// var kafka_topic = 'scores';

// producer.on('error', function(err) {
// 	console.log(err);
// 	console.log('[kafka-producer -> '+kafka_topic+']: connection errored');
// });

// producer.on('ready', function () {
//     producer.send(payloads, function (err, data) {
//         console.log(data);
//     });
// });
 
// producer.on('error', function (err) {})

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


	// socket.on('endgame', function (message) {
	// 	let roundID = message['roundID'] 
	// 	let players = games[roundID]['players'];
	// 	let sender = players[0]['socket'] === socket ? 0 : 1;

	// 	switch(message['winner']){
	// 		case 0:
	// 			createScore(roundID, null)
	// 			break;
	// 		case 1:
	// 			createScore(roundID, sender)
	// 			break;
	// 		case -1:
	// 			createScore(roundID, invert(sender))
	// 			break;

	// 	}

	// 	delete games[roundID];

	// })


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


	//Send the score to GameMaster via Kafka
	// let payloads = [
	//     {
	//       topic: kafka_topic,
	//       messages: JSON.stringify(score)
	//     }
	// ];

	
	// let push_status = producer.send(payloads, (err, data) => {
	// 	if (err) {
	// 		console.log('[kafka-producer -> '+kafka_topic+']: broker update failed');
	// 	} else {
	// 		console.log('[kafka-producer -> '+kafka_topic+']: broker update success');
	// 	}
	// });

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
  // let id = uniqid();
  var roundID = request.body['roundID'];
  var type = request.body['type'];
  var game = request.body['game'];
  var players = request.body['players'];

  if (type == 'active') {
  	console.log("Received active game")
	let p1 = players[0];
	let p2 = players[1];
	pending[p1] = {
	'roundID' : roundID,
	'game' : game
	};
	pending[p2] = pending[p1];
  }else{
  	spectators[players[0]] = roundID;
  }

  
  
  response.writeHead(200);
  response.end();

});

const port_gm = myArgs[0];
app.listen(port_gm);

console.log('Listening on port for GM ' + port_gm + '...')


// const url = "mongodb://root:rootpassword@mongodb:27017/";
// var mongo_conn = null;
// var dbo = null;
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





