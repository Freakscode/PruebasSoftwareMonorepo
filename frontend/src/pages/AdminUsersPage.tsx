import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig';

interface User {
  id: number;
  nombre_completo: string;
  correo_electronico: string;
  tipo_documento: string;
  numero_documento: string;
  estado: string;
  es_admin: boolean;
}

interface FormData {
  nombre_completo: string;
  tipo_documento: string;
  numero_documento: string;
  correo_electronico: string;
  password: string;
  es_admin: boolean;
}

interface FormErrors {
  nombre_completo?: string;
  tipo_documento?: string;
  numero_documento?: string;
  correo_electronico?: string;
  password?: string;
  [key: string]: string | undefined;
}

const AdminUsersPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre_completo: '',
    tipo_documento: 'CC',
    numero_documento: '',
    correo_electronico: '',
    password: '',
    es_admin: false
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/admin/users?page=${currentPage}&q=${searchQuery}`);
        if (response.data && response.data.users) {
          setUsers(response.data.users);
          console.log("Usuarios obtenidos:", response.data.users);
        } else {
          setUsers([]);
        }
      } catch (err: any) {
        console.error("Error al obtener usuarios:", err);
        setError(err.response?.data?.message || 'Error al cargar los usuarios');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.es_admin) {
      fetchUsers();
    }
  }, [user, currentPage, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await apiClient.post(`/admin/users/${userId}/toggle_status`);
      // Actualizar la lista de usuarios después de cambiar el estado
      const response = await apiClient.get(`/admin/users?page=${currentPage}&q=${searchQuery}`);
      if (response.data && response.data.users) {
        setUsers(response.data.users);
      }
    } catch (err: any) {
      console.error("Error al cambiar estado del usuario:", err);
      setError(err.response?.data?.message || 'Error al cambiar estado del usuario');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Limpiar el error del campo cuando el usuario empieza a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.nombre_completo) {
      errors.nombre_completo = 'El nombre completo es requerido';
    }
    
    if (!formData.tipo_documento) {
      errors.tipo_documento = 'El tipo de documento es requerido';
    }
    
    if (!formData.numero_documento) {
      errors.numero_documento = 'El número de documento es requerido';
    }
    
    if (!formData.correo_electronico) {
      errors.correo_electronico = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo_electronico)) {
      errors.correo_electronico = 'El correo electrónico no es válido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await apiClient.post('/register', formData);
      console.log('Usuario creado:', response.data);
      setFormSuccess('Usuario creado exitosamente');
      
      // Resetear formulario
      setFormData({
        nombre_completo: '',
        tipo_documento: 'CC',
        numero_documento: '',
        correo_electronico: '',
        password: '',
        es_admin: false
      });
      
      // Cerrar formulario
      setShowForm(false);
      
      // Actualizar lista de usuarios
      const usersResponse = await apiClient.get(`/admin/users?page=${currentPage}&q=${searchQuery}`);
      if (usersResponse.data && usersResponse.data.users) {
        setUsers(usersResponse.data.users);
      }
    } catch (err: any) {
      console.error('Error al crear usuario:', err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || 'Error al crear el usuario');
      }
    }
  };

  const toggleFormVisibility = () => {
    setShowForm(!showForm);
    setFormErrors({});
    setFormSuccess(null);
  };

  return (
    <div>
      <h2>Panel de Administración - Usuarios</h2>
      
      {user && user.es_admin ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                padding: '8px',
                width: '300px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
            <button
              onClick={toggleFormVisibility}
              style={{
                backgroundColor: showForm ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showForm ? 'Cancelar' : 'Agregar Usuario'}
            </button>
          </div>

          {showForm && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{ marginTop: 0 }}>Nuevo Usuario</h3>
              
              {formSuccess && (
                <div style={{
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  padding: '10px',
                  borderRadius: '4px',
                  marginBottom: '15px'
                }}>
                  {formSuccess}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Nombre Completo:
                  </label>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: `1px solid ${formErrors.nombre_completo ? '#dc3545' : '#ced4da'}`
                    }}
                  />
                  {formErrors.nombre_completo && (
                    <span style={{ color: '#dc3545', fontSize: '0.875em' }}>
                      {formErrors.nombre_completo}
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ flex: '1' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Tipo de Documento:
                    </label>
                    <select
                      name="tipo_documento"
                      value={formData.tipo_documento}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: `1px solid ${formErrors.tipo_documento ? '#dc3545' : '#ced4da'}`
                      }}
                    >
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="TI">Tarjeta de Identidad</option>
                      <option value="PP">Pasaporte</option>
                    </select>
                    {formErrors.tipo_documento && (
                      <span style={{ color: '#dc3545', fontSize: '0.875em' }}>
                        {formErrors.tipo_documento}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ flex: '1' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Número de Documento:
                    </label>
                    <input
                      type="text"
                      name="numero_documento"
                      value={formData.numero_documento}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: `1px solid ${formErrors.numero_documento ? '#dc3545' : '#ced4da'}`
                      }}
                    />
                    {formErrors.numero_documento && (
                      <span style={{ color: '#dc3545', fontSize: '0.875em' }}>
                        {formErrors.numero_documento}
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    name="correo_electronico"
                    value={formData.correo_electronico}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: `1px solid ${formErrors.correo_electronico ? '#dc3545' : '#ced4da'}`
                    }}
                  />
                  {formErrors.correo_electronico && (
                    <span style={{ color: '#dc3545', fontSize: '0.875em' }}>
                      {formErrors.correo_electronico}
                    </span>
                  )}
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Contraseña:
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: `1px solid ${formErrors.password ? '#dc3545' : '#ced4da'}`
                    }}
                  />
                  {formErrors.password && (
                    <span style={{ color: '#dc3545', fontSize: '0.875em' }}>
                      {formErrors.password}
                    </span>
                  )}
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="es_admin"
                      checked={formData.es_admin}
                      onChange={handleInputChange}
                      style={{ marginRight: '8px' }}
                    />
                    <span>Asignar rol de administrador</span>
                  </label>
                </div>
                
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '10px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Crear Usuario
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <p>Cargando usuarios...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : users.length === 0 ? (
            <p>No hay usuarios para mostrar.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                marginTop: '20px',
                border: '1px solid #ddd'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={tableHeaderStyle}>ID</th>
                    <th style={tableHeaderStyle}>Nombre</th>
                    <th style={tableHeaderStyle}>Email</th>
                    <th style={tableHeaderStyle}>Documento</th>
                    <th style={tableHeaderStyle}>Estado</th>
                    <th style={tableHeaderStyle}>Rol</th>
                    <th style={tableHeaderStyle}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={tableCellStyle}>{userItem.id}</td>
                      <td style={tableCellStyle}>{userItem.nombre_completo}</td>
                      <td style={tableCellStyle}>{userItem.correo_electronico}</td>
                      <td style={tableCellStyle}>{userItem.tipo_documento} {userItem.numero_documento}</td>
                      <td style={tableCellStyle}>
                        <span style={{
                          backgroundColor: userItem.estado === 'activo' ? '#d4edda' : '#f8d7da',
                          color: userItem.estado === 'activo' ? '#155724' : '#721c24',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.85em'
                        }}>
                          {userItem.estado}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        {userItem.es_admin ? 'Administrador' : 'Usuario'}
                      </td>
                      <td style={tableCellStyle}>
                        <button
                          onClick={() => handleToggleStatus(userItem.id)}
                          style={{
                            backgroundColor: userItem.estado === 'activo' ? '#dc3545' : '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          disabled={userItem.id === user.id}
                        >
                          {userItem.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '20px' 
          }}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1 || loading}
              style={{
                padding: '5px 10px',
                marginRight: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              Anterior
            </button>
            <span style={{ margin: '0 10px' }}>Página {currentPage}</span>
            <button 
              onClick={() => setCurrentPage(prev => prev + 1)} 
              disabled={users.length < 10 || loading}
              style={{
                padding: '5px 10px',
                marginLeft: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: users.length < 10 ? 'not-allowed' : 'pointer',
                opacity: users.length < 10 ? 0.5 : 1
              }}
            >
              Siguiente
            </button>
          </div>
        </>
      ) : (
        <p>Acceso denegado. No eres administrador.</p>
      )}
    </div>
  );
};

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd'
};

const tableCellStyle: React.CSSProperties = {
  padding: '10px',
  textAlign: 'left'
};

export default AdminUsersPage;
