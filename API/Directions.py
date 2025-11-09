from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import BackEnd.Functions as CallMethod
import BackEnd.GlobalInfo.ResponseMessages as respuestas

app = Flask(__name__)
CORS(app)