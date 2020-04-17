# import threading
# import logging
import time
import json

from kafka import KafkaConsumer, KafkaProducer

def json_deserializer(v):
	if v is None:
		return None
	try:
		return json.loads(v.decode('utf-8'))
	except json.decoder.JSONDecodeError:
	# log.exception('Unable to decode: %s', v)
		return None

print("HELLO11")

producer = KafkaProducer(
	bootstrap_servers='kafka:9092',
	client_id='325235324',
	value_serializer=lambda v: json.dumps(v).encode('utf-8'),
	api_version=(0, 10, 1)
	)

consumer = KafkaConsumer(bootstrap_servers='kafka:9092',
		auto_offset_reset='latest',
		enable_auto_commit=True,
		group_id='my-group',
		value_deserializer=json_deserializer,
		api_version=(0, 10, 1))

consumer.subscribe(['input'])

chess_queue= list()
tic_queue = list()


while True:
	for message in consumer:
		if message is not None:
			record = message.value
			if record['game'] == 'chess':
				chess_queue.append(record)
				producer.send('output', json.dumps(len(chess_queue)))
				if len(chess_queue) > 2:
					player1 = chess_queue.pop(0)['playerID']
					player2 = chess_queue.pop(1)['playerID']
					match = dict()
					match["game"] = "chess"
					match["players"] = [player1, player2]
					producer.send('output', json.dumps(match))
				else:
					chess_queue.append(record)
			elif record['game'] == 'tic':
				tic_queue.append(record)
				if len(tic_queue) > 2:
					player1 = tic_queue.pop(0)['playerID']
					player2 = tic_queue.pop(1)['playerID']
					match = dict()
					match["game"] = "tic"
					match["players"] = [player1, player2]
					producer.send('output', json.dumps(match))
				else:
					tic_queue.append(record)
		