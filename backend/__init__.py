import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from werkzeug.security import generate_password_hash
from flask_cors import CORS

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    """Función de fábrica para crear la aplicación Flask."""
    app = Flask(__name__, instance_relative_config=True, static_folder=None, template_folder=None)

    CORS(app, supports_credentials=True, origins=["*","http://localhost:5173"])

    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'una_clave_secreta_por_defecto_cambiar_en_prod')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///' + os.path.join(app.instance_path, 'database.db'))
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Imprimir la ruta de la base de datos para depuración
    print(f"Ruta absoluta de la BD: {os.path.abspath(app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', ''))}")

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    db.init_app(app)
    login_manager.init_app(app)
    
    @login_manager.unauthorized_handler
    def unauthorized():
        return {'message': 'Autenticación requerida.'}, 401

    from . import models

    @login_manager.user_loader
    def load_user(user_id):
        return models.User.query.get(int(user_id))

    from . import routes
    app.register_blueprint(routes.bp, url_prefix='/api')

    # Asegurarse de que la creación de tablas y el usuario admin se hagan dentro del contexto de la aplicación
    with app.app_context():
        db.create_all()
        create_admin_user()

    return app

def create_admin_user():
    """Crea un usuario administrador por defecto si no existe."""
    from .models import User
    if not User.query.filter_by(correo_electronico='admin@example.com').first():
        admin_user = User(
            nombre_completo='Administrador',
            tipo_documento='ADMIN',
            numero_documento='00000000',
            correo_electronico='admin@example.com',
            estado='activo',
            es_admin=True
        )
        admin_user.set_password('adminpassword')
        db.session.add(admin_user)
        db.session.commit()
        print("Usuario administrador por defecto creado.")
