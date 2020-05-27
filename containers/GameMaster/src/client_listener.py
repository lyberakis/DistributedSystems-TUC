from flask_cors import CORS
from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from utils import log_settings
from utils import playmasterCalls as pmCalls
import logging as log
from utils import mongoDrivers as mongo
import json
import signal
import time

api = Flask(__name__)
cors = CORS(api, resources={r"/client/*": {"Access-Control-Allow-Origin": "*"}})
# api = Api(app)
myclient = mongo.createClient()
mydb = myclient["games"]
players = mydb["inprogress"]

recovery = {}
@api.route('/client',methods=['GET'])
def get():
	time.sleep(10)
	log.info(f'Hello from recovery')
	global recovery
	args = request.args
	
	try:
		roundID = str(args['roundID'])
		token = str(args['token'])
		game = str(args['game'])
	except Exception as e:
		# response = ''
		# response.headers.add("Access-Control-Allow-Origin", "*")
		return '', 403

	log.info(f'recovery {recovery}')
	log.info(f'Client request received with {roundID}, {token}, {game}')
	# Check if the roundID is save locally
	if roundID in recovery:
		# check if we have a spectator
		if token not in recovery[roundID]['players']:
			tokens = []
			tokens.append(token)
			pair = dict()
			pair["spectator"] = True
			pair["game"] = recovery[roundID]['game']
			pair["roundID"] = roundID
			pair["players"] = tokens
			pair['gm'] = 9000
			pair['pm'] = recovery[roundID]['game_port']
			status = pmCalls.assignPlay(pair, recovery[roundID]['hostname'], recovery[roundID]['cmd_port'])
			
			log.info(f'{status} from PM')
		else:
			server = {
				'playmaster' : recovery[roundID]['game_port']
			}
		# recovery[roundID]['connected'] += 1;

		# if recovery[roundID]['connected'] == recovery[roundID]['total']:
		# 	del recovery[roundID]
	else:
		query = {'roundID':roundID}
		play = players.find(query)
		play = play[0]

		address = pmCalls.findPlayMaster(myclient)
		
		# Assign the game to playmaster
		pair = dict()
		pair["spectator"] = False
		pair["game"] = game
		pair["roundID"] = roundID
		pair["players"] = play['players']
		pair['gm'] = 9000
		pair['game_port'] = int(address['game_port'])
		pair['cmd_port'] = int(address['cmd_port'])
		pair['host'] =  address['hostname']
		status = pmCalls.assignPlay(pair, address['hostname'], address['cmd_port'])
		log.info(f'{status} from PM')

		# check if we have a spectator
		if token not in play['players']:
			tokens = []
			tokens.append(token)
			pair2 = dict()
			pair2["spectator"] = True
			pair2["game"] = game
			pair2["roundID"] = roundID
			pair2["players"] = tokens
			pair2['gm'] = 9000
			pair2['pm'] = int(address['game_port'])
			status = pmCalls.assignPlay(pair2, address['hostname'], address['cmd_port'])
			log.info(f'{status} from PM')

		recovery[roundID] = {}
		recovery[roundID]['game'] = game
		recovery[roundID]['game_port'] = int(address['game_port'])
		recovery[roundID]['cmd_port'] = int(address['cmd_port'])
		recovery[roundID]['hostname'] = address['hostname']
		recovery[roundID]['players'] = play['players']
		recovery[roundID]['total'] = len(play['players'])
		recovery[roundID]['connected'] = 0

		players.delete_one(query)
		players.insert_one(pair)

		server = {
			'playmaster' : int(address['game_port'])
		}
		log.info(f'recovery2 {recovery}')
	# response = json.dumps(server)
	# response.headers.add("Access-Control-Allow-Origin", "*")
	log.info(server)
	return json.dumps(server), 200

def handler(signum, stack):
	global recovery
	recovery.clear()
	log.info('Cleaning recovery')
	signal.alarm(60)

if __name__ == '__main__':
	api.run(host='0.0.0.0', port=9000) 
	