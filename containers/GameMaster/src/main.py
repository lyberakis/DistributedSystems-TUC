import os
import subprocess
import sys

# os.system('python queue_reader.py &')
# os.system('python score_reader.py &')
p1 = subprocess.Popen(["python", "queue_reader.py"]).pid

p2 = subprocess.Popen(["python", "score_reader.py"]).pid

p3 = subprocess.Popen(["python", "client_listener.py"]).pid

while True:
	pass