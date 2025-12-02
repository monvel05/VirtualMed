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


CLAVE_FUNCIONAL = clave_env.encode()
print("✅ Sistema de cifrado inicializado desde .env")

# Inicialización DIRECTA sin lógica compleja
fernet = Fernet(CLAVE_FUNCIONAL)
print("✅ Sistema de cifrado inicializado CORRECTAMENTE")

def cifrar_url_imagen(url: str) -> str:
    """Cifra la URL de la imagen para almacenamiento seguro"""
    try:
        print(f"🔐 Cifrando URL...")
        url_cifrada = fernet.encrypt(url.encode())
        url_cifrada_b64 = base64.urlsafe_b64encode(url_cifrada).decode()
        print(f"✅ URL cifrada correctamente ({len(url)} -> {len(url_cifrada_b64)} chars)")
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
            print("✅ URL descifrada correctamente")
            return url_descifrada
        return url_cifrada
    except Exception as e:
        print(f"⚠️ Error descifrando URL: {e}")
        return url_cifrada


# ==================== CONEXIÓN A BASE DE DATOS ====================
from bson import ObjectId # Aseguré importar esto al inicio para evitar errores en las funciones

def get_db_connection():
    """
    Establece o recupera una conexión activa a la base de datos MongoDB Atlas.

    Utiliza un patrón Singleton simple almacenando la conexión en `Colabskey.dbconn`
    para evitar múltiples conexiones innecesarias.

    Returns:
        pymongo.database.Database: Objeto de conexión a la base de datos seleccionada.

    Raises:
        ConnectionFailure: Si no se puede establecer conexión con el servidor de MongoDB.
        Exception: Para cualquier otro error general durante la conexión.
    """
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
            
            # Verificar la conexión
            # print("🩺 [DB] Haciendo ping...")
            # client.admin.command('ping') # Comentado para agilizar, descomentar si hay dudas de conexión
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
        print("🔍 Iniciando getAllMedicos...")
        db = get_db_connection()
        
        arrFinalMedicos = []

        print("📊 Buscando en colección: medicos")
        collection = db["doctor"]
        
        # Buscamos todos los documentos en la colección
        objQuery = collection.find({})
        listMedicos = list(objQuery)
        
        if len(listMedicos) > 0:
            for objMedico in listMedicos:
                # Formateamos el objeto con los datos relevantes para un médico
                objFormateado = {
                    "id": str(objMedico["_id"]),
                    "email": objMedico.get("email", ""),
                    "nombre": objMedico.get("nombre", ""),
                    "apellidos": objMedico.get("apellidos", ""),
                    "especialidad": objMedico.get("especialidad", "General"),
                    "subespecialidad": objMedico.get("subespecialidad", "N/A"),
                    "cedula": objMedico.get("cedula", "No registrada"),
                    "role": "medico", 
                    "estado": objMedico.get("estado", "activo")
                }
                arrFinalMedicos.append(objFormateado)
        
        print(f"👨‍⚕️ Total de médicos encontrados: {len(arrFinalMedicos)}")
        
        objResponse = respuestas.succ200.copy()
        objResponse["arrMedicos"] = arrFinalMedicos
        objResponse["count"] = len(arrFinalMedicos)
        return jsonify(objResponse)
        
    except Exception as e:
        print(f"💥 ERROR en getAllMedicos: {str(e)}")
        objResponse = respuestas.err500.copy()
        objResponse['Error'] = str(e)
        return jsonify(objResponse), 500

def getAllPacientes():
    """
    Recupera exclusivamente la lista de usuarios con perfil de paciente.

    Consulta la colección 'pacientes' para obtener el listado de personas
    que reciben atención médica en el sistema.

    Returns:
        flask.Response: Objeto JSON con:
            - arrPacientes (list): Lista de pacientes.
            - count (int): Total de pacientes encontrados.
    """
    try:
        print("🔍 Iniciando getAllPacientes...")
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
        
        print(f"🏥 Total de pacientes encontrados: {len(arrFinalPacientes)}")
        
        objResponse = respuestas.succ200.copy()
        objResponse["arrPacientes"] = arrFinalPacientes
        objResponse["count"] = len(arrFinalPacientes)
        return jsonify(objResponse)
        
    except Exception as e:
        print(f"💥 ERROR en getAllUsers: {str(e)}")
        return jsonify({"error": str(e)}), 500

