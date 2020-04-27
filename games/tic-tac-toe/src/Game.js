import React from 'react';
import './index.css';
import * as condition from './utils/gameConditions.js'; 
import * as conn from './utils/multiplayer.js'; 

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

    	//Establish Connection
    	let args = conn.getArgumenets();
    	let data = conn.connect(args['host']+':'+args['playmanster'],args['token'])
    	
    	this.state = {
    		host: args['host'],
    		gamemaster: args['gamemaster'],
      		squares: Array(9).fill(null),
    		myTurn: false,
    		token: args['token'],
    		socket: data['socket'],
    		status: data['status'],
    		type: null,
    		roundID: null,
    	};

    	//set event handlers for server messages
    	conn.setListeners(this);
  	}

  	
	handleClick(i){
	  	if (this.state.myTurn) {
			const squares = this.state.squares.slice();   //create a copy of the array

			//if the game is over or the sqare is already filled, return
			if (condition.calculateWinner(squares) || squares[i]){
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

			let winner = condition.calculateWinner(squares);
			let endgame = condition.isGameEnded(squares);
			let winnerInfo = null;

			if (winner == null) {
				winnerInfo = 0;
			}else if (winner == this.state.type) {
				winnerInfo = 1;
			}else{
				winnerInfo = -1;
			}

			//check if the game is ended
			if(endgame || winner){
				let message = {
					roundID : this.state.roundID,
					winner: winnerInfo,
				}
				this.state.socket.emit('endgame', message)
			}
		}
	}
	
	// Setup the `beforeunload` event listener
	setupBeforeUnloadListener() {
	    window.addEventListener("beforeunload", (ev) => {
	        ev.preventDefault();
	        return 'Are you sure you want to leave?';
	    });
	}

	componentDidMount() {
        // Activate the event listener
        this.setupBeforeUnloadListener();
    }

	render() {
		const winner = condition.calculateWinner(this.state.squares);
		const gameOver = condition.isGameEnded(this.state.squares);

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
				 	<div>STATUS: {this.state.status}</div>
				</div>
			</div>
    );
  }
}

export default Game;