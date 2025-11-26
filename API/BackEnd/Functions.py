from flask import jsonify, request
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from datetime import datetime
import BackEnd.GlobalInfo.ResponseMessages as respuestas
import BackEnd.GlobalInfo.Keys as Colabskey

def get_db_connection():
    if Colabskey.dbconn is None:
        try:
            print("🔌 Intentando conectar a MongoDB...")
            client = MongoClient(
                Colabskey.MONGODB_URI,
                serverSelectionTimeoutMS=10000,
                connectTimeoutMS=10000,
                socketTimeoutMS=10000,
                retryWrites=True,
                w='majority'
            )
            
            # Verificar la conexión
            print("🩺 Haciendo ping a la base de datos...")
            client.admin.command('ping')
            print("✅ Conexión a MongoDB Atlas exitosa!")
            
            Colabskey.dbconn = client[Colabskey.DB_NAME]
            print(f"📁 Usando base de datos: {Colabskey.DB_NAME}")
            return Colabskey.dbconn
            
        except Exception as e:
            print(f"❌ Error de conexión: {e}")
            raise e
    
    print("🔗 Usando conexión existente a BD")
    return Colabskey.dbconn

def getAllUsers():
    try:
        print("🔍 Iniciando getAllUsers...")
        db = get_db_connection()
        
        arrFinalUsers = []
        
        # Obtener usuarios de todas las colecciones
        collections_to_check = ["users", "doctors", "patients"]
        
        for collection_name in collections_to_check:
            print(f"📊 Buscando en colección: {collection_name}")
            collection = db[collection_name]
            objQuery = collection.find({})
            listUsers = list(objQuery)
            
            if len(listUsers) != 0:
                for objUser in listUsers:
                    objFormateado = {
                        "id": str(objUser["_id"]),
                        "email": objUser["email"],
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
        objResponse = respuestas.err500.copy()
        objResponse['Error'] = str(e)
        return jsonify(objResponse), 500

def addUser():
    try:
        print("🔍 Iniciando proceso de registro...")
        data = request.get_json()
        print(f"📨 Datos recibidos: {data}")
        
        # Validar campos requeridos
        if not data or 'email' not in data or 'password' not in data:
            print("❌ Faltan campos requeridos: email y/o password")
            objResponse = {
                "intStatus": 400,
                "strAnswer": "Bad Request",
                "Error": "Faltan campos requeridos: email y password"
            }
            return jsonify(objResponse), 400
        
        db = get_db_connection()
        print("✅ Conexión a BD establecida")
        
        # Verificar si el usuario ya existe en cualquier colección
        print(f"🔎 Verificando si el usuario {data['email']} ya existe...")
        existing_user_doctors = db["doctors"].find_one({"email": data['email']})
        existing_user_patients = db["patients"].find_one({"email": data['email']})
        existing_user_users = db["users"].find_one({"email": data['email']})
        
        if existing_user_doctors or existing_user_patients or existing_user_users:
            print("❌ Usuario ya existe en alguna colección")
            objResponse = {
                "intStatus": 409,
                "strAnswer": "Conflict",
                "Error": "El usuario ya existe"
            }
            return jsonify(objResponse), 409
        
        # Determinar en qué colección guardar según el rol
        role = data.get('role', 'patient')
        collection_name = ""
        
        if role == 'medico' or role == 'doctor':
            collection_name = "doctors"
        elif role == 'paciente' or role == 'patient':
            collection_name = "patients"
        else:
            collection_name = "users"
        
        print(f"🎯 Rol detectado: {role}, colección: {collection_name}")
        
        # PRIMERO: Crear usuario básico en la colección 'users'
        user_basic_data = {
            "email": data['email'],
            "password": data['password'],
            "role": role,
            "fechaRegistro": datetime.now()
        }
        
        print("📝 Insertando usuario básico en colección 'users'...")
        user_result = db["users"].insert_one(user_basic_data)
        user_id = user_result.inserted_id
        print(f"✅ Usuario básico creado con ID: {user_id}")
        
        # SEGUNDO: Crear el perfil específico en la colección correspondiente
        users_collection = db[collection_name]
        
        # Datos comunes para todos los usuarios
        base_user_data = {
            "email": data['email'],
            "password": data['password'],
            "role": role,
            "nombre": data.get('nombre', ''),
            "apellidos": data.get('apellidos', ''),
            "edad": data.get('edad', ''),
            "fechaNacimiento": data.get('fechaNacimiento', ''),
            "genero": data.get('genero', ''),
            "profileImage": data.get('profileImage', ''),
            "fechaRegistro": datetime.now(),
            "userId": user_id  # Referencia al usuario básico
        }
        
        # Datos específicos según el rol
        if role == 'medico' or role == 'doctor':
            user_data = {
                **base_user_data,
                "cedula": data.get('cedula', ''),
                "especialidad": data.get('especialidad', ''),
                "subespecialidad": data.get('subespecialidad', ''),
                "estado": "activo",
                "verificado": False
            }
            print("🩺 Creando perfil de médico...")
        elif role == 'paciente' or role == 'patient':
            user_data = {
                **base_user_data,
                "peso": data.get('peso', ''),
                "altura": data.get('altura', '')
            }
            print("Creando perfil de paciente...")
        else:
            user_data = base_user_data
            print("Creando perfil de usuario genérico...")
        
        print(f"📝 Insertando perfil específico en colección '{collection_name}'...")
        result = users_collection.insert_one(user_data)
        print(f"✅ Perfil específico creado con ID: {result.inserted_id}")
        
        objResponse = respuestas.succ200.copy()
        objResponse["strAnswer"] = f"Usuario creado exitosamente como {role}"
        objResponse["userId"] = str(user_id)
        objResponse["profileId"] = str(result.inserted_id)
        objResponse["user"] = {
            "id": str(user_id),
            "email": user_data["email"],
            "role": user_data["role"],
            "nombre": user_data["nombre"],
            "apellidos": user_data["apellidos"],
            "collection": collection_name
        }
        
        print("🎉 Registro completado exitosamente!")
        return jsonify(objResponse)
        
    except Exception as e:
        print(f"💥 ERROR en addUser: {str(e)}")
        import traceback
        print(f"📋 Stack trace: {traceback.format_exc()}")
        
        objResponse = respuestas.err500.copy()
        objResponse['Error'] = str(e)
        return jsonify(objResponse), 500

def loginUser():
    try:
        print("🔍 Iniciando proceso de login...")
        data = request.get_json()
        print(f"📨 Datos de login recibidos: {data}")
        
        # Validar campos requeridos
        if not data or 'email' not in data or 'password' not in data:
            print("❌ Faltan campos requeridos en login")
            objResponse = {
                "intStatus": 400,
                "strAnswer": "Bad Request",
                "Error": "Faltan campos requeridos: email y password"
            }
            return jsonify(objResponse), 400
        
        db = get_db_connection()
        print("✅ Conexión a BD establecida para login")
        
        # PRIMERO buscar en la colección 'users' (autenticación centralizada)
        print(f"🔎 Buscando usuario: {data['email']}")
        user_basic = db["users"].find_one({"email": data['email']})
        
        if not user_basic:
            print("❌ Usuario no encontrado en colección 'users'")
            objResponse = {
                "intStatus": 404,
                "strAnswer": "Not Found",
                "Error": "Usuario no encontrado"
            }
            return jsonify(objResponse), 404
        
        # Verificar contraseña
        print("🔐 Verificando contraseña...")
        if user_basic['password'] != data['password']:
            print("❌ Contraseña incorrecta")
            objResponse = {
                "intStatus": 401,
                "strAnswer": "Unauthorized", 
                "Error": "Contraseña incorrecta"
            }
            return jsonify(objResponse), 401
        
        # SEGUNDO: Buscar el perfil completo según el rol
        role = user_basic.get('role', 'patient')
        user_profile = None
        collection_name = ""
        
        print(f"🎯 Buscando perfil específico para rol: {role}")
        if role == 'medico' or role == 'doctor':
            user_profile = db["doctors"].find_one({"email": data['email']})
            collection_name = "doctors"
            print("🩺 Perfil de médico encontrado")
        elif role == 'paciente' or role == 'patient':
            user_profile = db["patients"].find_one({"email": data['email']})
            collection_name = "patients"
            print("😊 Perfil de paciente encontrado")
        else:
            user_profile = user_basic  # Para usuarios básicos
            collection_name = "users"
            print("👤 Usando perfil básico de usuario")
        
        # Preparar respuesta con datos del perfil si existe
        user_response = {
            "id": str(user_basic["_id"]),
            "email": user_basic["email"],
            "role": user_basic.get("role", "patient")
        }
        
        # Agregar datos del perfil si están disponibles
        if user_profile and collection_name != "users":
            user_response.update({
                "nombre": user_profile.get("nombre", ""),
                "apellidos": user_profile.get("apellidos", ""),
                "profileId": str(user_profile["_id"]),
                "collection": collection_name
            })
            print("📋 Datos del perfil específico agregados")
        elif collection_name == "users":
            # Para usuarios que solo existen en la colección users
            user_response.update({
                "nombre": user_basic.get("nombre", ""),
                "apellidos": user_basic.get("apellidos", ""),
                "collection": "users"
            })
            print("📋 Datos del perfil básico agregados")
        
        objResponse = respuestas.succ200.copy()
        objResponse["strAnswer"] = "Login exitoso"
        objResponse["user"] = user_response
        
        print("🎉 Login exitoso!")
        return jsonify(objResponse)
            
    except Exception as e:
        print(f"💥 ERROR en loginUser: {str(e)}")
        import traceback
        print(f"📋 Stack trace: {traceback.format_exc()}")
        
        objResponse = respuestas.err500.copy()
        objResponse['Error'] = str(e)
        return jsonify(objResponse), 500

def getUserById(user_id):
    try:
        from bson import ObjectId
        
        print(f"🔍 Buscando usuario por ID: {user_id}")
        db = get_db_connection()
        
        # PRIMERO: Buscar usuario básico
        user_basic = db["users"].find_one({"_id": ObjectId(user_id)})
        
        if not user_basic:
            print("❌ Usuario básico no encontrado")
            objResponse = respuestas.succ200.copy()
            objResponse["user"] = None
            return jsonify(objResponse)
        
        # SEGUNDO: Buscar perfil específico según el rol
        role = user_basic.get('role', 'patient')
        user_profile = None
        collection_name = "users"
        
        print(f"🎯 Buscando perfil específico para rol: {role}")
        if role == 'medico' or role == 'doctor':
            user_profile = db["doctors"].find_one({"userId": ObjectId(user_id)})
            collection_name = "doctors"
        elif role == 'paciente' or role == 'patient':
            user_profile = db["patients"].find_one({"userId": ObjectId(user_id)})
            collection_name = "patients"
        
        # Combinar datos
        user_combined = {
            "id": str(user_basic["_id"]),
            "email": user_basic["email"],
            "role": user_basic.get("role", "No especificado"),
            "collection": collection_name
        }
        
        # Agregar datos del perfil si existen
        if user_profile:
            user_combined.update({
                "nombre": user_profile.get("nombre", ""),
                "apellidos": user_profile.get("apellidos", ""),
                "profileId": str(user_profile["_id"])
            })
            print("✅ Perfil específico encontrado y combinado")
        else:
            # Si no hay perfil específico, usar datos básicos
            user_combined.update({
                "nombre": user_basic.get("nombre", ""),
                "apellidos": user_basic.get("apellidos", "")
            })
            print("ℹ️ Usando datos básicos del usuario")
        
        objResponse = respuestas.succ200.copy()
        objResponse["user"] = user_combined
        return jsonify(objResponse)
        
    except Exception as e:
        print(f"💥 ERROR en getUserById: {str(e)}")
        objResponse = respuestas.err500.copy()
        objResponse['Error'] = str(e)
        return jsonify(objResponse), 500

def getUsersByRole(role):
    try:
        print(f"🔍 Buscando usuarios por rol: {role}")
        db = get_db_connection()
        
        arrFinalUsers = []
        
        # Determinar en qué colección buscar según el rol
        if role == 'medico' or role == 'doctor':
            collections_to_check = ["doctors"]
        elif role == 'paciente' or role == 'patient':
            collections_to_check = ["patients"]
        else:
            collections_to_check = ["users"]
        
        print(f"📊 Buscando en colecciones: {collections_to_check}")
        for collection_name in collections_to_check:
            collection = db[collection_name]
            objQuery = collection.find({"role": role})
            listUsers = list(objQuery)
            
            if len(listUsers) != 0:
                print(f"✅ Encontrados {len(listUsers)} usuarios en {collection_name}")
                for objUser in listUsers:
                    objFormateado = {
                        "id": str(objUser["_id"]),
                        "email": objUser["email"],
                        "role": objUser.get("role", "No especificado"),
                        "nombre": objUser.get("nombre", ""),
                        "apellidos": objUser.get("apellidos", ""),
                        "collection": collection_name
                    }
                    arrFinalUsers.append(objFormateado)
            else:
                print(f"ℹ️ No se encontraron usuarios en {collection_name}")
                
        objResponse = respuestas.succ200.copy()
        objResponse["arrUsers"] = arrFinalUsers
        objResponse["role"] = role
        return jsonify(objResponse)
        
    except Exception as e:
        print(f"💥 ERROR en getUsersByRole: {str(e)}")
        objResponse = respuestas.err500.copy()
        objResponse['Error'] = str(e)
        return jsonify(objResponse), 500

def updateUser(user_id):
    try:
        from bson import ObjectId
        
        print(f"🔍 Iniciando actualización para usuario: {user_id}")
        data = request.get_json()
        print(f"📨 Datos para actualizar: {data}")
        
        if not data:
            print("❌ No se proporcionaron datos para actualizar")
            objResponse = {
                "intStatus": 400,
                "strAnswer": "Bad Request",
                "Error": "No se proporcionaron datos para actualizar"
            }
            return jsonify(objResponse), 400
        
        db = get_db_connection()
        
        # PRIMERO: Buscar usuario básico
        user_basic = db["users"].find_one({"_id": ObjectId(user_id)})
        
        if not user_basic:
            print("❌ Usuario no encontrado")
            objResponse = {
                "intStatus": 404,
                "strAnswer": "Not Found",
                "Error": "Usuario no encontrado"
            }
            return jsonify(objResponse), 404
        
        # SEGUNDO: Determinar la colección del perfil específico
        role = user_basic.get('role', 'patient')
        collection_name = ""
        
        if role == 'medico' or role == 'doctor':
            collection_name = "doctors"
        elif role == 'paciente' or role == 'patient':
            collection_name = "patients"
        else:
            collection_name = "users"
        
        print(f"🎯 Actualizando perfil en colección: {collection_name}")
        
        # Actualizar datos básicos en 'users' si se proporcionan
        update_data_basic = {}
        if 'email' in data:
            update_data_basic['email'] = data['email']
        if 'password' in data:
            update_data_basic['password'] = data['password']
        if 'role' in data:
            update_data_basic['role'] = data['role']
        
        if update_data_basic:
            print("📝 Actualizando datos básicos en 'users'...")
            db["users"].update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data_basic}
            )
        
        # Actualizar perfil específico
        update_data_profile = {k: v for k, v in data.items() if k not in ['email', 'password', 'role']}
        
        if update_data_profile and collection_name != "users":
            print(f"Actualizando perfil específico en '{collection_name}'...")
            db[collection_name].update_one(
                {"userId": ObjectId(user_id)},
                {"$set": update_data_profile}
            )
        elif update_data_profile and collection_name == "users":
            # Para usuarios que solo están en la colección users
            print("Actualizando perfil básico en 'users'...")
            db["users"].update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data_profile}
            )
        
        objResponse = respuestas.succ200.copy()
        objResponse["strAnswer"] = "Usuario actualizado exitosamente"
        print("✅ Usuario actualizado exitosamente")
        return jsonify(objResponse)
        
    except Exception as e:
        print(f"💥 ERROR en updateUser: {str(e)}")
        objResponse = respuestas.err500.copy()
        objResponse['Error'] = str(e)
        return jsonify(objResponse), 500

