import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const email = (location.state as { email: string })?.email;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (!email) {
            setError('No se pudo obtener el correo. Intenta iniciar de nuevo el proceso.');
            return;
        }
        try {
            await apiClient.patch('/reset-password', {
                mail: email,
                password: password
            });
        }catch {
            setError('Error al cambiar la contraseña. Inténtalo de nuevo más tarde.');
            return;
        }
        navigate('/login');
        

    };

    return (
        <div className='form-container'>
            <h2>Restablecer Contraseña</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="password">Nueva Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required

                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button>
                    Actualizar Contraseña
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;