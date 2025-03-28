import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth();

  return (
    <>
      <nav style={{
        backgroundColor: 'var(--color-bg-alt)',
        padding: '0.8rem 1.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <Link to="/">Inicio</Link>
        {!user && <Link to="/login">Login</Link>}
        {user && !user.es_admin && <Link to="/dashboard">Mi Panel</Link>}
        {user && user.es_admin && <Link to="/admin/users">Admin Usuarios</Link>}
        {user && <button 
                    onClick={logout} 
                    style={{ 
                        marginLeft: 'auto', 
                        backgroundColor: 'var(--color-secondary)',
                        padding: '0.4em 0.8em' 
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary-dark)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'} 
                 >Cerrar Sesión</button>} 
      </nav>

      <div className="container"> 
        <h1>Simulador de Impuestos (React Frontend)</h1>
        <Routes>
          <Route path="/" element={<div>Página de Inicio Pública</div>} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>

          <Route path="*" element={<div>404 - Página no encontrada</div>} />
        </Routes>
      </div>
    </>
  )
}

export default App 