import openSocket from 'socket.io-client';
import Bishop from '../pieces/bishop.js';
import Knight from '../pieces/knight.js';
import Queen from '../pieces/queen.js';
import Rook from '../pieces/rook.js';
import King from '../pieces/king.js';
import Pawn from '../pieces/pawn.js';
// ==========================================
// ==> Variables in state <==

//==> host: The domain of the host (localhost)
//==> gamemaster: the port of gamemaster for client requests
//==> token: the unique token of the user issued from the Authorization Service
//==> socket: the socket objet of the client connected to the server
//==> type: the symbol of the user (X,O or white, black)
//==> roundID: the ID of the game

//==> connectionStatus: Connection Status
  // -3 => unauthorized user
  // -2 => trying to reconnect
  // -1 => no connection (the client has not connect to the giver Playmaster)
  //  0 => connected
  //  1 => wait opponent to connect
  //  2 => ready to play
  //  3 => the game is completed
  //  4 => winner because opponent left
  //  5 => spectator mode


// ==========================================
// ==> Messages from client to playmaster <==

// 1. Send the new board 

// let message = {
//   roundID : this.state.roundID,
//   board : squares
// }
// this.state.socket.emit('update', message)


// 2. Inform the playmaster for the winner, if you are the last to play

// let message = {
//   roundID : this.state.roundID,
//   winner: winnerInfo,  //0 for tie, 1 if you won, -1 if you lost
// }
// this.state.socket.emit('endgame', message)

// ==========================================

// ===> FOR OTHER GAME CHANGE THE LINE 109 and 133-140
// ==========================================


//Get argument from the URL
export function getArgumenets() {
	let url_string = window.location['href'];
  	let url = new URL(url_string);

  	let host = url.hostname;
  	let playmaster = url.searchParams.get("pm");
  	let gamemaster = url.searchParams.get("gm");
  	let token = url.searchParams.get("token");

  	let args = {
  		'host': host,
  		'token': token,
  		'playmaster' : playmaster,
  		'gamemaster' : gamemaster,
  	};

  	return args;
}


//Connect to Playmaster
export function connect(server, token){

    let handShake = {
    	query:'token='+token
    }

    let socket = openSocket(server, handShake)

    let response = {
    	'socket': socket,
    	'connectionStatus': socket['connected'] ? 0 : -1,
    }

    return response;
}


export function setListeners(obj){

  //You connected first, wait for the opponent to connect
  obj.state.socket.on('wait', message => {
    obj.setState({
        connectionStatus: 1,
        roundID: message['roundID'],
      })
  });



  //Both players are connected. The game can begin
  obj.state.socket.on('init', message => {

    //Check if the game is new or it is continued from server fault.
    if (obj.state.type === null){
      obj.setState({
        connectionStatus: 2,
        myTurn: message['turn'],
        roundID: message['roundID'],
        myColor: message['turn'] ? 'white' : 'black',
      })
    }else{
      obj.setState({
        connectionStatus: 2,
        roundID: message['roundID']   //get the new round ID
      })
    }
  });

  //Both players are connected. The game can begin
  obj.state.socket.on('viewer', board => {
    console.log('VIWER')
    var classes = stringsToClasses(board);
    
    obj.setState({
      connectionStatus: 5,
      squares: classes,
      myTurn: false
    })
  });


  //Receive the updated board
  obj.state.socket.on('board', board => {
    var classes = stringsToClasses(board["board"]);
    var whiteFallenSoldiers = stringsToClasses(board["whiteFallenSoldiers"]);
    var blackFallenSoldiers = stringsToClasses(board["blackFallenSoldiers"]);
    var turn, player;
    if (!board['dontChange']){
      turn = obj.state.turn === 'white'? 'black' : 'white';
      player = obj.state.player === 1? 2: 1;
    }else{
      turn = obj.state.turn;
      player = obj.state.player;
    }
    console.log(board["board"]);
    console.log(classes);
      obj.setState({
        squares: classes,
        turn: turn,
        whiteFallenSoldiers: whiteFallenSoldiers,
        blackFallenSoldiers: blackFallenSoldiers,
        status: board['status'],
        kingStatus: board['kingStatus'],
        player: player,
        myTurn: true,
      })

      //Set Game progress
      if (board['progress']===1) {
        obj.setState({
          connectionStatus: 3,
          endstate: 1
        })
      }else if (board['progress']===2){
        obj.setState({
          connectionStatus: 3,
          endstate: 2,
        })

      }
  }); 


  //Handler for server disconnection
  obj.state.socket.on('disconnect', board => {

    //if you never connected or the game is completed, return
    if (obj.state.connectionStatus < 0 || obj.state.connectionStatus > 2) {
      return;
    }

    obj.state.socket.disconnect()

    obj.setState({
      connectionStatus: -2,
    })
    
    //Create a request to GameMaster
    var xhr = new XMLHttpRequest()

    xhr.onload = function (e) {

      if (xhr.readyState === 4) {

        //Check if the GameMaster accepted the request
        if (xhr.connectionStatus === 200) {  
          let respone = JSON.parse(xhr.responseText);
          reconnect(obj, respone['playmaster']);
        }else if(xhr.connectionStatus === 403){
          obj.setState({
            connectionStatus: -3,
            endstate: 1,
          })
        }
      }
    }

    let game = 'chess';
    let master = obj.state.host + ':' + obj.state.gamemaster+'/client';
    let url = 'http://'+master+'?'+'token='+obj.state.token+'&game='+game+'&roundID='+ obj.state.roundID;
    
    const delay = (ms, cb) => setTimeout(cb, ms);
    
    delay(getRndInteger(1,300)*100, () => {
      xhr.open('GET', url);
      xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
      xhr.send();
    })
  }); 

  //The game is over from the server's side
  obj.state.socket.on('endgame', message => {
      obj.setState({
        connectionStatus: 4,
      })
      obj.state.socket.disconnect();
  }); 

}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

//Establish a new connections
export function reconnect(obj, port){
  console.log('reconnecting...')
  let playmaster = obj.state.host + ':' + port;
  let token = obj.state.token;
  var data = connect(playmaster,token)

  obj.setState({
    socket: data['socket'],
    status: data['status'],
  });

  console.log(data['socket']);
  setListeners(obj);
}

function stringsToClasses(squares){
  var classes = [];

  if (squares){
    for (let i=0; i<squares.length; i++){
      let splitter = squares[i].toString().split(" ");

      switch(splitter[0]){
        case "King":
          classes.push(new King(parseInt(splitter[1])));
          break;
        case "Pawn":
          classes.push(new Pawn(parseInt(splitter[1])));
          break;
        case "Queen":
          classes.push(new Queen(parseInt(splitter[1])));
          break;
        case "Bishop":
          classes.push(new Bishop(parseInt(splitter[1])));
          break;
        case "Knight":
          classes.push(new Knight(parseInt(splitter[1])));
          break;
        case "Rook":
          classes.push(new Rook(parseInt(splitter[1])));
          break;
        default:
          classes.push(null);
      }
    }
  }
  
  return classes;
}