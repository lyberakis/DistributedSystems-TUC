# import threading
import logging
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

chess_queue = list()
tic_queue = list()

chess_pending = None
tic_pending = None


while True:
	for message in consumer:
		record = message.value
		if record['game'] == 'chess':
			if chess_pending is not None:
				player1 = chess_pending['playerID']
				player2 = record['playerID']
				match = dict()
				match["game"] = "chess"
				match["players"] = [player1, player2]
				producer.send('output', json.dumps(match))
				chess_pending = None
			else:
				chess_pending = record
		elif record['game'] == 'tic':
			if tic_pending is not None:
				player1 = tic_pending['playerID']
				player2 = record['playerID']
				match = dict()
				match["game"] = "tic"
				match["players"] = [player1, player2]
				producer.send('output', json.dumps(match))
				tic_pending = None
			else:
				tic_pending = record
		# elif record['game'] == 'tic':
		# 	tic_queue.append(record)
		# 	if len(tic_queue) > 1:
		# 		player1 = tic_queue.pop(0)['playerID']
		# 		player2 = tic_queue.pop(1)['playerID']
		# 		match = dict()
		# 		match["game"] = "tic"
		# 		match["players"] = [player1, player2]
		# 		producer.send('output', json.dumps(match))
		# 	else:
		# 		tic_queue.append(record)
		