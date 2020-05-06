from kazoo.client import KazooClient
import time
from utils import log_settings
import logging as log

zk = KazooClient(hosts='zookeeper:2181')
zk.start()

def my_listener(state):
	if state == KazooState.LOST:
		print("Zookeeper connection lost!")
	elif state == KazooState.SUSPENDED:
		print("Zookeeper connection has been SUSPENDED!")
	else:
	   print("Zookeeper re-connected!")

zk.add_listener(my_listener)


# Ensure a path, create if necessary
zk.ensure_path("/games")

# Create a node with data
zk.create("/games/playmaster", None)

playmasters = []
pos = 0

@zk.ChildrenWatch("/games/playmaster")
def watch_children(children):
	# log.info(f'Watch -- Children are now: {children}')
	global playmasters
	playmasters = children.copy();

	# for child in children:
	# 	# Print the version of a node and its data
	# 	data, stat = zk.get("/games/playmaster/"+child)
	# 	print("Version: %s, data: %s" % (stat.version, data.decode("utf-8")))

		
# Above function called immediately, and from then on

# @zk.DataWatch("/my/favorite")
# def watch_node(data, stat):
#     print("Version: %s, data: %s" % (stat.version, data.decode("utf-8")))

def assign():
	if pos >= len(playmasters):
		pos = 0

	seletected = playmasters[pos]

	return pos;

while True:
	time.sleep(1)
	# log.info(f'Children are now: {playmasters}')
	# for child in playmasters:
	# 	# Print the version of a node and its data
	# 	data, stat = zk.get("/games/playmaster/"+child)
	# 	log.info(f'Version {stat.version} data: {data.decode("utf-8")}')

