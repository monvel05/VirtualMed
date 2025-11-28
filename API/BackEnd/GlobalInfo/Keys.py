import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv()  # Esto carga las variables del .env

# MongoDB Configuration
username = urllib.parse.quote_plus(os.getenv("MONGO_USER"))
password = urllib.parse.quote_plus(os.getenv("MONGO_PASSWORD"))
cluster = os.getenv("MONGO_CLUSTER")

# 3. Construir la URI limpia
MONGODB_URI = f"mongodb+srv://{username}:{password}@{cluster}"

DB_NAME = "VirtualMedDB"
dbconn = None