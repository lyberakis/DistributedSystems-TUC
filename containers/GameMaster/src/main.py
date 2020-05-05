import os
import subprocess
import sys

p0 = subprocess.Popen(["python", "api.py"]).pid
p1 = subprocess.Popen(["python", "queue_reader.py"]).pid
p2 = subprocess.Popen(["python", "score_reader.py"]).pid
p3 = subprocess.Popen(["python", "client_listener.py"]).pid
p4 = subprocess.Popen(["python", "zookeeper.py"]).pid

while True:
	pass