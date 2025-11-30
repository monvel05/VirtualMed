from flask import jsonify, request
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from datetime import datetime
import traceback # Importante para ver errores detallados
import BackEnd.GlobalInfo.ResponseMessages as respuestas
import BackEnd.GlobalInfo.Keys as Colabskey

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
            "apellidos": data.get('apellidos', ''),
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
                "profileId": str(user_profile["_id"])
            })
            # Agregar campos específicos
            if "cedula" in user_profile: user_combined["cedula"] = user_profile["cedula"]
            if "especialidad" in user_profile: user_combined["especialidad"] = user_profile["especialidad"]
            if "subespecialidad" in user_profile: user_combined["subespecialidad"] = user_profile["subespecialidad"]
            
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