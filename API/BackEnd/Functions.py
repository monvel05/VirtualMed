from flask import jsonify, request
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from datetime import datetime
import traceback # Importante para ver errores detallados
import BackEnd.GlobalInfo.ResponseMessages as respuestas
import BackEnd.GlobalInfo.Keys as Colabskey
from bson import ObjectId
import json
import tensorflow as tf
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import io
import os
import base64

# ========== CIFRADO SIMPLE Y FUNCIONAL ==========
from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Obtener clave del .env
clave_env = os.getenv('ENCRYPTION_KEY')

# Generar clave temporal si no existe (para evitar crash en desarrollo)
if not clave_env:
    CLAVE_FUNCIONAL = Fernet.generate_key()
    print("⚠️ No se encontró ENCRYPTION_KEY en .env, usando clave temporal.")
else:
    CLAVE_FUNCIONAL = clave_env.encode()
    print("✅ Sistema de cifrado inicializado desde .env")

# Inicialización DIRECTA sin lógica compleja
fernet = Fernet(CLAVE_FUNCIONAL)

def cifrar_url_imagen(url: str) -> str:
    """Cifra la URL de la imagen para almacenamiento seguro"""
    try:
        # print(f"🔐 Cifrando URL...") 
        url_cifrada = fernet.encrypt(url.encode())
        url_cifrada_b64 = base64.urlsafe_b64encode(url_cifrada).decode()
        return url_cifrada_b64
    except Exception as e:
        print(f"⚠️ Error cifrando URL: {e}")
        return url

def descifrar_url_imagen(url_cifrada: str) -> str:
    """Descifra la URL de la imagen para uso"""
    try:
        if len(url_cifrada) > 200:
            url_cifrada_bytes = base64.urlsafe_b64decode(url_cifrada.encode())
            url_descifrada = fernet.decrypt(url_cifrada_bytes).decode()
            return url_descifrada
        return url_cifrada
    except Exception as e:
        print(f"⚠️ Error descifrando URL: {e}")
        return url_cifrada


# ==================== CONEXIÓN A BASE DE DATOS ====================

def get_db_connection():
    if Colabskey.dbconn is None:
        try:
            print("🔌 [DB] Intentando conectar a MongoDB...")
            client = MongoClient(
                Colabskey.MONGODB_URI,
                serverSelectionTimeoutMS=10000,
                connectTimeoutMS=10000,
                socketTimeoutMS=10000,
                retryWrites=True,
                w='majority'
            )
            print("✅ [DB] Conexión exitosa!")
            Colabskey.dbconn = client[Colabskey.DB_NAME]
            return Colabskey.dbconn
            
        except Exception as e:
            print(f"❌ [DB] Error crítico de conexión: {e}")
            raise e
    
    return Colabskey.dbconn

# ==================== FUNCIONES DE USUARIOS ====================

def getAllUsers():
    try:
        print("🔍 Iniciando getAllUsers...")
        db = get_db_connection()
        
        arrFinalUsers = []
        collections_to_check = ["users", "doctors", "patients"]
        
        for collection_name in collections_to_check:
            collection = db[collection_name]
            listUsers = list(collection.find({}))
            
            if len(listUsers) > 0:
                for objUser in listUsers:
                    objFormateado = {
                        "id": str(objUser["_id"]),
                        "email": objUser.get("email", ""),
                        "role": objUser.get("role", "No especificado"),
                        "nombre": objUser.get("nombre", ""),
                        "apellidos": objUser.get("apellidos", ""),
                        "collection": collection_name
                    }
                    arrFinalUsers.append(objFormateado)
        
        print(f"📊 Total de usuarios encontrados: {len(arrFinalUsers)}")
        
        objResponse = respuestas.succ200.copy()
        objResponse["arrUsers"] = arrFinalUsers
        return jsonify(objResponse)
        
    except Exception as e:
        print(f"💥 ERROR en getAllUsers: {str(e)}")
        return jsonify({"error": str(e)}), 500

