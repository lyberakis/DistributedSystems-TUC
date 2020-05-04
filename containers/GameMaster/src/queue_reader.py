from utils import kafkaDrivers as kafka
from utils import log_settings
import logging as log
import uuid 
import json
import requests
import pymongo

consumer = kafka.createConsumer()
consumer.subscribe(['input'])

producer = kafka.createProducer()

try:
    # try to instantiate a client instance
    myclient = pymongo.MongoClient(
        host = [ 'mongodb:27017' ],
        serverSelectionTimeoutMS = 3000, # 3 second timeout
        username = "root",
        password = "rootpassword",
    )
    log.info("db connection established")
except:
	log.exception("db connection")

mydb = myclient["games"]
pr = mydb["inprogress"]

def initPlays():
	plays = {};
	plays['chess'] = {}
	plays['chess']['members'] = 2
	plays['chess']['queue'] = list()

	plays['tic-tac-toe'] = {}
	plays['tic-tac-toe']['members'] = 2
	plays['tic-tac-toe']['queue'] = list()

	return plays

def findPlayMaster():
	ports = {}
	ports['server'] = 1337
	ports['gate'] = 8080

	return ports


def assignPlay(pair):
	port = findPlayMaster()

	url = 'http://playmaster:'+str(port['gate'])
	headers = {'Content-Type': 'application/json'}
	data = json.dumps(pair)

	r = requests.post(url = url, data = data, headers=headers)
	
	return r.status_code

def practice(game):
	game = record['game']
	plays[game]['queue'].append(record['token'])

	# Check if there are enough players for the round
	if len(plays[game]['queue']) == plays[game]['members']:

		# Assign the game to playmaster
		pair = dict()
		pair["type"] = "active"
		pair["game"] = game
		pair["roundID"] = uuid.uuid4().hex
		pair["players"] = plays[game]['queue'].copy()
		status = assignPlay(pair)
		log.info(f'{status} from PM')

		# Respond to the webserver
		response = dict()
		response['gm'] = 9000
		response['pm'] = port['server']
		response['tokens'] = plays[game]['queue']
		producer.send('output', json.dumps(pair))

		# Save to DB
		x = pr.insert_one(assign)
		log.info(f'{x} from DB')
		plays[game]['queue'].clear()


def tournament(record):
	game = record['game']
	tournament = record['tournament']


def readRecords(consumer, producer):
	for message in consumer:
		record = message.value
		log.info(f'{record} received')

		# Check if the game type is valid
		if record['game'] not in plays:
			log.warning(f'{game} is invalid game!')
			continue

		
		if record['tournament'] is None:
			practice(record)
		else:
			tournament(record)

		

plays = initPlays()


while True:
	handlePairs(consumer, producer)
	


