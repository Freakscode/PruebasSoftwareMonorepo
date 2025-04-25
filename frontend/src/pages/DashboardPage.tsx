import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig';

// Definir interfaz para los datos de la declaración recibidos
interface Declaration {
    id: number;
    ano_fiscal: number;
    ingresos_totales: number;
    estado_declaracion: string; // BUG 15: Se recibe y se usará como string crudo
    fecha_creacion: string;
    // ... otros campos si son necesarios ...
}

const DashboardPage: FC = () => {
  const { user, logout } = useAuth();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  // BUG 16: No hay estado isLoading para la lista
  const [error, setError] = useState<string | null>(null);

  // BUG 6: useEffect sin array de dependencias (ya implementado antes)
  useEffect(() => {
    console.log("DashboardPage: Efecto (Bug 6) ejecutado (¡sin dependencias!)");
    // apiClient.get('/api/algundato/dashboard').then(...);
  });

  // useEffect para buscar declaraciones
  useEffect(() => {
    const fetchDeclarations = async () => {
        // BUG 16: No se establece isLoading = true aquí
        setError(null);
        try {
            const response = await apiClient.get<Declaration[]>('/declarations');
            setDeclarations(response.data);
        } catch (err) {
            console.error("Error fetching declarations:", err);
            setError("No se pudieron cargar las declaraciones.");
        }
         // BUG 16: No se establece isLoading = false aquí
    };

    if (user) { // Solo buscar si el usuario está cargado
        fetchDeclarations();
    }
    // La dependencia [user] es correcta aquí para re-fetch si cambia el usuario
  }, [user]);

  return (
    <div>
      <h2>Panel de Usuario</h2>
      {user && (
        <>
          <p>Bienvenido/a, {user.nombre_completo}!</p>
          <p>Tu correo: {user.correo_electronico}</p>
          <button type="button" onClick={logout} style={{marginBottom: '2rem'}}>Cerrar Sesión</button>
        </>
      )}

      <hr />

      <h3>Mis Declaraciones de Impuestos</h3>

      {/* BUG 16: No hay indicador de carga */} 
      {error && <p className="error-message">{error}</p>}

      {/* BUG 16: No hay mensaje explícito si la lista está vacía */} 
      {declarations.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{border: '1px solid #ccc', padding: '8px', textAlign: 'left'}}>Año Fiscal</th>
              <th style={{border: '1px solid #ccc', padding: '8px', textAlign: 'left'}}>Ingresos</th>
              <th style={{border: '1px solid #ccc', padding: '8px', textAlign: 'left'}}>Estado</th>
              <th style={{border: '1px solid #ccc', padding: '8px', textAlign: 'left'}}>Fecha Creación</th>
            </tr>
          </thead>
          <tbody>
            {declarations.map((decl) => (
              <tr key={decl.id}>
                <td style={{border: '1px solid #ccc', padding: '8px'}}>{decl.ano_fiscal}</td>
                <td style={{border: '1px solid #ccc', padding: '8px'}}>{decl.ingresos_totales.toFixed(2)}</td>
                {/* BUG 15: Mostrar estado crudo */} 
                <td style={{border: '1px solid #ccc', padding: '8px'}}>{decl.estado_declaracion}</td>
                <td style={{border: '1px solid #ccc', padding: '8px'}}>{new Date(decl.fecha_creacion).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Si declarations.length es 0, no se muestra nada aquí (Bug 16) */} 

    </div>
  );
};

export default DashboardPage;