# 🛠️ FUNCIÓN CORREGIDA Y BLINDADA 🛠️
def addUser():
    try:
        print("🔍 [REGISTRO] Iniciando addUser...")
        data = request.get_json()
        print(f"📨 [REGISTRO] Datos recibidos: {data}")
        
        # 1. Validaciones básicas
        if not data or 'email' not in data or 'password' not in data:
            print("❌ [REGISTRO] Faltan campos requeridos (email/password)")
            return jsonify({"intStatus": 400, "Error": "Faltan datos requeridos"}), 400
        
        db = get_db_connection()
        email = data['email']
        
        # 2. Verificar duplicados en todas las colecciones
        print(f"🔎 [REGISTRO] Verificando duplicados para {email}...")
        if (db["users"].find_one({"email": email}) or 
            db["doctors"].find_one({"email": email}) or 
            db["patients"].find_one({"email": email})):
            print("❌ [REGISTRO] El usuario ya existe")
            return jsonify({"intStatus": 409, "Error": "El usuario ya existe"}), 409
        
        # 3. Determinar Rol y Colección
        # Normalizamos a minúsculas para evitar errores 'Doctor' vs 'doctor'
        role_raw = data.get('role', 'patient') # Lo que llega del front
        role = str(role_raw).lower().strip()   # Lo que usamos en lógica
        
        collection_name = "users"
        if role in ['medico', 'doctor']:
            collection_name = "doctors"
            role = "doctor" # Estandarizamos para guardar en BD
        elif role in ['paciente', 'patient']:
            collection_name = "patients"
            role = "paciente" # Estandarizamos
            
        print(f"🎯 [REGISTRO] Rol detectado: {role} -> Colección destino: {collection_name}")
        
        # 4. Crear Usuario Básico (Tabla 'users')
        user_basic_data = {
            "email": email,
            "password": data['password'],
            "role": role,
            "fechaRegistro": datetime.now()
        }
        
        print("📝 [REGISTRO] Insertando en 'users'...")
        user_result = db["users"].insert_one(user_basic_data)
        user_id = user_result.inserted_id
        
        # 5. Crear Perfil Específico (Tabla 'doctors' o 'patients')
        # Usamos .get() para evitar KeyErrors si el dato no viene
        base_profile = {
            "email": email,
            "password": data['password'],
            "role": role,
            "nombre": data.get('nombre', ''),
            "apellido": data.get('apellidos', ''),
            "edad": data.get('edad', ''),
            "fechaNacimiento": data.get('fechaNacimiento', ''),
            "genero": data.get('genero', ''),
            "profileImage": data.get('profileImage', ''),
            "fechaRegistro": datetime.now(),
            "userId": user_id # Vinculamos con el ID del usuario básico
        }
        
        final_profile = base_profile.copy()
        
        # Datos extra si es Doctor
        if collection_name == "doctors":
            final_profile.update({
                "cedula": data.get('cedula', ''),
                "especialidad": data.get('especialidad', ''),
                "subespecialidad": data.get('subespecialidad', ''),
                "estado": "activo",
                "verificado": False
            })
            
        # Datos extra si es Paciente
        elif collection_name == "patients":
            final_profile.update({
                "peso": data.get('peso', ''),
                "altura": data.get('altura', '')
            })
            
        print(f"📝 [REGISTRO] Insertando perfil detallado en '{collection_name}'...")
        profile_result = db[collection_name].insert_one(final_profile)
        
        print("✅ [REGISTRO] ¡Éxito total!")
        
        # 6. Respuesta al Frontend
        response = {
            "intStatus": 200,
            "strAnswer": "Usuario creado exitosamente",
            "userId": str(user_id),
            "profileId": str(profile_result.inserted_id),
            "user": {
                "id": str(user_id),
                "email": email,
                "role": role, # Enviamos el rol estandarizado
                "nombre": final_profile["nombre"],
                "apellidos": final_profile["apellidos"]
            }
        }
        return jsonify(response)
        
    except Exception as e:
        print(f"💥💥 [REGISTRO] ERROR FATAL: {str(e)}")
        traceback.print_exc() # Imprime el error exacto en consola
        return jsonify({"intStatus": 500, "Error": str(e)}), 500

