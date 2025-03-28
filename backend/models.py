from . import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre_completo = db.Column(db.String(150), nullable=False)
    tipo_documento = db.Column(db.String(50), nullable=False)
    numero_documento = db.Column(db.String(50), unique=True, nullable=False)
    correo_electronico = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    estado = db.Column(db.String(50), default='activo', nullable=False)
    es_admin = db.Column(db.Boolean, default=False, nullable=False)
    declarations = db.relationship('Declaration', backref='author', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.correo_electronico}>'

class Declaration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ano_fiscal = db.Column(db.Integer, nullable=False)
    ingresos_totales = db.Column(db.Float, nullable=False)
    deducciones_aplicadas = db.Column(db.Float, nullable=False, default=0.0)
    estado_civil = db.Column(db.String(50), nullable=False)
    dependientes = db.Column(db.Integer, nullable=True)
    otros_ingresos_deducciones = db.Column(db.Text, nullable=True)
    estado_declaracion = db.Column(db.String(50), default='Borrador', nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Declaration {self.id} - User {self.user_id} - Año {self.ano_fiscal}>'
