from python:3.6.4-slim-jessie
RUN pip install kafka-python
RUN pip install pyyaml
RUN pip install pymongo
RUN pip install flask
RUN pip install flask_cors
RUN pip install requests


COPY src .
ENTRYPOINT ["python", "main.py"]
# ENTRYPOINT ["python", "db_update.py"]
# ENTRYPOINT ["python", "client_listener.py"]
# ENTRYPOINT ["python", "score_reader.py"]
EXPOSE 9000