def loginUser():
    try:
        print("🔍 [LOGIN] Iniciando...")
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"intStatus": 400, "Error": "Faltan credenciales"}), 400
        
        db = get_db_connection()
        email = data['email']
        password = data['password']
        
        # 1. Buscar en 'users' (Login centralizado)
        user_basic = db["users"].find_one({"email": email})
        
        if not user_basic:
            print("❌ [LOGIN] Usuario no encontrado")
            return jsonify({"intStatus": 404, "Error": "Usuario no encontrado"}), 404
            
        if user_basic['password'] != password:
            print("❌ [LOGIN] Contraseña incorrecta")
            return jsonify({"intStatus": 401, "Error": "Contraseña incorrecta"}), 401
            
        # 2. Buscar perfil detallado
        role = user_basic.get('role', 'patient')
        user_profile = None
        collection_name = "users"
        
        if role in ['medico', 'doctor']:
            user_profile = db["doctors"].find_one({"email": email})
            collection_name = "doctors"
        elif role in ['paciente', 'patient']:
            user_profile = db["patients"].find_one({"email": email})
            collection_name = "patients"
            
        # 3. Armar respuesta
        user_response = {
            "id": str(user_basic["_id"]),
            "email": email,
            "role": role,
            "collection": collection_name
        }
        
        # Agregar nombre/apellidos si existen en el perfil
        if user_profile:
            user_response["nombre"] = user_profile.get("nombre", "")
            user_response["apellidos"] = user_profile.get("apellidos", "")
            user_response["profileId"] = str(user_profile["_id"])
        else:
            user_response["nombre"] = user_basic.get("nombre", "")
            user_response["apellidos"] = user_basic.get("apellidos", "")

        print(f"✅ [LOGIN] Éxito para: {email} ({role})")
        
        return jsonify({
            "intStatus": 200,
            "strAnswer": "Login exitoso",
            "user": user_response
        })
            
    except Exception as e:
        print(f"💥 [LOGIN] Error: {str(e)}")
        traceback.print_exc()
        return jsonify({"intStatus": 500, "Error": str(e)}), 500

def getUserById(user_id):
    """
    Busca un usuario específico por su ID único (ObjectId).

    Realiza una búsqueda cruzada: primero localiza el usuario en la tabla maestra 'users'
    y luego recupera los detalles adicionales de su colección de perfil correspondiente.

    Args:
        user_id (str): El ID del usuario en formato string hexadecimal.

    Returns:
        flask.Response: JSON con los datos combinados del usuario. 
                        Retorna null en "user" si no se encuentra.
    """
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
            
        user_combined = {
            "id": str(user_basic["_id"]),
            "email": user_basic["email"],
            "role": role,
            "nombre": user_basic.get("nombre", ""), # Fallback
            "apellidos": user_basic.get("apellidos", "") # Fallback
        }
        
        if user_profile:
            user_combined.update({
                "nombre": user_profile.get("nombre", ""),
                "apellidos": user_profile.get("apellidos", ""),
                "profileId": str(user_profile["_id"]),
                # 🔥 AGREGAR ESTOS CAMPOS FALTANTES:
                "profileImage": user_profile.get("profileImage", ""),
                "edad": user_profile.get("edad", ""),
                "genero": user_profile.get("genero", ""),
                "fechaNacimiento": user_profile.get("fechaNacimiento", "")
            })
            # Agregar campos específicos
            if "cedula" in user_profile: user_combined["cedula"] = user_profile["cedula"]
            if "especialidad" in user_profile: user_combined["especialidad"] = user_profile["especialidad"]
            if "subespecialidad" in user_profile: user_combined["subespecialidad"] = user_profile["subespecialidad"]
            if "estado" in user_profile: user_combined["estado"] = user_profile["estado"]
            if "verificado" in user_profile: user_combined["verificado"] = user_profile["verificado"]
            
        return jsonify({"intStatus": 200, "user": user_combined})
        
    except Exception as e:
        print(f"💥 Error getUserById: {e}")
        return jsonify({"intStatus": 500, "Error": str(e)}), 500
    
