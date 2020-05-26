from kazoo.client import KazooClient
import time
from utils import log_settings
import logging as log
from utils import mongoDrivers as mongo
import json 

def saveToDB(children):
	playmasters = []

	for child in children:
		# Print the version of a node and its data
		data, stat = zk.get("/games/playmaster/"+child)
		mydata = json.loads(data)
		log.info(f"Data: {mydata}")

		element = {
			'game_port' : mydata['game_port'],
			'cmd_port' : mydata['cmd_port']
		}
		log.info(f"element: {element}")
		playmasters.append(element)

	pm.delete_many({})

	data = {
	"list" : playmasters
	}	
	pm.insert_one(data)


def my_listener(state):
	if state == KazooState.LOST:
		print("Zookeeper connection lost!")
	elif state == KazooState.SUSPENDED:
		print("Zookeeper connection has been SUSPENDED!")
	else:
	   print("Zookeeper re-connected!")

myclient = mongo.createClient()
mydb = myclient["resources"]
pm = mydb["playmaster"]

zk = KazooClient(hosts='zookeeper:2181')
zk.start()
zk.add_listener(my_listener)

# Ensure a path, create if necessary
zk.ensure_path("/games/playmaster")


@zk.ChildrenWatch("/games/playmaster")
def watch_children(children):
	# log.info(f'Watch -- Children are now: {children}')
	saveToDB(children)



children = zk.get_children('games/playmaster/')
saveToDB(children)


while True:
	time.sleep(1)
