import type { FC, MouseEvent, FocusEvent } from 'react';
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import NewDeclarationPage from './pages/NewDeclarationPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth();

  const handleMouseOver = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--color-secondary-dark)';
  };

  const handleMouseOut = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
  };

  const handleFocus = (e: FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--color-secondary-dark)';
  };

  const handleBlur = (e: FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
  };

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
        {user && !user.es_admin && <Link to="/nueva-declaracion">Nueva Declaración</Link>}
        {user?.es_admin && <Link to="/admin/users">Admin Usuarios</Link>}
        {user && <button
                    type="button"
                    onClick={logout}
                    style={{
                        marginLeft: 'auto',
                        backgroundColor: 'var(--color-secondary)',
                        padding: '0.4em 0.8em'
                    }}
                    onMouseOver={handleMouseOver}
                    onFocus={handleFocus}
                    onMouseOut={handleMouseOut}
                    onBlur={handleBlur}
                 >Cerrar Sesión</button>}
      </nav>

      <div className="container">
        <h1>Simulador de Impuestos (React Frontend)</h1>
        <Routes>
          <Route path="/" element={<div>Página de Inicio Pública</div>} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/nueva-declaracion" element={<NewDeclarationPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>

          <Route path="*" element={<div>404 - Página no encontrada</div>} />
        </Routes>
      </div>
    </>
  )
}

export default App 