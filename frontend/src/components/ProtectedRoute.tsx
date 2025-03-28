import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  // Podríamos añadir props para roles específicos si fuera necesario (ej. adminOnly)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation(); // Para recordar a dónde quería ir el usuario

  if (isLoading) {
    // Muestra un indicador mientras se verifica la sesión
    // Es importante esperar a isLoading=false antes de decidir si redirigir
    return <div>Verificando autenticación...</div>; 
  }

  if (!user) {
    // Si no hay usuario después de cargar, redirigir al login
    // state={{ from: location }} guarda la ubicación original para redirigir de vuelta después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si el usuario está autenticado, renderiza el contenido de la ruta solicitada (usando Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
