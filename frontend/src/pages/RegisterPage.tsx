import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        tipo_documento: '',
        numero_documento: '',
        nombre_completo: '',
        correo_electronico: '',
        password: '',
        confirmPassword: '',
    });
    const navigate = useNavigate();

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const documentTypes = ['Cedula', 'Tarjeta de identidad', 'Pasaporte', 'Cedula de extranjería'];

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // Validate full name
        if (formData.nombre_completo.length <= 3) {
            newErrors.fullName = 'El nombre debe tener más de 3 caracteres.';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.nombre_completo)) {
            newErrors.fullName = 'El nombre no debe contener números ni caracteres especiales.';
        }

        // Validate email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo_electronico)) {
            newErrors.email = 'El correo electrónico debe tener un formato válido.';
        }

  
        if(false){
            newErrors.email = 'El correo electrónico ya está registrado.';
        }

        // Validate document number
        if (!/^\d+$/.test(formData.numero_documento)) {
            newErrors.documentNumber = 'El número de documento solo debe contener números.';
        }

        // Validate password
        if (formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
        } else if (
            !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)
        ) {
            newErrors.password =
                'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.';
        }

        // Validate confirm password
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'La confirmación de contraseña debe coincidir con la contraseña.';
        }

        // Validate required fields
        Object.keys(formData).forEach((key) => {
            if (!formData[key as keyof typeof formData]) {
                newErrors[key] = 'Este campo es obligatorio.';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            await apiClient.post('/register', formData);
            console.log('Formulario válido:', formData);
            navigate('/login')
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className='form-container'>
            <h2>Registro</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Tipo de documento</label>
                    <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange}>
                        <option value="">Seleccione</option>
                        {documentTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    {errors.documentType && <p className="error-message">{errors.documentType}</p>}
                </div>

                <div>
                    <label>Número de documento</label>
                    <input
                        type="text"
                        name="numero_documento"
                        value={formData.numero_documento}
                        onChange={handleChange}
                    />
                    {errors.documentNumber && <p className="error-message">{errors.documentNumber}</p>}
                </div>

                <div>
                    <label>Nombre completo</label>
                    <input
                        type="text"
                        name="nombre_completo"
                        value={formData.nombre_completo}
                        onChange={handleChange}
                    />
                    {errors.fullName && <p className="error-message">{errors.fullName}</p>}
                </div>

                <div>
                    <label>Correo electrónico</label>
                    <input
                        type="text"
                        name="correo_electronico"
                        value={formData.correo_electronico}
                        onChange={handleChange}
                    />
                    {errors.email && <p className="error-message">{errors.email}</p>}
                </div>

                <div>
                    <label>Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && <p className="error-message">{errors.password}</p>}
                </div>

                <div>
                    <label>Confirmar contraseña</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                </div>

                <button type="submit">Registrarme</button>
            </form>
        </div>
    );
};

export default RegisterPage;