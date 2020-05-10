from utils import kafkaDrivers as kafka
from utils import mongoDrivers as mongo
from utils import log_settings
import logging as log
import uuid 
import json
import requests
import pymongo

consumer = kafka.createConsumer()
consumer.subscribe(['input'])
log.getLogger().setLevel(log.INFO)
producer = kafka.createProducer()


myclient = mongo.createClient()
mydb = myclient["games"]
pr = mydb["inprogress"]

mydb2 = myclient["tournaments"]
tr = mydb2["pending"]#game--id--pop--name
pltr = mydb2["players"]#token--id
inp = mydb2["inprogress"]#game--id--pop--name--round

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

def practice(record):
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
		pair['gm'] = 9000
		pair['pm'] = 1337
		status = assignPlay(pair)
		log.info(f'{status} from PM')

		# Respond to the webserver
		response = dict()
		response['gm'] = 9000
		response['pm'] = 1337
		response['tokens'] = plays[game]['queue']
		producer.send('output', json.dumps(pair))

		# Save to DB
		x = pr.insert_one(pair)
		log.info(f'{x} from DB')
		plays[game]['queue'].clear()


def tournament(record):
	game = record['game']
	tournament = record['tournament']
	logs.info('This is a test')
	if record['token'] not in pl.find():
		if tournament not in tournaments['id']:
			i=0
			logs.info('we need to enter here')
			while i<=len(tournaments):
				logs.info('here')
				if not tournaments[i]:
					logs.info('and then here')
					tournaments[i]['id']=x['id']
					tournaments[i]['pop']=x['pop']
					tournaments[i]['queue']=list()
					break
				i+=1
		else:
			for x in tournaments:
				if x['id']==tournament:
					x['queue'].append(record['token'])
					if len(x['queue']) == x['pop']:
						i=0
						while i<len(x['queue']):
							pair = dict()
							pair["type"] = "active"
							pair["game"] = game
							pair["roundID"] = uuid.uuid4().hex
							pair["players"][0] = x['queue'][i].copy()
							i+=1
							pair["players"][1] = x['queue'][i].copy()
							i+=1
							pair['gm'] = 9000
							pair['pm'] = 1337
							status = assignPlay(pair)
							log.info(f'{status} from PM')

							response = dict()
							response['gm'] = 9000
							response['pm'] = 1337
							response['tokens'] = pair["players"]
							producer.send('output', json.dumps(pair))

							pair["players"][0]["id"]=tournament
							pair["players"][1]["id"]=tournament
							x = pl.insert_one(pair["players"][0])
							log.info(f'{x} from DB')
							x = pl.insert_one(pair["players"][1])
							log.info(f'{x} from DB')\

						tournaments.pop(x)
						for y in pen.find():
							if y['id']==tournament:
								new_y=y
								new_y["round"]=1
								inp.insert_one(new_y)
								pen.delete_one(y)
								break

				break
	#else:
		#new_round


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

		
tournaments = {}
plays = initPlays()
	


while True:
	readRecords(consumer, producer)
	


