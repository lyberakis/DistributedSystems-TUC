import React from 'react';
import './index.css';
import openSocket from 'socket.io-client';

// npm i socket.io-client

//SQUARE
function Square(props) {

    return (
        <button 
          className="square" 
          onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

//BOARD
class Board extends React.Component {
	
	renderSquare(i) {
    	return (
    		<Square 
    			value={this.props.squares[i]}
    			onClick={() => this.props.onClick(i)}
    		/>);
	}

	render() {
		return (
			<div>
				<div className="board-row">
					{this.renderSquare(0)}
					{this.renderSquare(1)}
					{this.renderSquare(2)}
				</div>
				<div className="board-row">
					{this.renderSquare(3)}
					{this.renderSquare(4)}
					{this.renderSquare(5)}
				</div>
				<div className="board-row">
					{this.renderSquare(6)}
					{this.renderSquare(7)}
					{this.renderSquare(8)}
				</div>
			</div>
    	);
    }
}


//GAME
class Game extends React.Component {
	constructor(props) {
    	super(props);

    	let args = getArgumenets();
    	let data = connect(args['host']+':'+args['playmanster'],args['token'])
    	
    	this.state = {
    		host: args['host'],
    		gamemaster: args['gamemaster'],
      		squares: Array(9).fill(null),
    		myTurn: false,
    		token: args['token'],
    		socket: data['socket'],
    		status: data['status'],
    		type: '-',
    		turn: null,
 
    	};

    	this.setListeners(); 
  	}

  	setListeners(){
  		this.state.socket.on('wait', message => {
    		this.setState({
      			status: 1
      		})
    	});

    	this.state.socket.on('init', message => {
    		let turn = message['turn'];
    		if (this.state.id == null){
	    		let gtype = turn == 'first' ? 'X' : 'O' 
 
	      		this.setState({
	      			id: turn,
	      			status: 2,
	      			type: gtype,
	      			myTurn: gtype == 'X',
	      			roundID: message['roundID']
	      		})
	      	}else{
	      		let gtype = this.state.id == 'first' ? 'X' : 'O' 
	      		this.setState({
	      			id: turn,
	      			status: 2,
	      			type: gtype,
	      			roundID: message['roundID']
	      		})
	      	}

      		console.log("Game Init!")
    	});

    	//
    	this.state.socket.on('board', board => {
      		this.setState({
      			squares: board,
      			myTurn: true,
      		})
    	}); 

    	this.state.socket.on('disconnect', board => {
    		console.log("disconnect");
    		this.state.socket.disconnect()

    		if (this.state.status > 0) {}

    		this.setState({
				status: 4,
			})
    		
    		var xhr = new XMLHttpRequest()
			xhr.onload = function (e) {
				// update the state of the component with the result here
				if (xhr.readyState == 4) {
        			if (xhr.status == 200) {
						let respone = JSON.parse(xhr.responseText);
						console.log(xhr.responseText)
						this.reconnect(respone['playmaster']);
						
					}
				}
		    }.bind(this);

		    let game = 'tic-tac-toe';
		    let master = this.state.host + ':' + this.state.gamemaster
		    let url = 'http://'+master+'?'+'token='+this.state.token+'&game='+ game;

			xhr.open('GET', url);
			//xhr.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded');
			xhr.send();
    		if (this.state.status >0) {}
      		// this.setState({
      		// 	squares: board,
      		// 	myTurn: true,
      		// })
    	}); 

  	}

  	reconnect(port){
  		console.log('reconnecting...')
  		let playmaster = this.state.host + ':' + port;
		let token = this.state.token;
		var data = connect(playmaster,token)

		this.setState({
			socket: data['socket'],
			status: data['status'],
		});

		console.log(data['socket']);
		this.setListeners();
  	}

	handleClick(i){
	  	if (this.state.myTurn) {
			const squares = this.state.squares.slice();   //create a copy of the array

			//if the game is over or the sqare is already filled, return
			if (calculateWinner(squares) || squares[i]){
				return;
			}

			squares[i] = this.state.type;
			
			this.setState({
				squares: squares,
				myTurn: !this.state.myTurn,
			});

			let message = {
				roundID : this.state.roundID,
				board : squares
			}

			this.state.socket.emit('update', message)

			let winner = calculateWinner(squares);
			let endgame = isGameEnded(squares);

			//check if the game is ended
			if(endgame || winner){
				let message = {
					roundID : this.state.roundID,
					winner: winner,
				}
				this.state.socket.emit('endgame', message)
			}
		}
	}

	render() {
		const winner = calculateWinner(this.state.squares);
		const gameOver = isGameEnded(this.state.squares);

  		let status;
  		let conn_status;

  		if (this.state.status == 0) {
	  		conn_status = 'Connection establised!';
	  	}else if (this.state.status == 1) { 
	  		conn_status = 'Connected! Wait opponent to connect.';
	  	}else if (this.state.status == 2) {
	  		conn_status = 'Ready!';
	  		if (winner) {
		  		status = 'Winner:' + winner;
		  	}else if (gameOver){
		  		status = 'Game ended without winner!';
		  	}else{
		  		if (this.state.myTurn) {
		  			status = 'Your turn!';
		  		}else{
		  			status = 'opponent\'s turn';
		  		}
		  	}
	  	}else if (this.state.status == 4){
	  		conn_status = 'Re-connecting!';
	  	}
	  	else{
	  		conn_status = 'Connection error!';
	  	}


    	return (
			<div className="game">
				<div className="game-board">
					<Board 
						squares={this.state.squares}
						onClick={(i) => this.handleClick(i)}
					/>
				</div>
				<div className="game-info">
					<div>{conn_status}</div>
				 	<div>{status}</div>
				 	<div>Your symbol: {this.state.type}</div>
				</div>
			</div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function isGameEnded(squares){
	for (var i = 0; i < squares.length; i++) {
		if (squares[i] == null) {
			return false;
		}
	}
	return true;
}

function getArgumenets() {
	let url_string = window.location['href'];
  	let url = new URL(url_string);

  	let host = url.hostname;
  	let playmanster = url.searchParams.get("pm");
  	let gamemaster = url.searchParams.get("gm");
  	let token = url.searchParams.get("token");

  	let args = {
  		'host': host,
  		'token': token,
  		'playmanster' : playmanster,
  		'gamemaster' : gamemaster 
  	};

  	return args;
}

function connect(server, token){
	
	if (token || server) {

	}

    let handShake = {
    	query:'token='+token
    }

    let socket = openSocket(server, handShake)

    let response = {
    	'socket': socket,
    	'status': socket['connected'] ? 0 : -1,
    }

    console.log(response)

    return response;

}


export default Game;