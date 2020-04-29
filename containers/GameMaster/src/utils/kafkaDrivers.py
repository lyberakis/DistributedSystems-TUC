import json
from kafka import KafkaConsumer, KafkaProducer
from utils import log_settings
import logging as log

def json_deserializer(v):
	if v is None:
		return None
	try:
		return json.loads(v.decode('utf-8'))
	except json.decoder.JSONDecodeError:
		log.exception('Unable to decode: %s', v)
		return None


def createConsumer():
	 return KafkaConsumer(
	 	bootstrap_servers='kafka:9092',
		auto_offset_reset='latest',
		enable_auto_commit=True,
		value_deserializer=json_deserializer,
		api_version=(0, 10, 1))

def createProducer():
	return KafkaProducer(
	bootstrap_servers='kafka:9092',
	value_serializer=lambda v: json.dumps(v).encode('utf-8'),
	api_version=(0, 10, 1)
	)
