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
		time.sleep(75)
		producer.send('scores', {"winner": None, "game":"chess", "players" : ["1", "2"], "roundID": "1"})
		time.sleep(15)
		producer.send('scores', {"winner": "1", "game":"chess", "players" : ["1", "2"], "roundID": "1"})
		

print("HELLO")

p = Producer()
p.run()
