import pymongo
from utils import log_settings
import logging as log


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

dblist = myclient.list_database_names()

for y in dblist:
	log.info(y)
log.info('hello')

mydb = myclient["games"]
pr = mydb["practice"]
tr = mydb["tournament"]

practice = { "game": "chess", "winner": "id", "loser": "id", "tie": False }
tournament = { "game": "chess", "tournament_id" : "id", "winner": "player1", "loser": "player2" }

x = pr.insert_one(practice)

for i in pr.find():
	log.info(i)



