# import threading
# import logging
import time
import json

from kafka import KafkaConsumer, KafkaProducer
print("HELLO11")
class Producer(object):
    def run(self):
    	print("Running")
    	producer = KafkaProducer(
				    bootstrap_servers='kafka:9092',
				    client_id='325235324',
				    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
				    api_version=(0, 10, 1)
				)
    	# producer = KafkaProducer(bootstrap_servers='localhost:9092', value_serializer=lambda v: json.dumps(v).encode('utf-8'))
    	while True:
            producer.send('input', {"playerID": "34324", "game":"chess"})
            time.sleep(5)
            producer.send('input', {"playerID": "32422", "game":"tic"})
            time.sleep(5)
            producer.send('input', {"playerID": "333667", "game":"chess"})
            time.sleep(5)
		

print("HELLO")

p = Producer()
p.run()
