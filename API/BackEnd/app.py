# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import jwt
import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'virtualmed_secret_key_2024'
CORS(app)

# Base de datos simulada
users_db = {
    'paciente@virtualmed.com': {
        'password': '123456',
        'rol': 'paciente',
        'nombre': 'Ana García López',
        'id': 'P001',
        'telefono': '+1234567890',
        'fecha_nacimiento': '1990-05-15'
    },
    'medico@virtualmed.com': {
        'password': '123456', 
        'rol': 'medico',
        'nombre': 'Dr. Carlos Rodríguez',
        'especialidad': 'Cardiología',
        'id': 'M001',
        'colegiado': 'CM12345',
        'telefono': '+0987654321'
    }
}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token es requerido'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users_db.get(data['email'])
        except Exception as e:
            return jsonify({'error': 'Token inválido'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        user = users_db.get(email)
        
        if user and user['password'] == password:
            # Generar token JWT
            token = jwt.encode({
                'email': email,
                'rol': user['rol'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm="HS256")
            
            user_response = {
                'email': email,
                'nombre': user['nombre'],
                'rol': user['rol'],
                'id': user['id']
            }
            
            # Agregar campos específicos según el rol
            if user['rol'] == 'medico':
                user_response['especialidad'] = user['especialidad']
            else:
                user_response['telefono'] = user['telefono']
            
            return jsonify({
                'success': True,
                'token': token,
                'user': user_response
            })
        
        return jsonify({
            'success': False,
            'error': 'Credenciales inválidas'
        }), 401
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500

@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        'success': True,
        'user': current_user
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)