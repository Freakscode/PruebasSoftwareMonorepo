import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  nombre_completo: string;
  correo_electronico: string;
  es_admin: boolean;
}

const LoginPage: React.FC = () => {
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.post<{ message: string; user: User }>('/login', {
        correo_electronico: correoElectronico,
        password: password,
      });

      console.log('Login exitoso:', response.data.message);
      console.log('Usuario:', response.data.user);

      login(response.data.user);

      if (response.data.user.es_admin) {
        navigate('/admin/users');
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error('Error en login:', err);
      const apiErrorMessage = err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      setError(apiErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 style={{ textAlign: 'center' }}>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="correo">Correo Electrónico:</label>
          <input
            type="email"
            id="correo"
            value={correoElectronico}
            onChange={(e) => setCorreoElectronico(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={isLoading} style={{width: '100%'}}>
          {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
      </form>
      
    </div>
  );
};

export default LoginPage;