def deleteUser(user_id):
    try:
        from bson import ObjectId
        
        print(f"🔍 Iniciando eliminación para usuario: {user_id}")
        db = get_db_connection()
        
        # PRIMERO: Buscar usuario básico
        user_basic = db["users"].find_one({"_id": ObjectId(user_id)})
        
        if not user_basic:
            print("❌ Usuario no encontrado")
            objResponse = {
                "intStatus": 404,
                "strAnswer": "Not Found",
                "Error": "Usuario no encontrado"
            }
            return jsonify(objResponse), 404
        
        # SEGUNDO: Determinar la colección del perfil específico y eliminar
        role = user_basic.get('role', 'patient')
        
        print(f"🎯 Eliminando perfil específico para rol: {role}")
        if role == 'medico' or role == 'doctor':
            result_doctors = db["doctors"].delete_one({"userId": ObjectId(user_id)})
            print(f"✅ Perfil de médico eliminado: {result_doctors.deleted_count} documento(s)")
        elif role == 'paciente' or role == 'patient':
            result_patients = db["patients"].delete_one({"userId": ObjectId(user_id)})
            print(f"✅ Perfil de paciente eliminado: {result_patients.deleted_count} documento(s)")
        
        # FINALMENTE: Eliminar el usuario básico
        result_users = db["users"].delete_one({"_id": ObjectId(user_id)})
        print(f"✅ Usuario básico eliminado: {result_users.deleted_count} documento(s)")
        
        objResponse = respuestas.succ200.copy()
        objResponse["strAnswer"] = "Usuario eliminado exitosamente"
        print("🎉 Usuario eliminado exitosamente")
        return jsonify(objResponse)
        
    except Exception as e:
        print(f"💥 ERROR en deleteUser: {str(e)}")
        objResponse = respuestas.err500.copy()
        objResponse['Error'] = str(e)
        return jsonify(objResponse), 500