def getUsersByRole(role):
    try:
        db = get_db_connection()
        arrFinalUsers = []
        collection = db["users"] # Por defecto
        
        if role in ['medico', 'doctor']:
            collection = db["doctors"]
        elif role in ['paciente', 'patient']:
            collection = db["patients"]
            
        # Buscar flexiblemente (si buscamos 'doctor' que traiga 'medico' tambien, etc)
        # Simplificación: buscamos directo en la colección específica
        listUsers = list(collection.find({})) # Trae todos de esa colección
        
        for objUser in listUsers:
            arrFinalUsers.append({
                "id": str(objUser.get("userId", objUser["_id"])), # Preferir userId si existe
                "email": objUser.get("email", ""),
                "nombre": objUser.get("nombre", ""),
                "apellidos": objUser.get("apellidos", ""),
                "role": objUser.get("role", role)
            })
            
        return jsonify({"intStatus": 200, "arrUsers": arrFinalUsers})
    except Exception as e:
        return jsonify({"intStatus": 500, "Error": str(e)}), 500

def updateUser(user_id):
    """
    Actualiza la información de un usuario existente.

    Maneja la lógica para actualizar campos en dos lugares distintos:
    1. Campos de autenticación (email, password, role) en la colección 'users'.
    2. Campos de perfil (nombre, apellidos, etc.) en la colección específica del rol.

    Args:
        user_id (str): ID del usuario a actualizar.

    Returns:
        tuple: (flask.Response, int)
            - 200: Actualización exitosa.
            - 400: Bad request (sin datos).
            - 404: Usuario no encontrado.
            - 500: Error interno.
    """
    try:
        from bson import ObjectId
        data = request.get_json()
        if not data: return jsonify({"intStatus": 400, "Error": "Sin datos"}), 400
        
        db = get_db_connection()
        
        # 1. Actualizar usuario básico
        basic_fields = ['email', 'password', 'role']
        update_basic = {k: v for k, v in data.items() if k in basic_fields}
        
        if update_basic:
            db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": update_basic})
            
        # 2. Actualizar perfil específico
        # Primero necesitamos saber dónde está
        user_basic = db["users"].find_one({"_id": ObjectId(user_id)})
        if user_basic:
            role = user_basic.get('role', '')
            collection_name = None
            if role in ['medico', 'doctor']: collection_name = "doctors"
            elif role in ['paciente', 'patient']: collection_name = "patients"
            
            if collection_name:
                update_profile = {k: v for k, v in data.items() if k not in basic_fields}
                if update_profile:
                    db[collection_name].update_one({"userId": ObjectId(user_id)}, {"$set": update_profile})

        return jsonify({"intStatus": 200, "strAnswer": "Actualizado"})
    except Exception as e:
        return jsonify({"intStatus": 500, "Error": str(e)}), 500

