from utils import kafkaDrivers as kafka
from utils import log_settings
import logging as log
import json
import pymongo

consumer = kafka.createConsumer()

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

def handleScore(consumer):
	for message in consumer:
		record = message.value
		log.info(f'{record} received')

		# check for tournament 
		
		myquery = { "roundID": record['roundID'] }
		prog.delete_one(myquery)

		compl.insert_one(record)

while True:
	handleScore(consumer)
	