def addUser():
    try:
        print("🔍 [REGISTRO] Iniciando addUser...")
        data = request.get_json()
        
        # 1. Validaciones básicas
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"intStatus": 400, "Error": "Faltan datos requeridos"}), 400
        
        db = get_db_connection()
        email = data['email']
        
        # 2. Verificar duplicados
        if (db["users"].find_one({"email": email}) or 
            db["doctors"].find_one({"email": email}) or 
            db["patients"].find_one({"email": email})):
            return jsonify({"intStatus": 409, "Error": "El usuario ya existe"}), 409
        
        # 3. Determinar Rol y Colección
        role_raw = data.get('role', 'patient')
        role = str(role_raw).lower().strip()
        
        collection_name = "users"
        if role in ['medico', 'doctor']:
            collection_name = "doctors"
            role = "doctor"
        elif role in ['paciente', 'patient']:
            collection_name = "patients"
            role = "paciente"
            
        # 4. Crear Usuario Básico
        user_basic_data = {
            "email": email,
            "password": data['password'],
            "role": role,
            "fechaRegistro": datetime.now()
        }
        user_result = db["users"].insert_one(user_basic_data)
        user_id = user_result.inserted_id
        
        # 5. Crear Perfil Específico
        base_profile = {
            "email": email,
            "password": data['password'],
            "role": role,
            "nombre": data.get('nombre', ''),
            "apellidos": data.get('apellidos', ''),
            "edad": data.get('edad', ''),
            "fechaNacimiento": data.get('fechaNacimiento', ''),
            "genero": data.get('genero', ''),
            "profileImage": data.get('profileImage', ''),
            "fechaRegistro": datetime.now(),
            "userId": user_id
        }
        
        final_profile = base_profile.copy()
        
        if collection_name == "doctors":
            final_profile.update({
                "cedula": data.get('cedula', ''),
                "especialidad": data.get('especialidad', ''),
                "subespecialidad": data.get('subespecialidad', ''),
                "estado": "activo",
                "verificado": False
            })
        elif collection_name == "patients":
            final_profile.update({
                "peso": data.get('peso', ''),
                "altura": data.get('altura', '')
            })
            
        db[collection_name].insert_one(final_profile)
        
        return jsonify({
            "intStatus": 200,
            "strAnswer": "Usuario creado exitosamente",
            "userId": str(user_id)
        })
        
    except Exception as e:
        print(f"💥💥 [REGISTRO] ERROR: {str(e)}")
        traceback.print_exc()
        return jsonify({"intStatus": 500, "Error": str(e)}), 500

def loginUser():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"intStatus": 400, "Error": "Faltan credenciales"}), 400
        
        db = get_db_connection()
        email = data['email']
        password = data['password']
        
        user_basic = db["users"].find_one({"email": email})
        
        if not user_basic:
            return jsonify({"intStatus": 404, "Error": "Usuario no encontrado"}), 404
            
        if user_basic['password'] != password:
            return jsonify({"intStatus": 401, "Error": "Contraseña incorrecta"}), 401
            
        role = user_basic.get('role', 'patient')
        user_profile = None
        collection_name = "users"
        
        if role in ['medico', 'doctor']:
            user_profile = db["doctors"].find_one({"email": email})
            collection_name = "doctors"
        elif role in ['paciente', 'patient']:
            user_profile = db["patients"].find_one({"email": email})
            collection_name = "patients"
            
        user_response = {
            "id": str(user_basic["_id"]),
            "email": email,
            "role": role,
            "collection": collection_name
        }
        
        if user_profile:
            user_response["nombre"] = user_profile.get("nombre", "")
            user_response["apellidos"] = user_profile.get("apellidos", "")
            user_response["profileId"] = str(user_profile["_id"])
        else:
            user_response["nombre"] = user_basic.get("nombre", "")
            user_response["apellidos"] = user_basic.get("apellidos", "")

        return jsonify({
            "intStatus": 200,
            "strAnswer": "Login exitoso",
            "user": user_response
        })
            
    except Exception as e:
        print(f"💥 [LOGIN] Error: {str(e)}")
        return jsonify({"intStatus": 500, "Error": str(e)}), 500

