import React, { useState } from 'react';
import './Register.css';

interface RegisterProps {
  onRegister: (email: string) => void; // Aunque en registro no logueamos directo, mantenemos la prop por compatibilidad
  onSwitchToLogin: () => void;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Validaciones locales (cliente)
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      console.log("Enviando registro a https://localhost:7058/api/auth/register");
      
      // 2. Conexión al Backend
      const response = await fetch('https://localhost:7058/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userName: userName, 
          email: email, 
          password: password 
        })
      });

      console.log("Respuesta registro status:", response.status);

      if (response.ok) {
        // --- CASO ÉXITO ---
        setSuccess("¡Cuenta creada con éxito! Redirigiendo al login...");
        
        // Esperamos 2 segundos para que el usuario lea el mensaje y lo mandamos al Login
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
        return;
      }

      // --- CASO ERROR ---
      // Leemos la respuesta del servidor para mostrar el error real
      const data = await response.text();
      let errorMessage = "Error al registrar usuario.";
      
      try {
        // Intentamos parsear si es un JSON (Identity suele devolver array de errores)
        const jsonErrors = JSON.parse(data);
        if (Array.isArray(jsonErrors)) {
          // Si es un array [{code:..., description:...}]
          errorMessage = jsonErrors.map((e: any) => e.description || e.code).join(', ');
        } else if (typeof jsonErrors === 'object' && jsonErrors.message) {
           errorMessage = jsonErrors.message;
        } else {
           // Si es un objeto pero no array, o texto plano en JSON
           errorMessage = JSON.stringify(jsonErrors);
        }
      } catch {
        // Si no es JSON válido, usamos el texto plano
        if (data) errorMessage = data;
      }


    } catch (err: any) {
      console.error("Error de conexión:", err);
      setError("No se pudo conectar con el servidor. Verifica que el backend (puerto 7058) esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="product-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Crear Cuenta</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            required
            disabled={loading}
          />

          <input
            type="email"
            placeholder="Correo electrónico"
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

          <input
            type="password"
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            required
            disabled={loading}
          />
          
          {/* Mensaje de Error */}
          {error && (
            <div style={{ 
              color: '#dc2626', 
              fontSize: '0.9rem', 
              backgroundColor: '#fee2e2', 
              padding: '0.5rem', 
              borderRadius: '4px',
              border: '1px solid #fecaca',
              textAlign: 'left'
            }}>
              {error}
            </div>
          )}

          {/* Mensaje de Éxito */}
          {success && (
            <div style={{ 
              color: '#15803d', 
              fontSize: '0.9rem', 
              backgroundColor: '#dcfce7', 
              padding: '0.5rem', 
              borderRadius: '4px',
              border: '1px solid #bbf7d0'
            }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1rem',
              padding: '0.8rem',
              backgroundColor: loading ? '#86efac' : '#16a34a', // Verde
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
          ¿Ya tienes cuenta?{' '}
          <span 
            onClick={loading ? undefined : onSwitchToLogin} 
            style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', opacity: loading ? 0.5 : 1 }}
          >
            Inicia Sesión
          </span>
        </p>
      </div>
    </div>
  );
}