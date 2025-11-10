from bson import ObjectId, json_util as j
from flask import jsonify
from pymongo import MongoClient
import BackEnd.GlobalInfo.ResponseMessages as respuestas
import BackEnd.GlobalInfo.Keys as Colabskey


#Ejemplo de conexion a la base de datos MongoDB
'''
if Colabskey.dbconn == None:
    mongoConnect = MongoClient(Colabskey.strConnection)
    Colabskey.dbconn = mongoConnect[Colabskey.strDBConnection]
    dbProfesores = Colabskey.dbconn["profesores"]
    dbAlumnos = Colabskey.dbconn["alumnos"]
    dbAdministrativos = Colabskey.dbconn["administrativos"]



def getAllProfesores():
    try:
        arrFinalColab = []
        objQuery = dbProfesores.find({})
        listProfesores = list(objQuery)
        if len(listProfesores) != 0:
            for objProfesor in listProfesores:
                objFormateado = {
                    "id": objProfesor["_id"],
                    "nombre": objProfesor["strNombreCompleto"],
                }
                arrFinalColab.append(objFormateado)
        objResponse = respuestas.succ200.copy()
        objResponse["arrProfesores"] = arrFinalColab
        return jsonify(objResponse)
    except Exception as e:
        objResponse = respuestas.err500.copy()
        objResponse['Error'] = str(e)
        return jsonify(objResponse)
'''