# VirtualMed 🏥

![Estado del Proyecto](https://img.shields.io/badge/Estado-En_Desarrollo-green)


**VirtualMed** es una plataforma integral de telemedicina diseñada para conectar pacientes con especialistas de salud de manera rápida y eficiente.

---

## 📑 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura](#-arquitectura)
- [Pre-requisitos](#-pre-requisitos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Uso](#-uso)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## 🚀 Características Principales

### Para Pacientes:
* 📅 **Gestión de Citas:** Agendar, ver y cancelar citas en tiempo real con un solo clic.
* 🤖 **Chatbot:** Chatbot para pacientes que ayuda a recomendar un doctor en base a los síntomas del usuario.

### Para Médicos:
* 📋 **Gestión de Citars:** Agendar, ver, confirmar y cancelar citas en tiempo real.
* 📝 **Generación de recetas:** Crear archivos de receta digitales y descargables.
* 🔍 **Clasificador de tumores con IA:** Ia capaz de analizar imágenes con tumores en las glándulas mamarias y detectar si estos son benignos o malignos.

---

## 💻 Tecnologías Utilizadas

Este proyecto utiliza una arquitectura Cliente-Servidor:

**Frontend (Móvil/Web):**
* Ionic con Angular
* Typescript
* SCSS

**Backend (API):**
* Python con Flask
* Pymongo

**Base de Datos:**
* Atlas MongoDB

---


⚙️ Pre-requisitos

Antes de comenzar, asegúrate de tener instalado:

*Git - Para clonar el repositorio o tener instalado Github Desktop.
*Ionic CLI - Instálalo globalmente ejecutando: npm install -g @ionic/cli.
*Python 3.10+ - Requerido para el servidor Flask.
*Flask y Flask CORS- Api para estar conectados con la bd.
*MongoDB - Base de datos local (o usa MongoDB Atlas).
*Pymongo - Driver o puente de MongoDB.
*TensorFlow, numpy y otros - Para el funcionamiento del clasificador de tumores.

🔧 Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto localmente:

1. Clonar el repositorio

Abre tu terminal y ejecuta:

git clone [https://github.com/tu-usuario/VirtualMed.git](https://github.com/tu-usuario/VirtualMed.git)
cd VirtualMed


2. Configuración del Backend (Flask)

Navega a la carpeta del servidor e instala las dependencias de Python.

cd backend


Crear y activar el entorno virtual:

En Windows:

python -m venv venv
venv\Scripts\activate


En macOS / Linux:

python3 -m venv venv
source venv/bin/activate


Instalar dependencias y ejecutar:

pip install -r requirements.txt
flask run


El servidor debería estar corriendo en http://127.0.0.1:5000

3. Configuración del Frontend (Ionic)

Abre una nueva terminal (sin cerrar la del backend), navega a la carpeta del cliente e inicia la aplicación.

cd frontend
npm install
ionic serve


La aplicación se abrirá automáticamente en tu navegador en http://localhost:8100

