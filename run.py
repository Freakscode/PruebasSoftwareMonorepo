from backend import create_app
from dotenv import load_dotenv
import os

# Carga las variables de entorno desde .env (si existe)
load_dotenv()

app = create_app()

if __name__ == '__main__':
    app.run(debug=True) # debug=True solo para desarrollo
