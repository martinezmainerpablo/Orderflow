import { useState } from 'react'

import './App.css'

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    // Validación básica
    if (!email || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    // Aquí iría la lógica de autenticación (API, Firebase, etc.)
    console.log("Email:", email);
    console.log("Password:", password);

    setError(""); // limpiar errores
    alert("Inicio de sesión exitoso (simulado)");
  };
 return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Introduce tu correo"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Introduce tu contraseña"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ padding: "10px 20px" }}>
          Entrar
        </button>
      </form>
      <p className="read-the-docs">
        ¿No tienes cuenta? <a href="register.html">Regístrate aquí</a>
      </p>
    </div>
  );
}
export default App
