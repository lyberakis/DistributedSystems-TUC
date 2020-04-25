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
    	
    	let url_string = window.location['href'];
  		let url = new URL(url_string);
  		let playmanster = url.searchParams.get("host");
  		let token = url.searchParams.get("token");

    	let handShake = {
    		query:'token='+token
    	}

    	this.state = {
      		squares: Array(9).fill(null),
    		myTurn: false,
    		token: token,
    		socket: openSocket(playmanster,handShake),
    		type: '-',
 
    	};

    	let self = this;
    	this.state.socket.on('init', message => {

    		let turn = message['turn']
    		let gtype = turn == 'first' ? 'X' : 'O' 
      		this.setState({
      			id: turn,
      			type: gtype,
      			myTurn: gtype == 'X',
      			roundID: message['roundID']
      		})
    	});

    	this.state.socket.on('board', board => {

      		this.setState({
      			squares: board,
      			myTurn: true,
      		})
	      
    	});   
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

			let winStatus = calculateWinner(squares);
			let isGameOver = checkGameOver(squares);

			if(winStatus || isGameOver){
				let message = {
					roundID : this.state.roundID,
					isWinner: winStatus == this.state.type,
					isGameOver: isGameOver
				}
				this.state.socket.emit('gameOver', message)
			}
		}
	}

	render() {
		const winner = calculateWinner(this.state.squares);
		const gameOver = checkGameOver(this.state.squares);

  		let status;

	  	if (winner) {
	  		status = 'Winner:' + winner;
	  	}else if (gameOver){
	  		status = 'Game ended without winner!';
	  	}else{
	  		if (this.state.myTurn) {
	  			status = 'Your turn!';
	  		}else{
	  			status = 'Waiting opponent...';
	  		}
	  	}

	  	let test1 = this.state.token;

    	return (
			<div className="game">
				<div className="game-board">
					<Board 
						squares={this.state.squares}
						onClick={(i) => this.handleClick(i)}
					/>
				</div>
				<div className="game-info">
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

function checkGameOver(squares){
	for (var i = 0; i < squares.length; i++) {
		if (squares[i] == null) {
			return false;
		}
	}
	return true;
}

export default Game;