from flask import Blueprint, request, jsonify
from flask_login import login_user, current_user, logout_user, login_required
from functools import wraps
from . import db
from .models import User, Declaration
from werkzeug.security import generate_password_hash

# Crear un Blueprint para organizar las rutas
bp = Blueprint('main', __name__)

# --- Helper para serializar objetos SQLAlchemy a JSON --- (Simplificado)
def serialize(model_instance):
    """Serializa un objeto SQLAlchemy a un diccionario (simplificado)."""
    if isinstance(model_instance, User):
        return {
            'id': model_instance.id,
            'nombre_completo': model_instance.nombre_completo,
            'tipo_documento': model_instance.tipo_documento,
            'numero_documento': model_instance.numero_documento,
            'correo_electronico': model_instance.correo_electronico,
            'estado': model_instance.estado,
            'es_admin': model_instance.es_admin
        }
    elif isinstance(model_instance, Declaration):
         return {
            'id': model_instance.id,
            'user_id': model_instance.user_id,
            'ano_fiscal': model_instance.ano_fiscal,
            'ingresos_totales': model_instance.ingresos_totales,
            'deducciones_aplicadas': model_instance.deducciones_aplicadas,
            'estado_civil': model_instance.estado_civil,
            'dependientes': model_instance.dependientes,
            'otros_ingresos_deducciones': model_instance.otros_ingresos_deducciones,
            'estado_declaracion': model_instance.estado_declaracion,
            'fecha_creacion': model_instance.fecha_creacion.isoformat()
        }
    return None

# --- Decorador para rutas de Administrador (adaptado para API) ---
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.es_admin:
            return jsonify({'message': 'Acceso no autorizado. Se requiere rol de administrador.'}), 403
        return f(*args, **kwargs)
    return decorated_function

# --- Ruta de estado/verificación de sesión ---
@bp.route('/session', methods=['GET'])
@login_required
def check_session():
    """Devuelve los datos del usuario si está autenticado."""
    return jsonify({'user': serialize(current_user)}), 200

@bp.route('/session', methods=['DELETE'])
@login_required
def logout_api():
    """Cierra la sesión del usuario."""
    logout_user()
    return jsonify({'message': 'Sesión cerrada exitosamente.'}), 200

# --- Rutas de Autenticación (API) ---
# Ya no hay ruta index, es manejada por React

@bp.route('/register', methods=['POST'])
def register_api():
    # Si el usuario está autenticado y no es admin, no puede crear otros usuarios
    if current_user.is_authenticated and not current_user.es_admin:
        return jsonify({'message': 'Ya estás autenticado. No puedes crear otros usuarios.'}), 400

    data = request.get_json()
    if not data:
        return jsonify({'message': 'No se recibieron datos JSON.'}), 400

    required_fields = ['nombre_completo', 'tipo_documento', 'numero_documento', 'correo_electronico', 'password']
    errors = {field: f'{field.replace("_"," ").capitalize()} es requerido.' for field in required_fields if field not in data or not data[field]}

    if 'password' in data and len(data['password']) < 8:
         errors['password'] = 'La contraseña debe tener al menos 8 caracteres.'

    if 'correo_electronico' in data and User.query.filter_by(correo_electronico=data['correo_electronico']).first():
        errors['correo_electronico'] = 'El correo electrónico ya está registrado.'
    if 'numero_documento' in data and User.query.filter_by(numero_documento=data['numero_documento']).first():
        errors['numero_documento'] = 'El número de documento ya está registrado.'

    if errors:
        return jsonify({'message': 'Errores de validación', 'errors': errors}), 422

    try:
        # Solo los administradores pueden crear otros administradores
        es_admin = False
        if current_user.is_authenticated and current_user.es_admin and 'es_admin' in data:
            es_admin = bool(data['es_admin'])
        
        user = User(
            nombre_completo=data['nombre_completo'],
            tipo_documento=data['tipo_documento'],
            numero_documento=data['numero_documento'],
            correo_electronico=data['correo_electronico'],
            estado='activo',
            es_admin=es_admin
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'Usuario creado exitosamente.', 'user': serialize(user)}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error en registro: {e}")
        return jsonify({'message': 'Error interno al crear el usuario.'}), 500


