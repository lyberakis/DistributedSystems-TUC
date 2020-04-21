const io = require('socket.io')()

let board = null
const players = {'first': null, 'second': null}
let player = 'first'

// function reset() {
//   board = Array(9).fill(0).map(x => Array(9).fill(''))
//   players['player1'] = null
//   players['player2'] = null
//   player = 'player1'
// }


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


})


// reset()
const port = 1337
io.listen(port)
console.log('Listening on port ' + port + '...')
