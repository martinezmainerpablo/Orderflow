import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  userId: string;
  email: string;
  roles: string[];
}

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://localhost:7058/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Email o contraseña incorrectos');
      }

      const data: LoginResponse = await response.json();
      
      // Guardar token y usuario
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data));

      // Redirigir al index
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Iniciar Sesión</h1>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="register-link">
          ¿No tienes cuenta?{' '}
          <a href="/register">Regístrate</a>
        </div>
      </div>
    </div>
  );
};