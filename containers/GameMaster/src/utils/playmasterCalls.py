import requests
import random
from utils import log_settings
import logging as log
import json

def findPlayMaster(myclient):
	mydb = myclient["resources"]
	pm = mydb["playmaster"]

	elem = pm.find({})
	log.info(elem)
	mylist = elem[0]['list']

	if len(mylist) == 0:
		log.critical("No playmasters found")

	pos = random.randint(0,len(mylist)-1)

	ports = {}
	ports['game_port'] = mylist[pos]['game_port']
	ports['cmd_port'] = mylist[pos]['cmd_port']

	log.info(ports)

	return ports


def assignPlay(pair, port):

	url = 'http://playmaster:'+str(port)
	headers = {'Content-Type': 'application/json'}
	data = json.dumps(pair)

	r = requests.post(url = url, data = data, headers=headers)
	
	return r.status_code