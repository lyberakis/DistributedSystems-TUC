const io = require('socket.io')()
const mongo = require('mongodb');

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

/*
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://mongodb:27017/";
var mongo_conn = null;
var dbo = null;

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  dbo = db.db("play_repo");
  console.log("Connected to mongodb!");
  mongo_conn = db;
  dbo.createCollection(PMID, function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
  });
});
*/

io.on('connection', (socket) => {
  
  var token = socket.request._query['token'];

  if (token == undefined) {
    socket.disconnect()
  }

  if (token in pending) {
    let roundID = pending[token]['roundID'];
    let game = pending[token]['game'];
    delete pending[token]
    
    if (roundID in games) {
      games[roundID]['players'][1] ={
        'token': token,
        'socket': socket
      }

      //Save to db 
      // dbo.collection(PMID).insertOne(games[roundID], function(err, res) {
      //   if (err) throw err;
      // });

      console.log('second Player connected ')

      let message = {
        'roundID' : roundID,
        'turn' : 'second'
      }
      socket.emit('init', message)

    }else{
      games[roundID] = {}
      games[roundID]['type'] = game;
      games[roundID]['players'] = Array(2)
      games[roundID]['players'][0] ={
        'token': token,
        'socket': socket
      }

      console.log('first Player connected')
      let message = {
        'roundID' : roundID,
        'turn' : 'first'
      }
      socket.emit('init', message)
    }
  }else{
    socket.disconnect()
  }


  //transmite the board from one player to another
  socket.on('update', function (message) {
    let roundID = message['roundID']  //find the game
    let board = message['board']

    if (games[roundID]['players'][0]['socket'] === socket) {
      games[roundID]['players'][1]['socket'].emit('board', board)
    }else if (games[roundID]['players'][1]['socket'] === socket) {
      games[roundID]['players'][0]['socket'].emit('board', board)
    }
  })


  socket.on('gameOver', function (message) {
    
    let roundID = message['roundID'] 
    let players = games[roundID]['players'];

    var score = {
      game : games[roundID]['type'],
      tie: null,
      winner: null,
      player1: players[0]['token'],
      player2: players[1]['token'],
    }

    score['tie'] = message['isGameOver'] && !message['isWinner'];

    if (players[0]['socket'] === socket) {
      if (message['isWinner']) {
        score['winner'] = players[0]['token']
      }else{
        score['winner'] = players[1]['token']
      }
    }else if (games[roundID]['players'][1]['socket'] === socket) {
      if (message['isWinner']) {
        score['winner'] = players[1]['token']
      }else{
        score['winner'] = players[0]['token']
      }
    }

    delete games[roundID];

    // let myquery = {roundID: roundID };

    // dbo.collection(PMID).deleteOne(myquery, function(err, obj) {
    //   if (err) throw err;
    // });

    console.log(score);
    //TODO send score to GM
  })

})


const port_client = 1337
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
  let p1 = players[0];
  let p2 = players[1];

  pending[p1] = {
    'roundID' : id,
    'game' : game
  };
  pending[p2] = pending[p1];
  
  response.writeHead(200);
  response.end();

});

const port_gm = 8080;
app.listen(port_gm);

console.log('Listening on port for GM ' + port_gm + '...')



