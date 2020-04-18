# import threading
# import logging
import time
import json
from utils import log_settings
import logging as log

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
		time.sleep(10)
		producer.send('input', {"playerID": "1", "game":"chess"})
		time.sleep(5)
		producer.send('input', {"playerID": "2", "game":"tic"})
		time.sleep(5)
		producer.send('input', {"playerID": "3", "game":"chess"})
		time.sleep(5)
		producer.send('input', {"playerID": "4", "game":"chess"})
		time.sleep(5)
		producer.send('input', {"playerID": "5", "game":"tic"})
		time.sleep(5)
		producer.send('input', {"playerID": "6", "game":"tic"})
		time.sleep(5)
		producer.send('input', {"playerID": "7", "game":"tic"})
		

print("HELLO")

p = Producer()
p.run()
