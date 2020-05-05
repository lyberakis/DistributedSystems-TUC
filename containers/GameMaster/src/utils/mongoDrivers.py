import json
import pymongo
from utils import log_settings
import logging as log


def createClient():
	myclient = None
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

	return myclient