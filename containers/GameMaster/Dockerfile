from python:3.6.4-slim-jessie
RUN pip install kafka-python
RUN pip install pyyaml

COPY src .
ENTRYPOINT ["python", "queue_reader.py"]

