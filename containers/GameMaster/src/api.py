from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from json import dumps
from utils import mongoDrivers as mongo
from utils import log_settings
import logging as log
import uuid
import json
from bson.json_util import dumps,loads
from bson import ObjectId


app = Flask(__name__)
api = Api(app)

myclient = mongo.createClient()
mydb = myclient["games"]
prog = mydb["inprogress"]
compl = mydb["completed"]

mydb2 = myclient["tournaments"]
tr = mydb2["pending"]#game--id--pop--name
pltr = mydb2["players"]#token--id

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

class Tournament(Resource):
    # get pending tournaments
    def get(self):
        args = request.args
        game = str(args['game'])
        i=0
        tournaments = []
        for x in tr.find():
            if x['game']==game:
                tournaments.append(x)

        connected = []
        for z in tournaments:
            connected.append(0)
            for y in pltr.find():
                if y['id']==z['id']:
                    connected[i]=connected[i]+1
            i+=1
        
        i=0
        for x in tournaments:
            x['connected']=connected[i]
            i+=1
        jsonTournaments=JSONEncoder().encode(tournaments)
        return jsonTournaments, 200#for each Tournament name--id--pop--connected

    def delete(self):
        x=pltr.delete_many({})
        if x:
            return '', 201
        else:
            return '', 400
    
    # create a new tournament
    def post(self):
        args = request.get_json(force=True)
        tourName = str(args['name'])
        players = args['players']
        game = str(args['game'])
        tournament = uuid.uuid4().hex
        query = { "game": game, "id" : tournament, "pop": players, "name": tourName}
        if tr.insert_one(query):
            return '', 201
        else:
            return '', 400

class Games(Resource):
    def get(self):
        args = request.args
        token = str(args['token'])
        i=0
        games = []
        for x in compl.find():
            if token==x["players"][0] or token==x["players"][1]:
                games.append(x)

        jsonGames=JSONEncoder().encode(games)
        return jsonGames, 200

class Spectator(Resource):
    def get(self):
        args = request.args
        query = {'game' : str(args['game'])}
        games = dumps(prog.find(query))

        return loads(dumps(games)), 200

# class Score(Resource):
#     def get(self):
        
#         query = conn.execute("select * from employees") # This line performs query and returns json result
#         return {'employees': [i[0] for i in query.cursor.fetchall()]} # Fetches first column that is Employee ID


api.add_resource(Tournament, '/tournament') # Route_1
api.add_resource(Games, '/games') # Route_2
api.add_resource(Spectator, '/spectator') # Route_3
# api.add_resource(Tracks, '/tracks') # Route_2
# api.add_resource(Employees_Name, '/employees/<employee_id>') # Route_3

# fro later ==> https://help.pythonanywhere.com/pages/Flask/
if __name__ == '__main__':
     app.run(host='0.0.0.0', port='5002', debug=True)
     