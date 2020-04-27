import React from 'react';
import './index.css';
import * as utils from './utils.js'; 

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
    	let args = utils.getArgumenets();
    	let data = utils.connect(args['host']+':'+args['playmanster'],args['token'])
    	
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
    	this.setListeners();
    	this.setupBeforeUnloadListener();
  	}

  	setListeners(){
  		//You connected first, wait for the opponent to connect
  		this.state.socket.on('wait', message => {
    		this.setState({
      			status: 1,
      			roundID: message['roundID'],
      		})
    	});

  		//Both players are connected. The game can begin
    	this.state.socket.on('init', message => {


    		//Check if the game is new or it is continued from server fault.
    		if (this.state.type == null){
    			let turn = message['turn'];
	    		let type = turn ? 'X' : 'O' 
 
	      		this.setState({
	      			status: 2,
	      			type: type,
	      			myTurn: turn,
	      			roundID: message['roundID']
	      		})
	      	}else{ 
	      		this.setState({
	      			status: 2,
	      			roundID: message['roundID']   //get the new round ID
	      		})
	      	}
    	});

    	//Receive the updated board
    	this.state.socket.on('board', board => {
      		this.setState({
      			squares: board,
      			myTurn: true,
      		})
    	}); 

    	//Handler for server disconnection
    	this.state.socket.on('disconnect', board => {

    		//if you never connected or the game is completed, return
    		if (this.state.status < 0 || this.state.status > 2) {
    			return;
    		}

    		this.state.socket.disconnect()

    		this.setState({
				status: 4,
			})
    		
    		//Create a request to GameMaster
    		var xhr = new XMLHttpRequest()

			xhr.onload = function (e) {

				if (xhr.readyState == 4) {

					//Check if the GameMaster accepted the request
        			if (xhr.status == 200) {  
						let respone = JSON.parse(xhr.responseText);
						this.reconnect(respone['playmaster']);
					}else if(xhr.status == 403){
						this.setState({
							status: -3,
						})
					}
				}
		    }.bind(this);

		    let game = 'tic-tac-toe';
		    let master = this.state.host + ':' + this.state.gamemaster
		    let url = 'http://'+master+'?'+'token='+this.state.token+'&game='+ game;

			xhr.open('GET', url);
			xhr.send();
    	}); 

    	//The game is over from the server's side
    	this.state.socket.on('endgame', message => {
      		this.setState({
      			status: 4,
      		})
      		this.state.socket.disconnect();
    	}); 

  	}

  	//Establish a new connections
  	reconnect(port){
  		console.log('reconnecting...')
  		let playmaster = this.state.host + ':' + port;
		let token = this.state.token;
		var data = utils.connect(playmaster,token)

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
			if (utils.calculateWinner(squares) || squares[i]){
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

			let winner = utils.calculateWinner(squares);
			let endgame = utils.isGameEnded(squares);
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

	doSomethingBeforeUnload() {
		let message = {
			roundID : this.state.roundID
		}
       this.state.socket.emit('surrender', message);
       return;
    }

	
	// Setup the `beforeunload` event listener
	setupBeforeUnloadListener() {
	    window.addEventListener("beforeunload", (ev) => {
	        ev.preventDefault();
	        return 'Are you sure you want to leave?';
	        // this.doSomethingBeforeUnload();
	    });
	}

	

	componentDidMount() {
        // Activate the event listener
        this.setupBeforeUnloadListener();
    }

	render() {
		const winner = utils.calculateWinner(this.state.squares);
		const gameOver = utils.isGameEnded(this.state.squares);

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