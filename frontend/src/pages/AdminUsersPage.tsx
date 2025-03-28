import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminUsersPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h2>Panel de Administración - Usuarios</h2>
      {user && user.es_admin && (
        <>
          <p>Administrador: {user.nombre_completo}</p>
          <p>Contenido de administración de usuarios...</p>
          <button onClick={logout}>Cerrar Sesión</button>
        </>
      )}
      {user && !user.es_admin && (
          <p>Acceso denegado. No eres administrador.</p>
      )}
    </div>
  );
};

export default AdminUsersPage;
