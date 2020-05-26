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

	address = {}
	address['hostname'] = mylist[pos]['hostname']
	address['game_port'] = mylist[pos]['game_port']
	address['cmd_port'] = mylist[pos]['cmd_port']

	log.info(address)

	return address


def assignPlay(pair, hostname, port):

	url = 'http://'+str(hostname)+':'+str(port)
	headers = {'Content-Type': 'application/json'}
	data = json.dumps(pair)

	r = requests.post(url = url, data = data, headers=headers)
	
	return r.status_code