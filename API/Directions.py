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

@app.route('/user/profile', methods=['PUT'])
def update_user_profile():
    return CallMethod.updateUser()

@app.route('/user/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    return CallMethod.deleteUser(user_id)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Servidor funcionando correctamente"})

# ENDPOINT PRINCIPAL - TODO EN UNO
@app.route('/analyze', methods=['POST'])
def analyze():
    return CallMethod.analyze_complete()

# Solo mantener para consultar el historial
@app.route('/predictions', methods=['GET'])
def get_predictions():
    return CallMethod.getAllPredictions()

@app.route('/predictions/<prediction_id>', methods=['GET'])
def get_prediction(prediction_id):
    return CallMethod.getPredictionById(prediction_id)

@app.route('/predictions/<prediction_id>', methods=['DELETE'])
def delete_prediction(prediction_id):
    return CallMethod.deletePrediction(prediction_id)

@app.route('/citas', methods=['POST'])
def create_appointment_route():
    return CallMethod.createAppointment()

@app.route('/users/<user_id>/citas', methods=['GET'])
def get_citas_by_user(user_id):
    return CallMethod.getCitasByUserId(user_id)

# Ruta para que el DOCTOR vea sus citas
@app.route('/citas/doctor/<doctor_id>', methods=['GET'])
def get_citas_doctor_route(doctor_id):
    return CallMethod.getCitasByDoctorId(doctor_id)

# Ruta para cambiar el estado (Confirmar/Rechazar)
@app.route('/citas/<cita_id>/status', methods=['PUT'])
def update_cita_status_route(cita_id):
    return CallMethod.updateAppointmentStatus(cita_id)



if __name__ == '__main__':
    print("Iniciando servidor Flask...")
    app.run(port=3000, debug=True)