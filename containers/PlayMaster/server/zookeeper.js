const zookeeper = require('node-zookeeper-client');
var os = require("os");
var hostname = os.hostname();

var cmd_port,game_port;
var path = '/games/playmaster/'+hostname;
var zoo;


//initiate zookeeper connection
const clientInit = function(cport, gport){
	zoo = zookeeper.createClient('zookeeper:2181');

	cmd_port = cport;
	game_port = gport;

	var mystate = {
		'cmd_port' : cmd_port,
		'game_port' : game_port,
		'games' : 0,
	};

	zoo.once('connected', function () {

	    console.log('Connected to zookeeper.');
	 
		zoo.create(
			path,
		    Buffer.from(JSON.stringify(mystate)),
		    zookeeper.CreateMode.EPHEMERAL, 
			function (error) {
		        if (error) {
		            console.log('Failed to create node: %s due to: %s.', path, error);
		        } else {
		            console.log('Node: %s is successfully created.', path);
		        }

			}
		);
	});

	zoo.connect();
}


//update the znode of the playmaster
const updateState = function(games){

	mystate = {
		'cmd_port' : cmd_port,
		'game_port' : game_port,
		'games' : games,
	};


	zoo.setData(
		path, 
		Buffer.from(JSON.stringify(mystate)), 
		-1, 
		function (error, stat) {
		    if (error) {
		        console.log(error.stack);
		        return;
		}
	 
	    console.log('Data is set.');
	});

}


module.exports ={
	clientInit, 
	updateState
}
 
