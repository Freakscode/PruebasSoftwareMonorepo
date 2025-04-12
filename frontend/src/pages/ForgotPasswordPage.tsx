import React, { useState } from 'react';
import apiClient from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        

        if (!email) {
            setError('El correo electrónico no puede estar vacío.');
            return;
        }

        const isRegistered = await apiClient.get<{ exists:Boolean }>(`/find-mail?mail=${email}`);

        if (!isRegistered.data.exists) {
            setError('El correo electrónico no está registrado en el sistema.');
            return;
        }

        // Simulación de envío de enlace de recuperación
        await mockSendRecoveryEmail(email);
        setSuccessMessage('Se ha enviado un enlace de recuperación a su correo electrónico.');
    };

    // Función simulada para enviar el enlace de recuperación
    const mockSendRecoveryEmail = async (email: string): Promise<void> => {
        // Aquí puedes reemplazar con una llamada real a tu backend
        console.log(`Enlace de recuperación enviado a: ${email}`);
    };

    return (
        <div className='form-container'>
            <h1>Recuperar Contraseña</h1>
            <p>Por favor, ingrese su correo electrónico para restablecer su contraseña.</p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Correo Electrónico:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className='successful-message'>{successMessage}</p>}
                <div className='buttons'>
                <button type="submit">Enviar</button>
                {successMessage && (
                    <button 
                        type="button"
                        onClick={() => navigate("/reset-password",{state:{email}})}
                    >
                        Continuar
                    </button>
                )}
                </div>
                
            </form>
        </div>
    );
};

export default ForgotPasswordPage;