def getUserById(user_id):
    try:
        from bson import ObjectId
        db = get_db_connection()
        
        user_basic = db["users"].find_one({"_id": ObjectId(user_id)})
        
        if not user_basic:
            return jsonify({"user": None})
            
        role = user_basic.get('role', 'patient')
        user_profile = None
        
        if role in ['medico', 'doctor']:
            user_profile = db["doctors"].find_one({"userId": ObjectId(user_id)})
        elif role in ['paciente', 'patient']:
            user_profile = db["patients"].find_one({"userId": ObjectId(user_id)})
            
        # 1. Crear Objeto Base y Mapear 'email' -> 'correo'
        user_combined = {
            "id": str(user_basic["_id"]),
            "correo": user_basic["email"],
            "role": role,
            "nombre": user_basic.get("nombre", ""),
            "apellido": user_basic.get("apellidos", "")
        }
        
        if user_profile:
            # 2. Actualizar con datos del perfil y Mapear nombres
            user_combined.update({
                "nombre": user_profile.get("nombre", ""),
                "apellido": user_profile.get("apellidos", ""), 
                "profileId": str(user_profile["_id"]),
                "profileImage": user_profile.get("profileImage", ""),
                "edad": user_profile.get("edad", 0),
                "genero": user_profile.get("genero", ""),
                "pdfUrl": user_profile.get("pdfUrl", ""),
                "nacimiento": user_profile.get("fechaNacimiento", "")
            })

            # 3. AGREGAR PESO Y ALTURA
            if role in ['paciente', 'patient']:
                user_combined["peso"] = user_profile.get("peso", 0)
                user_combined["altura"] = user_profile.get("altura", 0)

            # Datos extra Doctor
            if role in ['medico', 'doctor']:
                user_combined["cedula"] = user_profile.get("cedula", "")
                user_combined["especialidad"] = user_profile.get("especialidad", "")
            
        return jsonify({"intStatus": 200, "user": user_combined})
        
    except Exception as e:
        print(f"💥 Error getUserById: {e}")
        return jsonify({"intStatus": 500, "Error": str(e)}), 500
    
def getUsersByRole(role):
    try:
        db = get_db_connection()
        arrFinalUsers = []
        collection = db["users"] 
        
        if role in ['medico', 'doctor']:
            collection = db["doctors"]
        elif role in ['paciente', 'patient']:
            collection = db["patients"]
            
        listUsers = list(collection.find({}))
        
        for objUser in listUsers:
            arrFinalUsers.append({
                "id": str(objUser.get("userId", objUser["_id"])),
                "email": objUser.get("email", ""),
                "nombre": objUser.get("nombre", ""),
                "apellidos": objUser.get("apellidos", ""),
                "role": objUser.get("role", role),
                # 🔥 AGREGA ESTA LÍNEA AQUÍ ABAJO:
                "especialidad": objUser.get("especialidad", "Médico General") 
            })
            
        return jsonify({"intStatus": 200, "arrUsers": arrFinalUsers})
    except Exception as e:
        return jsonify({"intStatus": 500, "Error": str(e)}), 500
    
