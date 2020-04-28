export function calculateWinner(squares) {
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
      highlight(lines[i]);
      return squares[a];
    }
  }
  return null;
}

function highlight(list) {
  let i;
  for (i in list){
    document.getElementsByClassName('square')[list[i]].style.textShadow = 'red 0px 0px 10px';
  }
}


export function isGameEnded(squares){
	for (var i = 0; i < squares.length; i++) {
		if (squares[i] == null) {
			return false;
		}
	}
	return true;
}
