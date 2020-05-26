from flask_cors import CORS
from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from utils import log_settings
from utils import playmasterCalls as pmCalls
import logging as log
from utils import mongoDrivers as mongo

app = Flask(__name__)
cors = CORS(app, resources={r"/client/*": {"Access-Control-Allow-Origin": "*"}})
api = Api(app)
myclient = mongo.createClient()
mydb = myclient["games"]
players = mydb["inprogress"]

recovery = {}
class Client(Resource):
    def get(self):

		if roundID in recovery:
			server = {
				'playmaster' : recovery[roundID]['game_port']
			}
		else:
			query = {'roundID':roundID}
			play = players.find(query)

			ports = pmCalls.findPlayMaster(myclient)
			# Assign the game to playmaster
			pair = dict()
			pair["type"] = "active"
			pair["game"] = game
			pair["roundID"] = roundID
			pair["players"] = play['players']
			pair['gm'] = 9000
			pair['pm'] = int(ports['game_port'])
			status = pmCalls.assignPlay(pair, ports['cmd_port'])

			recovery[roundID] = {}
			recovery[roundID]['game_port'] = int(ports['game_port'])
			recovery[roundID]['cmd_port'] = address['cmd_port']

			server = {
				'playmaster' : ports['game_port']
			}

		return json.dumps(server), 200

api.add_resource(Client, '/client')

if __name__ == '__main__':
     app.run(host='0.0.0.0', port='9000', debug=True)
    