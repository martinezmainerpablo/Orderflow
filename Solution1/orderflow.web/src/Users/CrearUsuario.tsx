import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CrearUsuario.css'; // Importaremos los estilos

const API_CREATE_URL = 'https://localhost:7058/api/usersadmin/create';
const AVAILABLE_ROLES = 'https://localhost:7058/api/roles/all'; // Ajusta estos roles según tu backend

interface UserCreationRequest {
  userName: string;
  email: string;
  password: string;
  rolName: string; 
}

interface UserCreationResponse {
  email: string;
  rolName: string;
  message: string;
  errors?: string[];
}

export const CrearUsuario = () => {
  const [formData, setFormData] = useState<UserCreationRequest>({
    userName: '',
    email: '',
    password: '',
    rolName: AVAILABLE_ROLES[0], // Rol predeterminado
  });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
        return;
    }

    try {
      const response = await fetch(API_CREATE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData: UserCreationResponse = await response.json();

      if (response.ok) {
        setStatusMessage({ type: 'success', message: [responseData.message || 'Usuario creado con éxito.'] });
        // Opcional: Limpiar el formulario o redirigir
        setFormData({ userName: '', email: '', password: '', rolName: AVAILABLE_ROLES[0] });
      } else if (response.status === 400) {
        // Manejar errores de validación (FluentValidation o Identity)
        let errors: string[] = [];
        if (responseData.errors && Array.isArray(responseData.errors)) {
             // Errores de Identity o Bad Request devueltos por la API
             errors = responseData.errors; 
        } else if (responseData.message) {
            // Mensaje de error general de la API
            errors = [responseData.message];
        } else {
            // Fallback para errores de validación complejos o no estándar
            errors = ['Error de validación. Revise los datos.'];
        }
        
        setStatusMessage({ type: 'error', message: errors });

      } else {
        // Otros errores HTTP (401, 500)
        throw new Error(responseData.message || `Fallo en la creación (Código: ${response.status})`);
      }
    } catch (err: any) {
      console.error("Error al crear usuario:", err);
      setStatusMessage({ type: 'error', message: [err.message || 'Error de conexión con el servicio.'] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user-container">
      <h2 className="create-title">Crear Nuevo Usuario</h2>
      <button onClick={() => navigate('/gestion-usuarios')} className="back-btn">Volver a Gestión</button>

      <form onSubmit={handleSubmit} className="creation-form">
        
        {/* 1. Nombre de Usuario */}
        <div className="form-group">
          <label htmlFor="userName">Nombre de Usuario:</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>

        {/* 2. Email */}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>

        {/* 3. Contraseña */}
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>

        {/* 4. Rol */}
        <div className="form-group">
          <label htmlFor="rolName">Rol:</label>
          <select
            id="rolName"
            name="rolName"
            value={formData.rolName}
            onChange={handleInputChange}
            required
            disabled={loading}
          >
            {AVAILABLE_ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* 5. Mensaje de Estado */}
        {statusMessage && (
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.message.map((msg, index) => (
                <p key={index}>{msg}</p>
            ))}
          </div>
        )}

        {/* 6. Botón de Envío */}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Usuario'}
        </button>
      </form>
    </div>
  );
};