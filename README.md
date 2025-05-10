# Simulador de Impuestos - Aplicación Full-Stack (Flask + React)

Este proyecto es una aplicación web full-stack simple que simula un sistema de declaración de impuestos. Consiste en un backend API construido con Flask y un frontend interactivo construido con React y Vite.

La aplicación incluye funcionalidades de autenticación (registro, login, logout), gestión de sesión, rutas protegidas, y un panel básico para usuarios y administradores.

**Propósito Principal (Contexto de Pruebas):** Esta versión del código contiene varios "bugs" sutiles introducidos intencionalmente para practicar diferentes tipos de pruebas de software (funcionales, de integración, usabilidad, rendimiento, etc.).

## Estructura del Proyecto

```
/
├── backend/         # Aplicación Flask (API)
│   ├── __init__.py  # Fábrica de la aplicación Flask
│   ├── models.py    # Modelos SQLAlchemy (User, Declaration)
│   ├── routes.py    # Rutas/endpoints de la API
│   └── ...          # Otros archivos de configuración o helpers
├── frontend/        # Aplicación React (UI)
│   ├── public/
│   ├── src/
│   │   ├── api/           # Configuración de Axios
│   │   ├── assets/
│   │   ├── components/    # Componentes reutilizables (ProtectedRoute)
│   │   ├── context/       # Contexto de Autenticación (AuthContext)
│   │   ├── pages/         # Componentes de página (Login, Dashboard, Admin)
│   │   ├── App.tsx        # Componente principal y enrutador
│   │   ├── main.tsx       # Punto de entrada de React
│   │   └── index.css      # Estilos globales
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore       # Archivos y carpetas ignorados por Git
└── README.md        # Este archivo
```

## Configuración y Ejecución

Sigue estos pasos para poner en marcha la aplicación en tu entorno local.

### Prerrequisitos

*   Python 3.8+
*   Node.js 16+ y npm (o yarn)
*   Git (opcional, para clonar si aún no lo tienes)

### Backend (Flask API)

0. ** Abre una terminal en la raíz del proyecto.**

1.  **Navega a la carpeta `backend`:**
    ```powershell
    cd backend
    ```

2.  **Crea y activa un entorno virtual:**
    ```powershell
    # Crear entorno virtual
    python -m venv .venv
    # Activar en Powershell
    .\.venv\Scripts\Activate.ps1
    # (Si usas bash/git bash: source .venv/Scripts/activate)
    ```

3.  **Instala las dependencias de Python:**
    ```powershell
    pip install Flask Flask-SQLAlchemy Flask-Login Flask-Cors Werkzeug python-dotenv
    # (Considera crear un archivo requirements.txt con 'pip freeze > requirements.txt'
    # y luego usar 'pip install -r requirements.txt')
    ```

4.  **Crea el archivo de configuración `.env`:**
    Antes de ejecutar el servidor por primera vez, crea un archivo llamado `.env` en esta carpeta (`backend/`). Este archivo es crucial para configurar la base de datos y la seguridad.

    *   **Crea el archivo:** Usa un editor o el comando `echo. > .env` (en Windows Cmd/Powershell) o `touch .env` (en Linux/WSL/macOS).
    *   **Añade el siguiente contenido:**
        ```dotenv
        # backend/.env

        # Clave secreta para Flask (cambiar en producción)
        # Puedes generar una con: python -c 'import secrets; print(secrets.token_hex())'
        SECRET_KEY='una_clave_secreta_muy_segura_y_aleatoria_para_desarrollo'

        # URL de la base de datos SQLite
        # El archivo 'app.db' se creará en backend/ la primera vez
        DATABASE_URL='sqlite:///app.db'
        ```
    *   **Importante:** Asegúrate de que el archivo se llame exactamente `.env` y esté en la carpeta `backend/`.

5.  **Ejecuta el servidor de desarrollo Flask:**
    ```powershell
    flask --app __init__:create_app --debug run
    ```
    *   El flag `--debug` activa el modo de depuración (recarga automática y más información de errores).
    *   La API estará disponible en `http://localhost:5000` (o el puerto que indique Flask).
    *   Al iniciar por primera vez (y si existe el `.env`), se creará la base de datos (`app.db`) y un usuario administrador (`admin@example.com` / `adminpassword`).

#### Crear Usuarios en el Backend (Flask Shell)

Aunque los usuarios pueden registrarse a través de la API (`POST /api/register`), a veces es útil crear usuarios directamente en la base de datos para fines de prueba o desarrollo. Puedes hacerlo usando el shell interactivo de Flask.

1.  **Abre una terminal** en la raíz del proyecto.
2.  **Navega al directorio del backend:**
    ```powershell
    cd backend
    ```
3.  **Activa el entorno virtual:**
    ```powershell
    .\.venv\Scripts\Activate.ps1
    ```
4.  **Inicia el shell de Flask:**
    ```powershell
    flask --app __init__:shell 
    ```
    Esto te dará un intérprete de Python con el contexto de la aplicación cargado.

