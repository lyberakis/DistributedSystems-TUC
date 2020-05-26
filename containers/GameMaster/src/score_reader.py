from utils import kafkaDrivers as kafka
from utils import log_settings
from utils import playmasterCalls as pmCalls
import logging as log
import json
import pymongo
import math
import uuid 
import requests

consumer = kafka.createConsumer()
producer = kafka.createProducer()

#NOT TESTED: tie

consumer.subscribe(['scores'])

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
prog = mydb["inprogress"]
compl = mydb["completed"]

mydb2 = myclient["tournaments"]
pltr = mydb2["players"]#token--id
games = mydb2["games"]#id--winner--loser--tie--round--game
inp = mydb2["inprogress"]#game--id--pop--name--round--received
final = mydb2["completed"]#game--id--pop--name--winner

def handleScore(consumer):
	global boolTest
	for message in consumer:
		record = message.value
		log.info(f'{record} received')

		tourID=None
		for y in pltr.find():
			log.info(f'{y} from search in player tour')
			if y['token']==record['players'][0]:
				tourID=y['id']
				break

		if tourID is None:
			myquery = { "roundID": record['roundID'] }
			prog.delete_one(myquery)
			compl.insert_one(record)
		elif record['winner'] is not None:
			myquery = { "roundID": record['roundID'] }
			prog.delete_one(myquery)
			log.info(f"{record} from reassign")
			for y in inp.find():
				# log.info(f"{y} from searching")
				if y['id']==tourID:
					loser=None
					for z in record['players']:
						if z is not record['winner']:
							loser=z
							break
					data={"id": tourID, "winner": record['winner'], "loser": loser, "round": y['round'], "game": y['game']}
					games.insert_one(data)
					pltr.delete_one({"token": loser})
					
					pop=int(y['pop'])
					nextRound=int(y['round'])+1
					if math.log2(pop)<nextRound:#this was the final
						champ={"id": tourID, "winner": record['winner'], "game": y['game'], "name": y['name'], "pop": y['pop']}
						final.insert_one(champ)
						pltr.delete_one({"token": record['winner']})
						inp.delete_one({"id": tourID})
					else:
						player={"token": record['winner'], "game": y['game'], "tournament": tourID}
						producer.send('input', player)
						
						i=int(y['round'])
						pop=pop/(2*i)
						received=(int(y['received'])+1)
						
						if int(pop)==received:#advance to next round
							old={"id": tourID}
							new={"$set": {"round": nextRound, "received": 0}}
							inp.update_one(old, new)
						else:
							old={"id": tourID}
							new={"$set": {"received": received}}
							inp.update_one(old, new)
					break
		else:#reassign the game with the same players
			ports = pmCalls.findPlayMaster(myclient)
			pair = dict()
			pair["type"] = "active"
			pair["game"] = record['game']
			pair["roundID"] = uuid.uuid4().hex
			pair["players"]=list()
			for z in record['players']:
				pair["players"].append(z)
			pair['gm'] = 9000
			pair['pm'] = int(ports['game_port'])
			status = pmCalls.assignPlay(pair,ports['cmd_port'])
			log.info(f'{status} from PM')

			# Respond to the webserver
			response = dict()
			response['gm'] = 9000
			response['pm'] = int(ports['game_port'])
			response['tokens'] = pair["players"]
			producer.send('output', json.dumps(pair))

		

while True:
	handleScore(consumer)	
