import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

export const Register = () => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://localhost:7058/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (Array.isArray(errorData)) {
          const errorMessages = errorData.map((err: any) => err.errorMessage || err.ErrorMessage).join(', ');
          throw new Error(errorMessages);
        }
        
        throw new Error('Error al crear la cuenta');
      }

      setSuccess('¡Cuenta creada exitosamente! Redirigiendo al login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Crear Cuenta</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userName">Nombre:</label>
            <input
              id="userName"
              name="userName"
              type="text"
              value={formData.userName}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico: *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña: *</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña: *</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className="login-link">
          ¿Ya tienes cuenta?{' '}
          <a href="/login">Inicia Sesión</a>
        </div>
      </div>
    </div>
  );
};