@bp.route('/login', methods=['POST'])
def login_api():
    if current_user.is_authenticated:
        return jsonify({'message': 'Ya estás autenticado.', 'user': serialize(current_user)}), 200

    data = request.get_json()
    if not data or 'correo_electronico' not in data or 'password' not in data:
        return jsonify({'message': 'Correo electrónico y contraseña requeridos.'}), 400

    user = User.query.filter_by(correo_electronico=data['correo_electronico']).first()

    if user and user.check_password(data['password']):
        if user.estado == 'activo':
            login_user(user, remember=data.get('remember', False))
            return jsonify({'message': 'Inicio de sesión exitoso.', 'user': serialize(user)}), 200
        else:
            return jsonify({'message': 'Tu cuenta está inactiva. Contacta al administrador.'}), 403
    else:
        return jsonify({'message': 'Credenciales inválidas.'}), 401

# La ruta logout se movió a /session con método DELETE

# --- Rutas de Declaraciones (API) ---
@bp.route('/declarations', methods=['GET'])
@login_required
def get_declarations():
    """Obtiene las declaraciones del usuario actual."""
    declarations = Declaration.query.filter_by(author=current_user).all()
    return jsonify([serialize(d) for d in declarations]), 200

@bp.route('/declarations', methods=['POST'])
@login_required
def create_declaration():
    """Crea una nueva declaración para el usuario actual."""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No se recibieron datos JSON.'}), 400

    required_fields = ['ano_fiscal', 'ingresos_totales', 'estado_civil']
    errors = {field: f'{field.replace("_"," ").capitalize()} es requerido.' for field in required_fields if field not in data or data[field] is None}

    try:
        ano = int(data.get('ano_fiscal', 0))
        if not 2000 <= ano <= 2100: errors['ano_fiscal'] = 'Año fiscal inválido.'
    except (ValueError, TypeError):
        errors['ano_fiscal'] = 'Año fiscal debe ser un número.'

    # BUG 11: Validación incompleta - No se valida si los ingresos son negativos
    try:
        ingresos = float(data.get('ingresos_totales', 0.0)) # Se parsea pero no se valida >= 0
        # if ingresos < 0: errors['ingresos_totales'] = 'Ingresos totales deben ser positivos.' # <-- Validación comentada/omitida intencionalmente
    except (ValueError, TypeError):
        errors['ingresos_totales'] = 'Ingresos totales deben ser un número.'

    if data.get('estado_civil') not in ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a']:
        errors['estado_civil'] = 'Estado civil inválido.'

    if 'dependientes' in data and data['dependientes'] is not None:
        try:
            deps = int(data['dependientes'])
            if deps < 0: errors['dependientes'] = 'El número de dependientes no puede ser negativo.'
        except (ValueError, TypeError):
             errors['dependientes'] = 'Dependientes debe ser un número entero.'

    if errors:
        return jsonify({'message': 'Errores de validación', 'errors': errors}), 422

    try:
        declaration = Declaration(
            ano_fiscal=data['ano_fiscal'],
            ingresos_totales=data['ingresos_totales'],
            deducciones_aplicadas=data.get('deducciones_aplicadas', 0.0),
            estado_civil=data['estado_civil'],
            dependientes=data.get('dependientes'),
            otros_ingresos_deducciones=data.get('otros_ingresos_deducciones'),
            estado_declaracion='Guardada', # Estado inicial
            author=current_user
        )
        db.session.add(declaration)
        db.session.commit()
        return jsonify({'message': 'Declaración creada exitosamente.', 'declaration': serialize(declaration)}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error al crear declaración: {e}")
        return jsonify({'message': 'Error interno al crear la declaración.'}), 500

# --- Rutas de Administrador (API) ---
@bp.route('/admin/users', methods=['GET'])
@login_required
@admin_required
def admin_get_users():
    """Obtiene la lista de usuarios (con paginación y búsqueda)."""
    search_query = request.args.get('q', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # Imprimir para depuración
    print(f"Obteniendo usuarios - Página: {page}, Por página: {per_page}, Búsqueda: '{search_query}'")
    
    # Query base
    query = User.query
    
    # Aplicar filtro de búsqueda si existe
    if search_query:
        search_term = f'%{search_query}%'
        query = query.filter(
            User.nombre_completo.ilike(search_term) |
            User.correo_electronico.ilike(search_term) |
            User.numero_documento.ilike(search_term)
        )
    
    # Obtener todos los usuarios para verificar que existen
    all_users = query.all()
    print(f"Total de usuarios encontrados: {len(all_users)}")
    for user in all_users:
        print(f"Usuario: {user.id} - {user.nombre_completo} - {user.correo_electronico}")
    
    # Intentar paginar con manejo de error
    try:
        # Compatibilidad con diferentes versiones de SQLAlchemy
        pagination = query.order_by(User.id.asc()).paginate(page=page, per_page=per_page, error_out=False)
        users = pagination.items
        
        response = {
            'users': [serialize(u) for u in users],
            'total': pagination.total,
            'page': pagination.page,
            'per_page': pagination.per_page,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    except Exception as e:
        # Si hay error en la paginación, retornar todos los usuarios
        print(f"Error en paginación: {e}")
        users = query.order_by(User.id.asc()).all()
        
        response = {
            'users': [serialize(u) for u in users],
            'total': len(users),
            'page': 1,
            'per_page': len(users),
            'pages': 1,
            'has_next': False,
            'has_prev': False
        }
    
    return jsonify(response), 200

@bp.route('/admin/users/<int:user_id>', methods=['GET'])
@login_required
@admin_required
def admin_get_user(user_id):
    """Obtiene los detalles de un usuario específico."""
    user = User.query.get_or_404(user_id)
    return jsonify(serialize(user)), 200

@bp.route('/admin/users/<int:user_id>', methods=['PUT'])
@login_required
@admin_required
def admin_update_user(user_id):
    """Actualiza la información de un usuario."""
    user_to_edit = User.query.get_or_404(user_id)
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No se recibieron datos JSON.'}), 400

    errors = {}
    if 'nombre_completo' in data and not data['nombre_completo']:
        errors['nombre_completo'] = 'El nombre completo no puede estar vacío.'
    if 'correo_electronico' in data:
        if not data['correo_electronico']:
            errors['correo_electronico'] = 'El correo electrónico no puede estar vacío.'
        elif data['correo_electronico'] != user_to_edit.correo_electronico and User.query.filter_by(correo_electronico=data['correo_electronico']).first():
            errors['correo_electronico'] = 'El correo electrónico ya está en uso.'

    if 'password' in data and data['password']:
        if len(data['password']) < 8:
            errors['password'] = 'La nueva contraseña debe tener al menos 8 caracteres.'

    if 'estado' in data and data['estado'] not in ['activo', 'inactivo']:
        errors['estado'] = 'Estado inválido.'
    if 'es_admin' in data and not isinstance(data['es_admin'], bool):
        errors['es_admin'] = 'El rol de administrador debe ser verdadero o falso.'

    if errors:
        return jsonify({'message': 'Errores de validación', 'errors': errors}), 422

    try:
        if 'nombre_completo' in data:
            user_to_edit.nombre_completo = data['nombre_completo']
        if 'correo_electronico' in data:
            user_to_edit.correo_electronico = data['correo_electronico']
        if 'password' in data and data['password']:
            user_to_edit.set_password(data['password'])
        if 'estado' in data:
            user_to_edit.estado = data['estado']
        if 'es_admin' in data:
            user_to_edit.es_admin = data['es_admin']

        db.session.commit()
        return jsonify({'message': 'Usuario actualizado exitosamente.', 'user': serialize(user_to_edit)}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error al actualizar usuario: {e}")
        return jsonify({'message': 'Error interno al actualizar el usuario.'}), 500

@bp.route('/admin/users/<int:user_id>/toggle_status', methods=['POST'])
@login_required
@admin_required
def admin_toggle_user_status_api(user_id):
    """Cambia el estado de un usuario (activo/inactivo)."""
    user_to_toggle = User.query.get_or_404(user_id)
    
    if user_to_toggle == current_user:
         return jsonify({'message': 'No puedes cambiar tu propio estado.'}), 403

    try:
        user_to_toggle.estado = 'inactivo' if user_to_toggle.estado == 'activo' else 'activo'
        db.session.commit()
        return jsonify({'message': f'Estado del usuario cambiado a {user_to_toggle.estado}.', 'user': serialize(user_to_toggle)}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error al cambiar estado del usuario: {e}")
        return jsonify({'message': 'Error interno al cambiar el estado del usuario.'}), 500
    
@bp.route('/find-mail', methods=['GET'])
def find_mail():
    """Verifica si el correo electrónico existe."""
    email = request.args.get('mail')
    if not email:
        return jsonify({'message': 'Correo electrónico requerido.'}), 400

    user = User.query.filter_by(correo_electronico=email).first()
    if user:
        return jsonify({'exists': True}), 200
    else:
        return jsonify({'exists': False}), 200

@bp.route('/reset-password', methods=['PATCH'])
def update_pass():
    """Actualiza la contraseña del usuario."""
    data = request.get_json()
    if not data or 'mail' not in data or 'password' not in data:
        return jsonify({'message': 'Correo electrónico y contraseña requeridos.'}), 400

    user = User.query.filter_by(correo_electronico=data['mail']).first()
    if user:
        user.set_password(data['password'])
        db.session.commit()
        return jsonify({'message': 'Contraseña actualizada exitosamente.'}), 200
    else:
        return jsonify({'message': 'Usuario no encontrado.'}), 404