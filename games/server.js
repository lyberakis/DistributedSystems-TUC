const io = require('socket.io')()

var games = {}   //find quickly the receiver
var pending = {}

pending['1234'] = '345346';
pending['4567'] = '345346';

// game['roundID'] = [{'token', 'socket'}]


io.on('connection', (socket) => {
  
  var token = socket.request._query['token'];

  if (token == undefined) {
    socket.disconnect()
  }

  if (token in pending) {
    let roundID = pending[token];
    delete pending[token]
    
    if (roundID in games) {
      games[roundID][1] ={
        'token': token,
        'socket': socket
      }

      console.log('second Player connected ')

      let message = {
        'roundID' : roundID,
        'turn' : 'second'
      }
      socket.emit('init', message)

    }else{
      games[roundID] = {}
      games[roundID] = Array(2)
      games[roundID][0] ={
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

    if (games[roundID][0]['socket'] === socket) {
      games[roundID][1]['socket'].emit('board', board)
    }else if (games[roundID][1]['socket'] === socket) {
      games[roundID][0]['socket'].emit('board', board)
    }
  })


  socket.on('gameOver', function (message) {
    
    let roundID = message['roundID'] 

    var score = {
      tie: null,
      winner: null,
      player1: 'first_id',
      player2: 'second_id',
    }

    score['tie'] = message['isGameOver'] && !message['isWinner'];

    if (games[roundID][0]['socket'] === socket) {
      if (message['isWinner']) {
        score['winner'] = 'first'
      }else{
        score['winner'] = 'second'
      }
    }else if (games[roundID][1]['socket'] === socket) {
      if (message['isWinner']) {
        score['winner'] = 'second'
      }else{
        score['winner'] = 'first'
      }
    }
    console.log(score);
  })


})


const port = 1337
io.listen(port)
console.log('Listening on port ' + port + '...')