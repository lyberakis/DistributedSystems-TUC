from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from json import dumps
from utils import mongoDrivers as mongo
from utils import log_settings
import logging as log

app = Flask(__name__)
api = Api(app)

myclient = mongo.createClient()
mydb = myclient["games"]
pr = mydb["inprogress"]


class Tournament(Resource):
    # get pending tournaments
    def get(self):
        request.get_json(force=True)
        args = parser.parse_args()
        token = str(args['token'])
        game = str(args['game'])
        return jsonify(u=un, p=pw)
    
    # create a new tournament
    def post(self):
        request.get_json(force=True)
        args = parser.parse_args()
        token = str(args['token'])
        game = str(args['game'])
        return jsonify(u=un, p=pw)

# class Score(Resource):
#     def get(self):
        
#         query = conn.execute("select * from employees") # This line performs query and returns json result
#         return {'employees': [i[0] for i in query.cursor.fetchall()]} # Fetches first column that is Employee ID


api.add_resource(Tournament, '/tournament') # Route_1
# api.add_resource(Tracks, '/tracks') # Route_2
# api.add_resource(Employees_Name, '/employees/<employee_id>') # Route_3

# fro later ==> https://help.pythonanywhere.com/pages/Flask/
if __name__ == '__main__':
     app.run(port='5002')
     