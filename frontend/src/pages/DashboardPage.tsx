import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    console.log("DashboardPage: Efecto ejecutado (¡sin dependencias!)");
    // apiClient.get('/api/algundato/dashboard').then(...);
  });

  return (
    <div>
      <h2>Panel de Usuario</h2>
      {user && (
        <>
          <p>Bienvenido/a, {user.nombre_completo}!</p>
          <p>Tu correo: {user.correo_electronico}</p>
          
          <button onClick={logout}>Cerrar Sesión</button>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