5.  **Dentro del shell de Flask, importa los módulos necesarios:**
    ```python
    from backend import db
    from backend.models import User
    # from werkzeug.security import generate_password_hash # No necesitas generate_password_hash directamente si usas el método set_password
    ```

6.  **Crea una instancia del nuevo usuario:**
    ```python
    # Ejemplo para crear un usuario normal
    nuevo_usuario = User(
        nombre_completo='Usuario De Prueba',
        tipo_documento='CC',
        numero_documento='123456789',
        correo_electronico='prueba@example.com',
        estado='activo',
        es_admin=False
    )
    # Establece la contraseña usando el método seguro
    nuevo_usuario.set_password('password123')
    ```
    *   Asegúrate de que `numero_documento` y `correo_electronico` sean únicos.
    *   Usa `es_admin=True` si quieres crear otro administrador.

7.  **Añade el usuario a la sesión de la base de datos:**
    ```python
    db.session.add(nuevo_usuario)
    ```

8.  **Guarda los cambios en la base de datos:**
    ```python
    db.session.commit()
    ```
    ¡Listo! El usuario ha sido creado.

9.  **Sal del shell de Flask:**
    ```python
    exit()
    ```

**Nota:** Recuerda que al iniciar la aplicación Flask por primera vez, se crea automáticamente un usuario administrador con las credenciales `admin@example.com` / `adminpassword`.


### Frontend (React UI)

1.  **Abre otra terminal en la raíz del proyecto.**

2.  **Navega a la carpeta `frontend`:**
    ```powershell
    cd frontend
    ```

3.  **Instala las dependencias de Node.js:**
    ```powershell
    npm install
    # o si prefieres yarn:
    # yarn install
    ```

4.  **Creación de archivo de variables de entorno:**
    creen en la carpeta de frontend un archivo llamado .env y le agruegan esta linea
       ```powershell
    VITE_API_BASE_URL=http://127.0.0.1:5000/api
    ```
  
5.  **Ejecuta el servidor de desarrollo Vite:**
    ```powershell
    npm run dev
    # o si usas yarn:
    # yarn dev
    ```
    *   El frontend estará disponible en `http://localhost:5173` (o el puerto que indique Vite).

## Proceso Exploratorio de Pruebas

Esta aplicación ha sido preparada con varios bugs intencionales para facilitar la práctica de pruebas.

1.  **Revisa la Documentación de Bugs:** El archivo `BUGS_PARA_PRUEBAS.md` (que **no** existe dentro del repositorio Git por temas de privacidad) contiene una descripción detallada de cada bug, su ubicación en el código y sugerencias sobre qué tipos de pruebas podrían detectarlo. **Este archivo es tu guía principal para las pruebas.**

2.  **Ejecuta la Aplicación:** Ten ambos servidores (backend y frontend) corriendo como se describió anteriormente.

3.  **Pruebas Exploratorias:**
    *   **Navega por la aplicación:** Accede a `http://localhost:5173`.
    *   **Sigue los escenarios de los bugs:** Intenta reproducir los comportamientos descritos en `BUGS_PARA_PRUEBAS.md`. Por ejemplo:
        *   Intenta iniciar sesión con credenciales incorrectas y verifica si el mensaje de error desaparece al escribir de nuevo (Bug 1).
        *   Detén el servidor Flask y trata de iniciar sesión para ver el mensaje de error de red (Bug 2).
        *   Observa si el foco está en el campo de email al cargar la página de login (Bug 3).
        *   Inicia sesión como usuario normal (`usuario@example.com` / `password123` - créalo si no existe) y como admin (`admin@example.com` / `adminpassword`) y verifica las redirecciones (Bug 4).
        *   Intenta hacer doble clic rápido en el botón de login (Bug 5).
        *   Observa la consola del navegador en el Dashboard para ver las ejecuciones del `useEffect` (Bug 6).
        *   Refresca el dashboard y busca inconsistencias en la bienvenida (Bug 7).
        *   Observa el comportamiento del botón Logout (Bug 8).
        *   Como usuario normal, intenta acceder a `/admin/users` y observa si hay fugas visuales (Bug 9).
        *   Revisa la pestaña Network después de iniciar sesión para ver la llamada a `/api/session` (Bug 10).
    *   **Utiliza las Herramientas de Desarrollo del Navegador:** Inspecciona elementos, revisa la consola en busca de errores o logs (como los del Bug 6), y monitoriza las peticiones de red (útil para Bugs 5, 8, 10).
    *   **Varía las condiciones:** Prueba con diferentes datos de entrada, diferentes secuencias de acciones, y simula condiciones de red lentas si es posible.

4.  **Diseña Casos de Prueba Formales:** Basándote en tu exploración y la documentación de bugs, diseña casos de prueba más estructurados (manuales o automatizados) para verificar sistemáticamente cada comportamiento esperado y no esperado.

Enjoy!