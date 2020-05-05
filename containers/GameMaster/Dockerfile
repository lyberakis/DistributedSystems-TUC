from python:3.6.4-slim-jessie
RUN pip install kafka-python
RUN pip install pyyaml
RUN pip install pymongo
RUN pip install flask
RUN pip install flask_cors
RUN pip install flask_restful
RUN pip install requests
RUN pip install kazoo


COPY src .
ENTRYPOINT ["python", "main.py"]
EXPOSE 9000
