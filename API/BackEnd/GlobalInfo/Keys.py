import os
from dotenv import load_dotenv

load_dotenv()  # Esto carga las variables del .env


dbconn = None
MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "VirtualMedDB"
PORT = os.getenv("PORT", 3000)  # Usa 3000 por defecto si no está en .env