from python:3.6.4-slim-jessie

RUN pip install kafka-python
COPY gen.py .
EXPOSE 8080
ENTRYPOINT ["python", "gen.py"]