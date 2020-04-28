from flask import Flask, json
from flask_cors import CORS

server = {"playmaster": 1338} 

api = Flask(__name__)
cors = CORS(api, resources={r"/client/*": {"Access-Control-Allow-Origin": "*"}})

@api.route('/client', methods=['GET'])
def assignPlaymaster():
  return json.dumps(server), 200

if __name__ == '__main__':
    api.run(host='0.0.0.0', port=9000)