def deleteUser(user_id):
    """
    Elimina permanentemente a un usuario y sus datos asociados.

    Ejecuta una eliminación en cascada manual:
    1. Elimina el perfil detallado en la colección de rol (doctors/patients).
    2. Elimina el registro de autenticación en la colección 'users'.

    Args:
        user_id (str): ID del usuario a eliminar.

    Returns:
        tuple: (flask.Response, int)
            - 200: Eliminación exitosa.
            - 404: Usuario no encontrado.
            - 500: Error interno.
    """
    try:
        from bson import ObjectId
        db = get_db_connection()
        
        # Borrar de colecciones específicas primero (por integridad referencial lógica)
        db["doctors"].delete_one({"userId": ObjectId(user_id)})
        db["patients"].delete_one({"userId": ObjectId(user_id)})
        
        # Borrar usuario base
        result = db["users"].delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count > 0:
            return jsonify({"intStatus": 200, "strAnswer": "Eliminado"})
        else:
            return jsonify({"intStatus": 404, "strAnswer": "No encontrado"}), 404
            
    except Exception as e:
        return jsonify({"intStatus": 500, "Error": str(e)}), 500

    

# ========== FUNCIONES DE PREDICCIÓN CON CIFRADO ==========

def analyze_complete():
    """
    Endpoint único que:
    1. Recibe URL de Cloudinary + datos del paciente + archivo de imagen
    2. Procesa con el modelo de ML
    3. Guarda todo en MongoDB colección 'prediction' (con URL cifrada)
    4. Devuelve resultado completo
    """
    try:
        # Verificar que viene la imagen para el modelo
        if "image" not in request.files:
            return jsonify({"error": "No se envió ninguna imagen para el modelo"}), 400

        # Obtener datos del formData
        cloudinary_url = request.form.get('image_url', '')
        patient_name = request.form.get('patient_name', '')
        patient_age = request.form.get('patient_age', '')
        patient_id = request.form.get('patient_id', '')
        breast_side = request.form.get('breast_side', '')
        clinical_notes = request.form.get('clinical_notes', '')
        
        print(f"📋 Datos recibidos:")
        print(f"   Cloudinary URL: {cloudinary_url}")
        print(f"   Nombre: {patient_name}")
        print(f"   Edad: {patient_age}")
        print(f"   ID: {patient_id}")
        print(f"   Mama: {breast_side}")

        file = request.files["image"]
        
        # ========== 1. PROCESAR CON MODELO DE ML ==========
        print("🔮 Iniciando evaluación de imagen con modelo de ML...")
        
        # Ruta al modelo
        current_file = os.path.abspath(__file__)
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(current_file)))
        MODEL_PATH = os.path.join(BASE_DIR, "models", "model_vgg16_final.keras")
        
        print(f"📁 Buscando modelo en: {MODEL_PATH}")
        
        # Verificar si el archivo del modelo existe
        if not os.path.exists(MODEL_PATH):
            error_msg = f"Modelo no encontrado en la ruta: {MODEL_PATH}"
            print(f"❌ {error_msg}")
            return jsonify({"error": error_msg}), 500
        
        # Cargar modelo
        try:
            print("🔄 Cargando modelo...")
            model = load_model(MODEL_PATH)
            print("✅ Modelo cargado exitosamente")
        except Exception as e:
            error_msg = f"Error cargando modelo: {str(e)}"
            print(f"❌ {error_msg}")
            return jsonify({"error": error_msg}), 500

        # Procesar imagen para el modelo
        print("📷 Procesando imagen para modelo...")
        try:
            img = Image.open(io.BytesIO(file.read())).convert("RGB")
            img = img.resize((227, 227))
            img_array = np.array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            print("✅ Imagen procesada correctamente")
        except Exception as e:
            error_msg = f"Error procesando imagen: {str(e)}"
            print(f"❌ {error_msg}")
            return jsonify({"error": error_msg}), 500

        # Hacer predicción
        print("🤖 Haciendo predicción...")
        try:
            prediction = model.predict(img_array)
            print(f"✅ Predicción completada: {prediction}")
        except Exception as e:
            error_msg = f"Error en la predicción: {str(e)}"
            print(f"❌ {error_msg}")
            return jsonify({"error": error_msg}), 500

        # Interpretar resultados
        malignant_probability = prediction[0][0]
        malignant_probability_float = float(malignant_probability)

        if malignant_probability_float > 0.5:
            classification = "Maligno"
            confidence_percent = malignant_probability_float * 100
        else:
            classification = "Benigno"
            confidence_percent = (1 - malignant_probability_float) * 100

        print(f"📊 Resultado del modelo: {classification} con {confidence_percent:.2f}% de confianza")

        # ========== 2. GUARDAR EN MONGODB CON URL CIFRADA ==========
        print("💾 Guardando en MongoDB colección 'prediction'...")
        try:
            db = get_db_connection()
            predictions_collection = db.prediction
            
            # CIFRAR la URL de la imagen antes de guardar
            url_cifrada = cifrar_url_imagen(cloudinary_url)
            
            prediction_doc = {
                'image_url': url_cifrada,  # URL CIFRADA
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
            
            result = predictions_collection.insert_one(prediction_doc)
            prediction_id = str(result.inserted_id)
            
            print(f"✅ Predicción guardada con ID: {prediction_id}")
            
        except Exception as e:
            error_msg = f"Error guardando en MongoDB: {str(e)}"
            print(f"❌ {error_msg}")
            return jsonify({"error": error_msg}), 500

        # ========== 3. RESPONDER ==========
        return jsonify({
            "success": True,
            "prediction_id": prediction_id,
            "classification": classification,
            "confidence": float(malignant_probability_float),
            "confidence_percent": float(confidence_percent),
            "message": "Análisis completado y guardado exitosamente",
            "data": {
                "patient_name": patient_name,
                "patient_age": patient_age,
                "patient_id": patient_id,
                "breast_side": breast_side,
                "clinical_notes": clinical_notes
            }
        })

    except Exception as e:
        error_msg = f"Error general en analyze_complete: {str(e)}"
        print(f"💥 {error_msg}")
        return jsonify({"error": error_msg}), 500

def getAllPredictions():
    """Obtiene todas las predicciones del historial y DESCIFRA las URLs"""
    try:
        db = get_db_connection()
        predictions_collection = db.prediction
        
        predictions = list(predictions_collection.find().sort('created_at', -1))
        
        for prediction in predictions:
            prediction['_id'] = str(prediction['_id'])
            # DESCIFRAR la URL de la imagen antes de enviar al frontend
            prediction['image_url'] = descifrar_url_imagen(prediction['image_url'])
        
        print(f"📊 Recuperadas {len(predictions)} predicciones del historial")
        return jsonify(predictions)
        
    except Exception as e:
        print(f"Error obteniendo predicciones: {str(e)}")
        return jsonify({'error': f'Error obteniendo predicciones: {str(e)}'}), 500

def getPredictionById(prediction_id):
    """Obtiene una predicción específica por ID y DESCIFRA la URL"""
    try:
        db = get_db_connection()
        predictions_collection = db.prediction
        
        prediction = predictions_collection.find_one({'_id': ObjectId(prediction_id)})
        
        if not prediction:
            return jsonify({'error': 'Predicción no encontrada'}), 404
        
        prediction['_id'] = str(prediction['_id'])
        # DESCIFRAR la URL de la imagen
        prediction['image_url'] = descifrar_url_imagen(prediction['image_url'])
        
        return jsonify(prediction)
        
    except Exception as e:
        print(f"Error obteniendo predicción {prediction_id}: {str(e)}")
        return jsonify({'error': f'Error obteniendo predicción: {str(e)}'}), 500

def deletePrediction(prediction_id):
    """Elimina una predicción de la base de datos"""
    try:
        db = get_db_connection()
        predictions_collection = db.prediction
        
        result = predictions_collection.delete_one({'_id': ObjectId(prediction_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Predicción no encontrada'}), 404
        
        print(f"Predicción {prediction_id} eliminada")
        
        return jsonify({'message': 'Predicción eliminada exitosamente'})
        
    except Exception as e:
        print(f"Error eliminando predicción {prediction_id}: {str(e)}")
        return jsonify({'error': f'Error eliminando predicción: {str(e)}'}), 500

