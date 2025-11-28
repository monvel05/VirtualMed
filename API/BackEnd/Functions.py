from flask import jsonify, request
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from datetime import datetime
import BackEnd.GlobalInfo.ResponseMessages as respuestas
import BackEnd.GlobalInfo.Keys as Colabskey
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

def getAllMedicos():
    """
    Recupera exclusivamente la lista de usuarios con perfil de médico.

    Consulta la colección 'medicos' de la base de datos para obtener
    la información profesional y personal de los doctores registrados.

    Returns:
        flask.Response: Objeto JSON con:
            - arrMedicos (list): Lista de doctores con id, nombre, especialidad, etc.
            - count (int): Total de médicos encontrados.
    """
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
        
        arrFinalPacientes = []
        
        # NOTA: Se actualizó el nombre de la colección a 'pacientes' (español)
        print("📊 Buscando en colección: pacientes")
        collection = db["pacientes"]
        
        objQuery = collection.find({})
        listPacientes = list(objQuery)
        
        if len(listPacientes) > 0:
            for objPaciente in listPacientes:
                objFormateado = {
                    "id": str(objPaciente["_id"]),
                    "email": objPaciente.get("email", ""),
                    "nombre": objPaciente.get("nombre", ""),
                    "apellidos": objPaciente.get("apellidos", ""),
                    "edad": objPaciente.get("edad", ""),
                    "genero": objPaciente.get("genero", ""),
                    "role": "paciente"
                }
                arrFinalPacientes.append(objFormateado)
        
        print(f"🏥 Total de pacientes encontrados: {len(arrFinalPacientes)}")
        
        objResponse = respuestas.succ200.copy()
        objResponse["arrPacientes"] = arrFinalPacientes
        objResponse["count"] = len(arrFinalPacientes)
        return jsonify(objResponse)
        
    except Exception as e:
        print(f"💥 ERROR en getAllPacientes: {str(e)}")
        objResponse = respuestas.err500.copy()
        objResponse['Error'] = str(e)
        return jsonify(objResponse), 500

def addUser():
    """
    Registra un nuevo usuario directamente en la colección correspondiente a su rol.

    Elimina la dependencia de una colección central 'users'. 
    Verifica unicidad del correo a través de las colecciones 'medicos' y 'pacientes'.

    El payload (JSON) debe contener 'email', 'password' y 'role'.

    Returns:
        tuple: (flask.Response, int)
            - 200: Usuario creado exitosamente.
            - 400: Datos incompletos o rol no válido.
            - 409: El correo ya existe en el sistema.
            - 500: Error de servidor.
    """
    try:
        print("🔍 Iniciando proceso de registro directo...")
        data = request.get_json()
        print(f"📨 Datos recibidos: {data}")
        
        # Validar campos requeridos (Ahora 'role' es obligatorio para saber dónde guardar)
        if not data or 'email' not in data or 'password' not in data or 'role' not in data:
            print("❌ Faltan campos requeridos: email, password o role")
            objResponse = {
                "intStatus": 400,
                "strAnswer": "Bad Request",
                "Error": "Faltan campos requeridos: email, password y role"
            }
            return jsonify(objResponse), 400
        
        db = get_db_connection()
        
        # 1. Verificar si el correo ya existe en CUALQUIERA de las colecciones
        print(f"🔎 Verificando existencia de {data['email']} en el sistema...")
        existe_medico = db["doctor"].find_one({"email": data['email']})
        existe_paciente = db["pacientes"].find_one({"email": data['email']})
        
        if existe_medico or existe_paciente:
            print("❌ El correo ya está registrado en el sistema")
            objResponse = {
                "intStatus": 409,
                "strAnswer": "Conflict",
                "Error": "El usuario ya existe en el sistema"
            }
            return jsonify(objResponse), 409
        
        # 2. Preparar datos y seleccionar colección según el rol
        role = data['role'].lower()
        collection_name = ""
        user_data = {}
        
        # Datos base comunes
        base_data = {
            "email": data['email'],
            "password": data['password'], # Recuerda hashear esto en producción
            "role": role,
            "nombre": data.get('nombre', ''),
            "apellido": data.get('apellidos', ''),
            "edad": data.get('edad', ''),
            "fechaNacimiento": data.get('fechaNacimiento', ''),
            "genero": data.get('genero', ''),
            "profileImage": data.get('profileImage', ''),
            "fechaRegistro": datetime.now()
        }

        if role == 'medico' or role == 'doctor':
            collection_name = "doctor"
            user_data = {
                **base_data,
                "role": "doctor", # Estandarizamos a español
                "cedula": data.get('cedula', ''),
                "especialidad": data.get('especialidad', ''),
                "subespecialidad": data.get('subespecialidad', '')
            }
            print("🩺 Configurando perfil de Médico...")

        elif role == 'paciente' or role == 'patient':
            collection_name = "pacientes"
            user_data = {
                **base_data,
                "role": "paciente", # Estandarizamos a español
                "peso": data.get('peso', ''),
                "altura": data.get('altura', ''),
                "tipoSangre": data.get('tipoSangre', '')
            }
            print("🏥 Configurando perfil de Paciente...")
            
        else:
            print(f"❌ Rol no válido proporcionado: {role}")
            objResponse = {
                "intStatus": 400,
                "strAnswer": "Bad Request",
                "Error": "Rol no válido. Use 'medico' o 'paciente'."
            }
            return jsonify(objResponse), 400
        
        # 3. Insertar en la colección seleccionada
        print(f"📝 Insertando usuario en colección '{collection_name}'...")
        result = db[collection_name].insert_one(user_data)
        new_id = str(result.inserted_id)
        
        print(f"✅ Usuario creado con ID: {new_id}")
        
        objResponse = respuestas.succ200.copy()
        objResponse["strAnswer"] = f"Usuario registrado exitosamente como {collection_name}"
        objResponse["id"] = new_id
        objResponse["user"] = {
            "id": new_id,
            "email": user_data["email"],
            "role": user_data["role"],
            "nombre": user_data["nombre"],
            "apellidos": user_data["apellidos"],
            "collection": collection_name
        }
        
        return jsonify(objResponse)
        
    except Exception as e:
        print(f"💥 ERROR en addUser: {str(e)}")
        import traceback
        print(f"📋 Stack trace: {traceback.format_exc()}")
        
        objResponse = respuestas.err500.copy()
        objResponse['Error'] = str(e)
        return jsonify(objResponse), 500

