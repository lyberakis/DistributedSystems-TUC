from python:3.6.4-slim-jessie
RUN pip install kafka-python
COPY queue_reader.py .
ENTRYPOINT ["python", "queue_reader.py"]