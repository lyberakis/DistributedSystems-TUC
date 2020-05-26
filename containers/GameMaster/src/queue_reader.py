from utils import kafkaDrivers as kafka
from utils import mongoDrivers as mongo
from utils import log_settings
from utils import playmasterCalls as pmCalls
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
pen = mydb2["pending"]#game--id--pop--name
pltr = mydb2["players"]#token--id
inp = mydb2["inprogress"]#game--id--pop--name--round--received

def initPlays():
	plays = {};
	plays['chess'] = {}
	plays['chess']['members'] = 2
	plays['chess']['queue'] = list()

	plays['tic-tac-toe'] = {}
	plays['tic-tac-toe']['members'] = 2
	plays['tic-tac-toe']['queue'] = list()

	return plays


def practice(record):
	game = record['game']
	plays[game]['queue'].append(record['token'])

	# Check if there are enough players for the round
	if len(plays[game]['queue']) == plays[game]['members']:
		address = pmCalls.findPlayMaster(myclient)

		# Assign the game to playmaster
		pair = dict()
		pair["type"] = "active"
		pair["game"] = game
		pair["roundID"] = uuid.uuid4().hex
		pair["players"] = plays[game]['queue'].copy()
		pair['gm'] = 9000
		pair['pm'] = int(address['game_port'])
		status = pmCalls.assignPlay(pair, address['hostname'], address['cmd_port'])
		log.info(f'{status} from PM')

		# Respond to the webserver
		response = dict()
		response['gm'] = 9000
		response['pm'] = int(address['game_port'])
		response['tokens'] = plays[game]['queue']
		producer.send('output', json.dumps(pair))

		# Save to DB
		x = pr.insert_one(pair)
		log.info(f'{x} from DB')
		plays[game]['queue'].clear()


def tournament(record):
	game = record['game']
	tourID = record['tournament']
	
	checkPlayer=False
	for x in pltr.find():
		# log.info(f'{x} from loop1')
		if record['token']==x['token']:
			checkPlayer=True

	if checkPlayer==False:
		i=0
		exists=False
		while i<len(tournaments):
			if i in tournaments:
				if tournaments[i]['id']==tourID:
					exists=True
					break
			i+=1
		if exists==False:
			i=0
			while i<=len(tournaments):
				if i not in tournaments:
					tournaments[i]={}
					tournaments[i]['id']=tourID
					for x in pen.find():
						if x['id']==tourID:
							tournaments[i]['pop']=x['pop']
							break
					tournaments[i]['queue']=list()
					tournaments[i]['queue'].append(record['token'])
					x = pltr.insert_one({"token": record['token'], "id": tourID})
					log.info(f'{x} from DB')
					break
				i+=1
		else:
			tournaments[i]['queue'].append(record['token'])
			pltr.insert_one({"token": record['token'], "id": tourID})
			log.info(f'{tournaments[i]} from DB')
			test=len(tournaments[i]['queue'])
			test2=int(tournaments[i]['pop'])
			
			if test == test2:
				assignTournamentGames(tournaments[i]['queue'], game)
				tournaments.pop(i)
				for y in pen.find():
					if y['id']==tourID:
						new_y=y
						new_y["round"]=1
						new_y["received"]=0
						x=inp.insert_one(new_y)
						x=pen.delete_one({'id': tourID})
						break
	else:
		i=0
		exists=False
		while i<len(newRounds):
			if i in newRounds:
				if newRounds[i]['id']==tourID:
					exists=True
					break
			i+=1
		if exists==False:
			i=0
			while i<=len(newRounds):
				if i not in newRounds:
					newRounds[i]={}
					newRounds[i]['id']=tourID
					for x in inp.find():
						if x['id']==tourID:
							newRounds[i]['pop']=x['pop']/(2*int(x['round']))
							break					
					newRounds[i]['queue']=list()
					newRounds[i]['queue'].append(record['token'])
					break
				i+=1
		else:
			newRounds[i]['queue'].append(record['token'])
			test=len(newRounds[i]['queue'])
			test2=int(newRounds[i]['pop'])
			
			if test == test2:
				assignTournamentGames(newRounds[i]['queue'], game)
				newRounds.pop(i)

def assignTournamentGames(queue, game):
	j=0
	while j<len(queue):
		address = pmCalls.findPlayMaster(myclient)
		pair = dict()
		pair["type"] = "active"
		pair["game"] = game
		pair["roundID"] = uuid.uuid4().hex
		pair["players"]=list()
		pair["players"].append(queue[j])
		j+=1
		pair["players"].append(queue[j])
		j+=1
		pair['gm'] = 9000
		pair['pm'] = int(address['game_port'])
		status = pmCalls.assignPlay(pair, address['hostname'], address['cmd_port'])
		log.info(f'{status} from PM')

		response = dict()
		response['gm'] = 9000
		response['pm'] = int(address['game_port'])
		response['tokens'] = pair["players"]
		producer.send('output', json.dumps(pair))

		x = pr.insert_one(pair)
		log.info(f'{x} from DB')


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

		
tournaments = {};
newRounds ={};
plays = initPlays()
#pen.insert_one({"game": "chess", "id": "testTour", "pop": 4, "name": "test"})
while True:
	readRecords(consumer, producer)