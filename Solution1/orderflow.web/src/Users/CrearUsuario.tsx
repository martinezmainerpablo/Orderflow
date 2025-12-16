import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CrearUsuario.css'; 

const API_CREATE_URL = 'https://localhost:7058/api/usersadmin/Creater';
const API_ROLES_URL = 'https://localhost:7058/api/roles/all';

// Interfaces
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
  errors?: (string | { code?: string; description?: string; errorMessage?: string })[];
}

interface RoleResponse {
    id: string; 
    name: string;
}

export const CrearUsuario = () => {
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<UserCreationRequest>({
    userName: '',
    email: '',
    password: '',
    rolName: '', 
  });
  
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasDigit: false,
    hasSpecialChar: false,
  });
  
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Cargar Roles disponibles
  useEffect(() => {
    const fetchRoles = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
          navigate('/login');
          return;
      }

      try {
          const response = await fetch(API_ROLES_URL, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
          });

          if (response.status === 401 || response.status === 403) {
             setRolesError("Acceso denegado. Asegúrate de ser administrador y de tener una sesión activa.");
             setRolesLoading(false);
             return; 
          }

          if (!response.ok) {
              throw new Error(`Fallo al cargar roles: ${response.statusText}`);
          }

          const data: RoleResponse[] = await response.json(); 
          const roleNames = data.map(r => r.name); 
          
          setAvailableRoles(roleNames);

          if (roleNames.length > 0) {
              const defaultRole = roleNames.includes('User') ? 'User' : roleNames[0];
              setFormData(prev => ({ ...prev, rolName: defaultRole }));
          }

      } catch (err: any) {
          console.error("Error al obtener roles:", err);
          setRolesError(err.message || 'Error de conexión con el servicio de roles.');
      } finally {
          setRolesLoading(false);
      }
    };

    fetchRoles();
  }, [navigate]);
  
  // Validar contraseña en tiempo real
  const validatePassword = (password: string) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasDigit: /\d/.test(password),
      hasSpecialChar: /[^\da-zA-Z]/.test(password),
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar contraseña en tiempo real
    if (name === 'password') {
      validatePassword(value);
    }
  };

  // Enviar datos del formulario
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

      let responseData: UserCreationResponse | null = null;
      try {
          responseData = await response.json();
      } catch {
          // No hay cuerpo JSON
      }

      if (response.ok) {
        setStatusMessage({ type: 'success', message: [responseData?.message || 'Usuario creado con éxito.'] });
        setFormData(prev => ({ ...prev, userName: '', email: '', password: '' }));
        validatePassword(''); // Reset validación
      } else if (responseData) {
        let errors: string[] = [];
        
        if (responseData.errors && Array.isArray(responseData.errors)) {
          errors = responseData.errors.map(err => {
            if (typeof err === 'string') {
              return err;
            } else if (err.description) {
              return err.description;
            } else if (err.errorMessage) {
              return err.errorMessage;
            }
            return JSON.stringify(err);
          });
        } 
        else if (responseData.message) {
            errors = [responseData.message];
        } 
        else {
            errors = [`Fallo en la creación (Código: ${response.status})`];
        }
        
        setStatusMessage({ type: 'error', message: errors });

      } else {
        throw new Error(`Fallo en la creación (Código: ${response.status})`);
      }
    } catch (err: any) {
      console.error("Error al crear usuario:", err);
      setStatusMessage({ type: 'error', message: [err.message || 'Error de conexión con el servicio de creación.'] });
    } finally {
      setLoading(false);
    }
  };

  // Renderizado
  if (rolesLoading) {
    return <div className="create-user-container loading">Cargando roles disponibles...</div>;
  }

  if (rolesError) {
    return (
        <div className="create-user-container">
            <h2 className="create-title">Crear Nuevo Usuario</h2>
            <div className="status-message error">{rolesError}</div>
            <button onClick={() => navigate('/gestion-usuarios')} className="back-btn">Volver a Gestión</button>
        </div>
    );
  }

  return (
    <div className="create-user-container">
      <h2 className="create-title">Crear Nuevo Usuario</h2>
      <button onClick={() => navigate('/gestion-usuarios')} className="back-btn">Volver a Gestión</button>

      <form onSubmit={handleSubmit} className="creation-form">
        
        {/* Nombre de Usuario */}
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

        {/* Email */}
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

       {/* Contraseña */}
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <div className="input-with-icon">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Introduce una contraseña segura"
            />
            <span className="info-icon" title="Ver requisitos">ℹ️
              <div className="password-tooltip">
                <strong>La contraseña debe contener:</strong>
                <ul>
                  <li className={passwordValidation.minLength ? 'valid' : ''}>
                    {passwordValidation.minLength ? '✓' : '○'} Mínimo 8 caracteres
                  </li>
                  <li className={passwordValidation.hasUppercase ? 'valid' : ''}>
                    {passwordValidation.hasUppercase ? '✓' : '○'} Al menos una letra mayúscula (A-Z)
                  </li>
                  <li className={passwordValidation.hasLowercase ? 'valid' : ''}>
                    {passwordValidation.hasLowercase ? '✓' : '○'} Al menos una letra minúscula (a-z)
                  </li>
                  <li className={passwordValidation.hasDigit ? 'valid' : ''}>
                    {passwordValidation.hasDigit ? '✓' : '○'} Al menos un número (0-9)
                  </li>
                  <li className={passwordValidation.hasSpecialChar ? 'valid' : ''}>
                    {passwordValidation.hasSpecialChar ? '✓' : '○'} Al menos un carácter especial (!@#$%^&*)
                  </li>
                </ul>
              </div>
            </span>
          </div>
        </div>

        {/* Rol */}
        <div className="form-group">
          <label htmlFor="rolName">Rol:</label>
          <select
            id="rolName"
            name="rolName"
            value={formData.rolName}
            onChange={handleInputChange}
            required
            disabled={loading || availableRoles.length === 0}
          >
            {availableRoles.length > 0 ? (
                availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                ))
            ) : (
                <option value="" disabled>No hay roles disponibles</option>
            )}
          </select>
        </div>

        {/* Mensaje de Estado */}
        {statusMessage && (
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.message.map((msg, index) => (
                <p key={index}>{msg}</p>
            ))}
          </div>
        )}

        {/* Botón de Envío */}
        <button type="submit" className="submit-btn" disabled={loading || availableRoles.length === 0}>
          {loading ? 'Creando...' : 'Crear Usuario'}
        </button>
      </form>
    </div>
  );
};