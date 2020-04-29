from utils import kafkaDrivers as kafka
from utils import log_settings
import logging as log

consumer = kafka.createConsumer()

consumer.subscribe(['scores'])


while True:
	for message in consumer:
		record = message.value
		log.info(f'{record} received')