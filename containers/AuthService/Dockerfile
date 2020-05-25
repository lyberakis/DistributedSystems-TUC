from python:3.6.4-slim-jessie
RUN pip install flask
RUN pip install flask_cors
RUN pip install flask_restful
RUN pip install requests
RUN pip install pyyaml
RUN pip install mysql-connector
RUN pip install bson


COPY src .
ENTRYPOINT ["python", "auth.py"]
