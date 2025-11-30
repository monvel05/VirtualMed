from flask import Flask, jsonify, request
from flask_cors import CORS
import BackEnd.Functions as CallMethod

app = Flask(__name__)
CORS(app)


@app.route('/users', methods=['GET'])
def get_users():
    return CallMethod.getAllUsers()

@app.route('/user', methods=['POST'])
def create_user():
    return CallMethod.addUser()

@app.route('/login', methods=['POST'])
def login():
    return CallMethod.loginUser()

@app.route('/user/<user_id>', methods=['GET'])
def get_user_by_id(user_id):
    return CallMethod.getUserById(user_id)

@app.route('/users/role/<role>', methods=['GET'])
def get_users_by_role(role):
    return CallMethod.getUsersByRole(role)

@app.route('/user/<user_id>', methods=['PUT'])
def update_user(user_id):
    return CallMethod.updateUser(user_id)

@app.route('/user/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    return CallMethod.deleteUser(user_id)


@app.route('/citas', methods=['POST'])
def create_cita():
    return CallMethod.createCita()


@app.route('/users/<user_id>/citas', methods=['GET'])
def get_citas_by_user(user_id):
    return CallMethod.getCitasByUser(user_id)


@app.route('/citas/<cita_id>/status', methods=['PUT'])
def update_cita_status(cita_id):
    return CallMethod.updateCitaStatus(cita_id)


# ==================== INICIO DEL SERVIDOR ====================

if __name__ == '__main__':
    print("Iniciando servidor Flask...")
    app.run(port=3000, debug=True)