# ==================== 🔥 FUNCIÓN UPDATEUSER BLINDADA 🔥 ====================
def updateUser(user_id=None):
    try:
        from bson import ObjectId
        from bson.errors import InvalidId # Importante para validar
        
        data = request.get_json()
        if not data: 
            return jsonify({"intStatus": 400, "Error": "Sin datos recibidos"}), 400
        
        db = get_db_connection()

        # 1. OBTENER Y VALIDAR ID DEL USUARIO
        target_id = user_id

        # 🛡️ VALIDACIÓN EXTRA: Si el ID que llega por URL no es válido (ej: dice "profile"), lo ignoramos
        if target_id and not ObjectId.is_valid(target_id):
            print(f"⚠️ El ID recibido en URL '{target_id}' no es válido. Buscando en el JSON...")
            target_id = None 

        # Si no tenemos ID válido de la URL, lo sacamos del JSON (Frontend)
        if not target_id:
            target_id = data.get('userId') or data.get('id')
            
        if not target_id or not ObjectId.is_valid(target_id):
            print("❌ Error: No se encontró un userId válido ni en URL ni en JSON")
            return jsonify({"intStatus": 400, "Error": "Falta el ID válido del usuario"}), 400

        print(f"🔄 Actualizando usuario ID: {target_id}")

        # 2. LIMPIEZA DE DATOS
        datos_limpios = data.copy()
        if 'userId' in datos_limpios: del datos_limpios['userId']
        if '_id' in datos_limpios: del datos_limpios['_id']
        if 'id' in datos_limpios: del datos_limpios['id']

        # Mapeo: 'correo' -> 'email'
        if 'correo' in datos_limpios:
            datos_limpios['email'] = datos_limpios['correo']
            del datos_limpios['correo']

        # 3. ACTUALIZAR USUARIO BÁSICO
        basic_fields = ['email', 'password', 'role']
        update_basic = {k: v for k, v in datos_limpios.items() if k in basic_fields}
        
        if update_basic:
            db["users"].update_one({"_id": ObjectId(target_id)}, {"$set": update_basic})

        # 4. ACTUALIZAR PERFIL ESPECÍFICO
        user_basic = db["users"].find_one({"_id": ObjectId(target_id)})
        
        if user_basic:
            role = user_basic.get('role', '')
            collection_name = None
            
            if role in ['medico', 'doctor']: collection_name = "doctors"
            elif role in ['paciente', 'patient']: collection_name = "patients"
            
            if collection_name:
                # Excluimos password y role del perfil visual
                campos_a_excluir = ['password', 'role']
                update_profile = {k: v for k, v in datos_limpios.items() if k not in campos_a_excluir}
                
                # Conversión numérica segura
                if collection_name == "patients":
                    if 'peso' in update_profile and update_profile['peso']:
                        try: update_profile['peso'] = float(update_profile['peso'])
                        except: pass
                    if 'altura' in update_profile and update_profile['altura']:
                        try: update_profile['altura'] = float(update_profile['altura'])
                        except: pass

                if update_profile:
                    db[collection_name].update_one({"userId": ObjectId(target_id)}, {"$set": update_profile})

        return jsonify({"intStatus": 200, "strAnswer": "Actualizado correctamente"})
        
    except Exception as e:
        print(f"💥💥 ERROR CRÍTICO EN UPDATEUSER: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"intStatus": 500, "Error": f"Error interno: {str(e)}"}), 500
    
def deleteUser(user_id):
    try:
        from bson import ObjectId
        db = get_db_connection()
        
        db["doctors"].delete_one({"userId": ObjectId(user_id)})
        db["patients"].delete_one({"userId": ObjectId(user_id)})
        result = db["users"].delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count > 0:
            return jsonify({"intStatus": 200, "strAnswer": "Eliminado"})
        else:
            return jsonify({"intStatus": 404, "strAnswer": "No encontrado"}), 404
            
    except Exception as e:
        return jsonify({"intStatus": 500, "Error": str(e)}), 500

    

# ========== FUNCIONES DE PREDICCIÓN CON CIFRADO ==========

def analyze_complete():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No se envió ninguna imagen para el modelo"}), 400

        cloudinary_url = request.form.get('image_url', '')
        patient_name = request.form.get('patient_name', '')
        patient_age = request.form.get('patient_age', '')
        patient_id = request.form.get('patient_id', '')
        breast_side = request.form.get('breast_side', '')
        clinical_notes = request.form.get('clinical_notes', '')
        
        file = request.files["image"]
        
        # 1. PROCESAR CON MODELO
        print("🔮 Iniciando evaluación de imagen...")
        current_file = os.path.abspath(__file__)
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(current_file)))
        MODEL_PATH = os.path.join(BASE_DIR, "models", "model_vgg16_final.keras")
        
        if not os.path.exists(MODEL_PATH):
            return jsonify({"error": "Modelo no encontrado"}), 500
        
        try:
            model = load_model(MODEL_PATH)
            img = Image.open(io.BytesIO(file.read())).convert("RGB")
            img = img.resize((227, 227))
            img_array = np.array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            prediction = model.predict(img_array)
        except Exception as e:
            print(f"❌ Error en modelo: {e}")
            return jsonify({"error": str(e)}), 500

        malignant_probability = float(prediction[0][0])

        if malignant_probability > 0.5:
            classification = "Maligno"
            confidence_percent = malignant_probability * 100
        else:
            classification = "Benigno"
            confidence_percent = (1 - malignant_probability) * 100

        # 2. GUARDAR EN MONGODB
        try:
            db = get_db_connection()
            url_cifrada = cifrar_url_imagen(cloudinary_url)
            
            prediction_doc = {
                'image_url': url_cifrada,
                'patient_name': patient_name,
                'patient_age': int(patient_age) if patient_age and patient_age.isdigit() else 0,
                'patient_id': patient_id,
                'breast_side': breast_side,
                'clinical_notes': clinical_notes,
                'classification': classification,
                'confidence': confidence_percent,
                'analysis_date': datetime.utcnow().isoformat(),
                'created_at': datetime.utcnow()
            }
            
            result = db.prediction.insert_one(prediction_doc)
            prediction_id = str(result.inserted_id)
            
        except Exception as e:
            print(f"❌ Error DB: {e}")
            return jsonify({"error": str(e)}), 500

        return jsonify({
            "success": True,
            "prediction_id": prediction_id,
            "classification": classification,
            "confidence": float(malignant_probability),
            "confidence_percent": float(confidence_percent),
            "data": {
                "patient_name": patient_name
            }
        })

    except Exception as e:
        print(f"💥 Error analyze_complete: {e}")
        return jsonify({"error": str(e)}), 500

