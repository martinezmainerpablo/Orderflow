import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./Register";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("https://localhost:7114/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        alert("Credenciales incorrectas");
        return;
      }

      const data: { accessToken: string } = await response.json();
      localStorage.setItem("token", data.accessToken);
      alert("Login correcto");

      // Redirige a corredores
      window.location.href = "/usuarios";
    } catch (err) {
      if (err instanceof Error) {
        alert("Error en el login: " + err.message);
      } else {
        alert("Error desconocido en el login");
      }
    }
  };

  return (
    <Router>
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Iniciar sesión</h1>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit">Iniciar sesión</button>
          <p>
            ¿No tienes cuenta? <Link to="/register">Registrarse</Link>
          </p>
        </div>
      </form>
    </div>

    {/* Definición de rutas */}
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default Login