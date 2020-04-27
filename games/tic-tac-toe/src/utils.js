import openSocket from 'socket.io-client';

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
      return squares[a];
    }
  }
  return null;
}


export function isGameEnded(squares){
	for (var i = 0; i < squares.length; i++) {
		if (squares[i] == null) {
			return false;
		}
	}
	return true;
}

//Get argument from the URL
export function getArgumenets() {
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


//Connect to Playmaster
export function connect(server, token){
	
    let handShake = {
    	query:'token='+token
    }

    let socket = openSocket(server, handShake)

    console.log(socket)

    let response = {
    	'socket': socket,
    	'status': socket['connected'] ? 0 : -1,
    }

    return response;

}