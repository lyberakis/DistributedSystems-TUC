const io = require('socket.io')()

let board = null
const players = {'first': null, 'second': null}
let player = 'first'


io.on('connection', (socket) => {
  console.log('Connection0 ')
  if (players['first'] == null) {
    players['first'] = socket
    socket.emit('type', 'first')
    console.log('Connection1 ')
  } else if (players['second'] == null) {
    players['second'] = socket
    socket.emit('type', 'second')
    io.emit('turn', 'x')
  } else {
    socket.disconnect()
  }

  socket.on('update', function (board) {
    if (players['first'] === socket) {
      players['second'].emit('board', board)
    }else if (players['second'] === socket) {
      players['first'].emit('board', board)
    }
  })

  socket.on('gameOver', function (message) {
    var score = {
      tie: null,
      winner: null,
      player1: 'first_id',
      player2: 'second_id',
    }
    score['tie'] = message['isGameOver'] && !message['isWinner'];

    if (players['first'] === socket) {
      if (message['isWinner']) {
        score['winner'] = 'first'
      }else{
        score['winner'] = 'second'
      }
    }else if (players['second'] === socket) {
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
