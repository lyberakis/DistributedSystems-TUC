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
		time.sleep(130)
		producer.send('input', {"tournament": "testTour", "game":"chess", "token": "1"})
		producer.send('input', {"tournament": "testTour", "game":"chess", "token": "2"})
		producer.send('input', {"tournament": "testTour", "game":"chess", "token": "3"})
		producer.send('input', {"tournament": "testTour", "game":"chess", "token": "4"})
		time.sleep(20)
		producer.send('scores', {"winner": "1", "game":"chess", "players" : ["1", "2"], "roundID": "1"})
		producer.send('scores', {"winner": "3", "game":"chess", "players" : ["3", "4"], "roundID": "2"})
		time.sleep(20)
		producer.send('scores', {"winner": "1", "game":"chess", "players" : ["1", "3"], "roundID": "3"})

print("HELLO")

p = Producer()
p.run()
