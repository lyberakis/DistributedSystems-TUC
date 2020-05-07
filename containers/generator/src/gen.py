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
		producer.send('input', {"token": "1", "game":"chess", "tournament" : 1232342})
		time.sleep(5)
		producer.send('input', {"token": "2", "game":"tic-tac-toe" , "tournament" : None})
		time.sleep(5)
		producer.send('input', {"token": "3", "game":"chess" , "tournament" : None})
		time.sleep(5)
		producer.send('input', {"token": "4", "game":"chess" , "tournament" : None})
		time.sleep(5)
		producer.send('input', {"token": "5", "game":"tic-tac-toe" , "tournament" : 3243})
		time.sleep(5)
		producer.send('input', {"token": "6", "game":"tic-tac-toe" , "tournament" : 234})
		time.sleep(5)
		producer.send('input', {"token": "7", "game":"tic-tac-toe" , "tournament" : None})
		

print("HELLO")

p = Producer()
p.run()
