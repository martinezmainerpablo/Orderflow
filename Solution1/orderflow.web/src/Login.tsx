import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onLogin: (email: string) => void;
  onSwitchToRegister: () => void;
}

export default function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log("Intentando Login en https://localhost:7058/api/auth/login");
      
      const response = await fetch('https://localhost:7058/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log("Login status:", response.status);

      // CASO 1: Login Exitoso (200 OK)
      if (response.ok) {
        const data = await response.json();
        
        // Guardar el token si el backend lo devuelve
        const token = data.accessToken || data.AccessToken;
        if (token) localStorage.setItem('token', token);

        // Notificar al componente padre (App.tsx) para cambiar la vista
        onLogin(data.email || email);
        return;
      } 
      
      // CASO 2: Credenciales Incorrectas (401 Unauthorized)
      if (response.status === 401) {
        setError("El correo o la contraseña son incorrectos.");
        setLoading(false);
        return;
      } 
      
      // CASO 3: Otros errores (400 Bad Request, 500 Server Error)
      if (response.status === 400) {
        setError("Solicitud incorrecta. Verifica los datos.");
      } else {
        setError("Error del servidor. Intenta más tarde.");
      }

    } catch (err) {
      console.error("Error de Login:", err);
      // CASO 4: Error de Red (Backend apagado, SSL, CORS bloqueado)
      setError("No hay conexión con el servidor. Asegúrate de que el backend esté corriendo en el puerto 7058.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="product-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            required
            disabled={loading}
          />
          
          {error && (
            <div style={{ 
              color: '#dc2626', 
              fontSize: '0.9rem', 
              backgroundColor: '#fee2e2', 
              padding: '0.5rem', 
              borderRadius: '4px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1rem',
              padding: '0.8rem',
              backgroundColor: loading ? '#94a3b8' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
          ¿No tienes cuenta?{' '}
          <span 
            onClick={loading ? undefined : onSwitchToRegister} 
            style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', opacity: loading ? 0.5 : 1 }}
          >
            Regístrate aquí
          </span>
        </p>
      </div>
    </div>
  );
}