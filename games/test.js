
var squares =  Array(9).fill(null);

function checkGameOver(squares){
	for (var row = 0; row < squares.length; row++) {
		console.log(squares[row])
		if (squares[row] == null) {
			return false;
		}
	}
	return true;
}

checkGameOver(squares);