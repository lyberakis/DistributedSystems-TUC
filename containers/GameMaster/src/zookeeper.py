from kazoo.client import KazooClient
import time

zk = KazooClient(hosts='localhost:2181')
zk.start()

from kazoo.client import KazooState

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

@zk.ChildrenWatch("/games/playmaster")
def watch_children(children):
	print("Children are now: %s" % children)

	for child in children:
		# Print the version of a node and its data
		data, stat = zk.get("/games/playmaster/"+child)
		print("Version: %s, data: %s" % (stat.version, data.decode("utf-8")))

		
# Above function called immediately, and from then on

# @zk.DataWatch("/my/favorite")
# def watch_node(data, stat):
#     print("Version: %s, data: %s" % (stat.version, data.decode("utf-8")))

while True:
	time.sleep(1)