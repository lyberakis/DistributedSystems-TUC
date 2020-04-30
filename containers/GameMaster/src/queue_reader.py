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

plays = initPlays()


while True:
	for message in consumer:
		record = message.value
		log.info(f'{record} received')

		game = record['game']

		if game not in plays:
			log.warning(f'{game} is invalid game!')
			continue

		plays[game]['queue'].append(record['token'])

		if len(plays[game]['queue']) == plays[game]['members']:

			# Assign the game to playmaster
			assign = dict()
			assign["type"] = "active"
			assign["game"] = game
			assign["roundID"] = uuid.uuid4().hex
			assign["players"] = plays[game]['queue'].copy()

			port = findPlayMaster()

			url = 'http://playmaster:'+str(port['gate'])
			headers = {'Content-Type': 'application/json'}
			data = json.dumps(assign)

			r = requests.post(url = url, data = data, headers=headers) 

			log.info(f'{r.status_code} from PM')

			# Respond to the webserver
			response = dict()
			response['gm'] = 9000
			response['pm'] = port['server']
			response['tokens'] = plays[game]['queue']

			producer.send('output', json.dumps(assign))

			# Save to DB
			x = pr.insert_one(assign)

			log.info(f'{x} from DB')

			plays[game]['queue'].clear()


