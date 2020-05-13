

export function showGameStatus(status){
	let message;

	switch(status){
		case -3:
			message = 'Unauthorized connection.';
			break;
		case -2:
			message = 'Redirecting...';
			break;
		case -1:
			message = 'No connection found.';
			break;
		case 0:
			message = 'Connected!';
			break;
		case 1:
			message = 'Wait for opponent to connect.';
			break;
		case 2:
			message = 'The game is active.';
			break;
		case 3:
			message = 'The game is completed!';
			break;
		case 4:
			message = 'The opponent left.';
			break;
		case 5:
			message = 'Spectator mode.';
			break;
		default:
			message = 'Undefined status.';
			break;
	}

	return message;
}


export function showWinner(endstate, status){
	let message;

	if (status !== 5) {
		if (endstate === 3) {
			message = 'VICTORY!';
		}else if (endstate === 1){
			message = 'DEFEAT!';
		}else if (endstate === 2) {
			message = 'TIE!';
		}
	}else{
		// if (win !== null) {
		// 	message = 'WINNER: '+win;
		// }else if (end){
		// 	message = 'TIE!';
		// }
	}

	return message;
}

export function showTurn(status, turn){
	let message;

	if (status === 2) {
		if (turn) {
			message = 'Your turn.';
		}else{
			message = 'Opponent\'s turn.';
		}
	}

	return message;
}


export function showSymbol(symbol){
	let message;

	if (symbol) {
		message = 'You are: ' + symbol;
	}

	return message;
}