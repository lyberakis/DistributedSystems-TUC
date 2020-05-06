var kafka = require('kafka-node');

var kafka_topic = 'scores';
var producer;


//initiate kafka connection
const clientInit = function() {
	var HighLevelProducer = kafka.HighLevelProducer;
	var Producer = kafka.Producer;
	var KeyedMessage = kafka.KeyedMessage;
	var client = new kafka.KafkaClient({kafkaHost: 'kafka:9092'});
	producer = new HighLevelProducer(client);
	// var km = new KeyedMessage('key', 'message');
	

	producer.on('error', function(err) {
		console.log(err);
		console.log('[kafka-producer -> '+kafka_topic+']: connection errored');
	});

	producer.on('error', function (err) {})

}

//push the score to kafka queue
const send = function(score){
	let payloads = [
	    {
	      topic: kafka_topic,
	      messages: JSON.stringify(score)
	    }
	];

	
	let push_status = producer.send(payloads, (err, data) => {
		if (err) {
			console.log('[kafka-producer -> '+kafka_topic+']: broker update failed');
		} else {
			console.log('[kafka-producer -> '+kafka_topic+']: broker update success');
		}
	});
}

module.exports ={
	clientInit, 
	send
}
 
