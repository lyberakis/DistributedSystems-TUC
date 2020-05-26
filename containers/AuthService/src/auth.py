from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from json import dumps
from utils import log_settings
import logging as log
import uuid
import json
from bson import ObjectId
import mysql.connector
import hashlib, binascii, os
from datetime import date

app = Flask(__name__)
api = Api(app)

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

class Validation(Resource):
    def post(self):
        args = request.get_json(force=True)
        username = str(args['username'])
        password = str(args['password'])
        token=uuid.uuid4().hex;

        mydb = mysql.connector.connect(
            host="mysql",
            user="root",
            passwd="rootpassword",
            database="auth"
        )
        query=mydb.cursor()
        sql="SELECT password FROM users WHERE username = %s"
        val=(username, )
        query.execute(sql, val)
        result=query.fetchone()

        stored_password=result[0]
        salt = stored_password[:64]#code from https://www.vitoshacademy.com/hashing-passwords-in-python/
        stored_password = stored_password[64:]
        pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt.encode('ascii'), 100000)
        pwdhash = binascii.hexlify(pwdhash).decode('ascii')
        match = pwdhash == stored_password

        query.close()
        if match:
            creation=date.today()

            query2=mydb.cursor()
            sql="INSERT INTO tokens VALUES (%s, %s, %s);"
            val=(username, token, creation)
            query2.execute(sql, val)
            mydb.commit()

            token = JSONEncoder().encode(token)
        else:
            return 'Password does not match', 400

        if query2.rowcount:
            query2.close()
            return token, 201
        else:
            query2.close()
            return '', 400

    def get(self):
        args = request.args
        username = str(args['username'])
        token = str(args['token'])

        mydb = mysql.connector.connect(
            host="mysql",
            user="root",
            passwd="rootpassword",
            database="auth"
        )
        query=mydb.cursor()
        sql="SELECT * FROM tokens WHERE username = %s AND token = %s"
        val=(username, token, )
        query.execute(sql, val)

        if query.rowcount:
            query.close
            return '', 201
        else:
            return '', 400

class Users(Resource):
    def post(self):
        args = request.get_json(force=True)
        username = str(args['username'])
        password = str(args['password'])
        email = str(args['email'])
        role = str(args['role'])
        
        mydb = mysql.connector.connect(
            host="mysql",
            user="root",
            passwd="rootpassword",
            database="auth"
        )
        salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')#code from https://www.vitoshacademy.com/hashing-passwords-in-python/
        pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt, 100000)
        pwdhash = binascii.hexlify(pwdhash)
        hashedPassword = (salt + pwdhash).decode('ascii')

        query=mydb.cursor()
        sql="INSERT INTO users VALUES (%s, %s, %s, %s);"
        val=(username, hashedPassword, email, role)
        query.execute(sql, val)
        mydb.commit()

        if query.rowcount:
            query.close()
            return '', 201
        else:
            query.close()
            return '', 400

    def get(self):
        mydb = mysql.connector.connect(
            host="mysql",
            user="root",
            passwd="rootpassword",
            database="auth"
        )
        query=mydb.cursor()
        query.execute("SELECT username, email, role FROM users")
        result=query.fetchall()
        query.close()

        if result:
            result=JSONEncoder().encode(result)
            return result, 201
        else:
            return '', 400

    def put(self):
        args = request.args
        username = str(args['username'])
        email = str(args['email'])
        role = str(args['role'])

        mydb = mysql.connector.connect(
            host="mysql",
            user="root",
            passwd="rootpassword",
            database="auth"
        )
        query=mydb.cursor()
        sql="UPDATE users SET email=%s, role=%s WHERE username=%s);"
        val=(email, role, username)
        query.execute(sql, val)
        mydb.commit()

        if query.rowcount:
            query.close()
            return '', 201
        else:
            query.close()
            return '', 400


api.add_resource(Validation, '/validation') # Route_1
api.add_resource(Users, '/users') # Route_2

if __name__ == '__main__':
     app.run(host='0.0.0.0', port='5010', debug=True)