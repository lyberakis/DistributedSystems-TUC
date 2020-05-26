from flask import Flask, json
from flask_cors import CORS
from utils import log_settings
from utils import playmasterCalls as pmCalls
import logging as log

api = Flask(__name__)
cors = CORS(api, resources={r"/client/*": {"Access-Control-Allow-Origin": "*"}})

@api.route('/client', methods=['GET'])
def recover():
	ports = pmCalls.findPlayMaster(myclient)
	status = pmCalls.assignPlay(pair, ports['cmd_port'])
	log.info(f'{status} from PM')
	
	return json.dumps(server), 200

if __name__ == '__main__':
    api.run(host='0.0.0.0', port=9000)