def loginUser():
    """
    Autentica a un usuario buscando en las colecciones específicas de roles.
    
    Estrategia de búsqueda:
    1. Busca en la colección 'medicos'.
    2. Si no encuentra, busca en la colección 'pacientes'.
    3. Verifica la contraseña y retorna el objeto formateado para el UserService de Angular.

    Returns:
        flask.Response: JSON con los datos del usuario listos para el Frontend.
    """
    try:
        print("🔍 Iniciando proceso de login...")
        data = request.get_json()
        print(f"📨 Datos de login recibidos: {data}")
        
        # 1. Validar entrada
        if not data or 'email' not in data or 'password' not in data:
            print("❌ Faltan campos requeridos")
            return jsonify({"strAnswer": "Bad Request", "Error": "Faltan email o password"}), 400
        
        db = get_db_connection()
        email = data['email']
        password = data['password']
        
        user_found = None
        role_detected = ""
        
        # 2. Buscar en colección de MEDICOS
        print(f"🔎 Buscando '{email}' en Médicos...")
        user_found = db["doctor"].find_one({"email": email})
        
        if user_found:
            role_detected = "medico"
            print("✅ Usuario encontrado en colección de Médicos")
        else:
            # 3. Si no es médico, buscar en PACIENTES
            print(f"🔎 Buscando '{email}' en Pacientes...")
            user_found = db["pacientes"].find_one({"email": email})
            if user_found:
                role_detected = "paciente"
                print("✅ Usuario encontrado en colección de Pacientes")
        
        # 4. Si no se encontró en ninguna
        if not user_found:
            print("❌ Usuario no encontrado en ninguna colección")
            return jsonify({"strAnswer": "Not Found", "Error": "Usuario no registrado"}), 404
        
        # 5. Verificar Contraseña
        # NOTA: En producción deberías usar hash (ej. bcrypt.check_password_hash)
        if user_found.get('password') != password:
            print("❌ Contraseña incorrecta")
            return jsonify({"strAnswer": "Unauthorized", "Error": "Credenciales inválidas"}), 401
            
        # 6. Preparar respuesta para Angular (Mapeo exacto para UserService)
        print("🏗️ Construyendo objeto de sesión...")
        
        response_user = {
            # Campos Comunes
            "id": str(user_found["_id"]),
            "role": role_detected,
            "email": user_found.get("email"),
            "nombre": user_found.get("nombre"),
            "apellidos": user_found.get("apellidos"),
            "edad": user_found.get("edad"),
            "fechaNacimiento": user_found.get("fechaNacimiento"),
            "genero": user_found.get("genero"),
            "profileImage": user_found.get("profileImage", ""),
        }
        
        # Campos Específicos de Médico
        if role_detected.lower() == "doctor" or role_detected.lower() == "medico":
            response_user.update({
                "cedula": user_found.get("cedula"),
                "especialidad": user_found.get("especialidad"),
                "subespecialidad": user_found.get("subespecialidad")
            })
            
        # Campos Específicos de Paciente
        elif role_detected.lower() == "paciente":
            response_user.update({
                "peso": user_found.get("peso"),
                "altura": user_found.get("altura"),
                "tipoSangre": user_found.get("tipoSangre")
            })

        print(f"🎉 Login exitoso para: {role_detected}")

        return jsonify(response_user), 200

    except Exception as e:
        print(f"💥 ERROR en loginUser: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"Error": str(e)}), 500

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