def getAllPredictions():
    try:
        db = get_db_connection()
        predictions = list(db.prediction.find().sort('created_at', -1))
        
        for prediction in predictions:
            prediction['_id'] = str(prediction['_id'])
            prediction['image_url'] = descifrar_url_imagen(prediction['image_url'])
        
        return jsonify(predictions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def getPredictionById(prediction_id):
    try:
        db = get_db_connection()
        prediction = db.prediction.find_one({'_id': ObjectId(prediction_id)})
        
        if not prediction: return jsonify({'error': 'No encontrada'}), 404
        
        prediction['_id'] = str(prediction['_id'])
        prediction['image_url'] = descifrar_url_imagen(prediction['image_url'])
        
        return jsonify(prediction)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def deletePrediction(prediction_id):
    try:
        db = get_db_connection()
        result = db.prediction.delete_one({'_id': ObjectId(prediction_id)})
        
        if result.deleted_count == 0: return jsonify({'error': 'No encontrada'}), 404
        
        return jsonify({'message': 'Eliminada exitosamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
def createAppointment():
    try:
        print("📅 [CITAS] Iniciando creación de cita...")
        data = request.get_json()
        
        if not data:
            return jsonify({"intStatus": 400, "message": "No se recibieron datos"}), 400

        db = get_db_connection()
        
        # Validar campos críticos
        if 'medicoId' not in data or 'pacienteId' not in data:
             return jsonify({"intStatus": 400, "message": "Faltan IDs de médico o paciente"}), 400

        # Preparar objeto para MongoDB
        # Nota: Guardamos los IDs como strings para referencia fácil, 
        # o puedes usar ObjectId(data['medicoId']) si prefieres referencias estrictas.
        nueva_cita = {
            "pacienteId": data.get('pacienteId'),
            "medicoId": data.get('medicoId'),
            "nombrePaciente": data.get('nombreCita'),
            "apellidoPaciente": data.get('apellidoCita'),
            "edadPaciente": data.get('edadCita'),
            "correoPaciente": data.get('correoCita'),
            "tipoCita": data.get('tipoCita'),
            "fechaHoraIso": data.get('fechahoraCita'), # Formato ISO del datetime picker
            "fecha": data.get('fecha'), # YYYY-MM-DD
            "hora": data.get('hora'),   # HH:MM:SS
            "estado": "pendiente",      # Estado inicial
            "fechaCreacion": datetime.now()
        }

        # Guardar en colección 'appointments'
        result = db.appointments.insert_one(nueva_cita)
        
        print(f"✅ [CITAS] Cita guardada con ID: {result.inserted_id}")

        return jsonify({
            "intStatus": 200,
            "success": True,
            "message": "Cita agendada correctamente",
            "citaId": str(result.inserted_id)
        })

    except Exception as e:
        print(f"❌ [CITAS] Error al crear cita: {e}")
        return jsonify({"intStatus": 500, "message": str(e)}), 500

# ==================== 🔥 OBTENER CITAS POR USUARIO 🔥 ====================
def getCitasByUserId(user_id):
    try:
        print(f"🔎 Buscando citas para el usuario: {user_id}")
        db = get_db_connection()
        
        # 1. Buscar en la colección de citas donde el pacienteId coincida
        # Nota: Asegúrate de que en createAppointment guardaste el ID como string.
        lista_citas = list(db.appointments.find({"pacienteId": user_id}))
        
        arrCitas = []
        
        for cita in lista_citas:
            # 2. Buscar información del Doctor para mostrar nombre y especialidad
            doctor_info = {"nombre": "No asignado", "apellidos": "", "especialidad": "General"}
            
            if "medicoId" in cita:
                try:
                    # Buscamos en la colección de doctores
                    doc = db.doctors.find_one({"id": cita["medicoId"]}) # Si guardaste el ID del front
                    if not doc:
                        doc = db.doctors.find_one({"userId": ObjectId(cita["medicoId"])}) # Si guardaste el ObjectId
                    if not doc:
                        # Intento final buscandolo como _id string
                         doc = db.doctors.find_one({"_id": ObjectId(cita["medicoId"])})

                    if doc:
                        doctor_info["nombre"] = doc.get("nombre", "")
                        doctor_info["apellidos"] = doc.get("apellidos", "")
                        doctor_info["especialidad"] = doc.get("especialidad", "General")
                except:
                    pass # Si falla la búsqueda del doctor, dejamos los datos por defecto

            # 3. Formatear el objeto para el Frontend
            cita_fmt = {
                "id": str(cita["_id"]),
                "tipoCita": cita.get("tipoCita", "Consulta"),
                "fechahoraCita": cita.get("fechaHoraIso") or f"{cita.get('fecha')}T{cita.get('hora')}",
                "estatus": cita.get("estado", "Pendiente"), # 'estado' en BD -> 'estatus' en Front
                "nombreDoctor": f"{doctor_info['nombre']} {doctor_info['apellidos']}",
                "especialidad": doctor_info["especialidad"],
                "motivo": cita.get("motivo", ""),
                "notas": cita.get("notas", "")
            }
            arrCitas.append(cita_fmt)

        print(f"✅ Se encontraron {len(arrCitas)} citas.")
        
        return jsonify({
            "intStatus": 200,
            "arrCitas": arrCitas
        })

    except Exception as e:
        print(f"❌ Error obteniendo citas: {e}")
        return jsonify({"intStatus": 500, "Error": str(e)}), 500
    
def getCitasByDoctorId(doctor_id):
    try:
        print(f"👨‍⚕️ Buscando agenda para el doctor ID: {doctor_id}")
        db = get_db_connection()
        
        # 1. Buscar todas las citas donde el medicoId coincida
        # Nota: Buscamos como string porque así lo guardamos en createAppointment
        lista_citas = list(db.appointments.find({"medicoId": doctor_id}))
        
        arrCitas = []
        
        for cita in lista_citas:
            # 2. Obtener nombre del PACIENTE
            # Primero intentamos sacar el nombre guardado en la cita (snapshot)
            paciente_nombre = f"{cita.get('nombrePaciente', '')} {cita.get('apellidoPaciente', '')}".strip()
            paciente_edad = cita.get('edadPaciente', 0)
            
            # Si por alguna razón no está en la cita, buscamos en la colección de usuarios
            if not paciente_nombre and "pacienteId" in cita:
                try:
                    from bson import ObjectId
                    paciente = db.users.find_one({"_id": ObjectId(cita["pacienteId"])})
                    if not paciente:
                        # Intento en collection patients
                        paciente = db.patients.find_one({"userId": ObjectId(cita["pacienteId"])})
                    
                    if paciente:
                        paciente_nombre = f"{paciente.get('nombre', '')} {paciente.get('apellidos', '')}"
                        paciente_edad = paciente.get('edad', 0)
                except:
                    pass # Si falla, se queda con "Sin nombre"

            # 3. Formatear para el Frontend
            cita_fmt = {
                "id": str(cita["_id"]),
                "tipo": cita.get("tipoCita", "Consulta General"),
                "tipoConsulta": cita.get("tipoCita", "Consulta"),
                "fechahoraCita": cita.get("fechaHoraIso") or f"{cita.get('fecha')} {cita.get('hora')}",
                "paciente": paciente_nombre or "Paciente Sin Nombre",
                "pacienteEdad": paciente_edad,
                "estatus": cita.get("estado", "Pendiente"), # BD: estado -> Front: estatus
                "motivo": cita.get("motivo", "Sin motivo")
            }
            arrCitas.append(cita_fmt)

        print(f"✅ Se encontraron {len(arrCitas)} citas para el doctor.")
        return jsonify(arrCitas) # Devolvemos el array directo

    except Exception as e:
        print(f"❌ Error obteniendo agenda doctor: {e}")
        return jsonify({"error": str(e)}), 500


# ==================== 🔥 ACTUALIZAR ESTADO (CONFIRMAR/CANCELAR) 🔥 ====================
def updateAppointmentStatus(cita_id):
    try:
        from bson import ObjectId
        data = request.get_json()
        nuevo_estatus = data.get('estatus') # El frontend manda { estatus: 'Confirmada' }
        
        if not nuevo_estatus:
            return jsonify({"error": "No se envió el nuevo estatus"}), 400

        print(f"🔄 Cambiando estado de cita {cita_id} a: {nuevo_estatus}")
        
        db = get_db_connection()
        
        # Actualizamos el campo 'estado' en la base de datos
        result = db.appointments.update_one(
            {"_id": ObjectId(cita_id)},
            {"$set": {"estado": nuevo_estatus}}
        )
        
        if result.modified_count > 0:
            return jsonify({"success": True, "message": "Estado actualizado correctamente"})
        else:
            return jsonify({"success": False, "message": "No se realizaron cambios (tal vez ya tenía ese estado)"})

    except Exception as e:
        print(f"❌ Error actualizando estado: {e}")
        return jsonify({"error": str(e)}), 500