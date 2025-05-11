import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../api/axiosConfig";

interface User {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
}

const UpdateUserPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = location.state || {}; // ID passed from another view

    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (!id) {
            navigate("/"); // Redirect if no ID is provided
            return;
        }

        // Fetch user data from the backend
        const fetchUser = async () => {
            try {
                const {data} = await apiClient.get(`/admin/users/${id}`)
                console.log(data);
                setUser(data);
                setName(data.nombre_completo);
                setEmail(data.correo_electronico);
                setIsActive(data.estado === "activo");
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        fetchUser();
    }, [id, navigate]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (password) {
            if (password.length < 8) {
                newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
            }
            const passwordRegex =
                /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
            if (!passwordRegex.test(password)) {
                newErrors.password =
                    "La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.";
            }
            if (password !== confirmPassword) {
                newErrors.confirmPassword = "Las contraseñas no coinciden.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const updatedUser = {
                nombre_completo: name ?? '',
                correo_electronico: email ?? undefined,
                password: password || undefined, // Only send password if it's being updated
                estado: isActive ? 'activo' : 'inactivo' ,
            };

            const response = await apiClient.put(`/admin/users/${id}`, updatedUser);
            
            console.log(response)

            if (response.status === 200) {
                // alert("Usuario actualizado correctamente.");
                navigate("/admin/users"); // Redirect to users list
            } else {
                const errorData = response.data;
                alert(errorData.message || "Error al actualizar el usuario.");
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    if (!user) {
        return <p>Cargando datos del usuario...</p>;
    }

    return (
        <div>
            <h1>Actualizar Usuario</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
                </div>
                <div>
                    <label>Correo Electrónico:</label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
                </div>
                <div>
                    <label>Contraseña (opcional):</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
                </div>
                <div>
                    <label>Confirmar Contraseña:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {errors.confirmPassword && (
                        <p style={{ color: "red" }}>{errors.confirmPassword}</p>
                    )}
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        Usuario Activo
                    </label>
                </div>
                <button type="submit">Actualizar Usuario</button>
            </form>
        </div>
    );
};

export default UpdateUserPage;