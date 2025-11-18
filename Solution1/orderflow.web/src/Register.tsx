import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/estilos.css";

const Register: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("https://localhost:7114/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ FullName: nombre, email, password }),
      });

      if (response.ok) {
        alert("Usuario registrado correctamente");
        window.location.href = "/login"; // en React usarías <Link>, aquí redirección simple
      } else {
        const error = await response.text();
        alert("Error: " + error);
      }
    } catch (err) {
      alert("Error de conexión: " + err);
    }
  };

  return (
    <>
      <h2 className="text-center">Registro de usuario</h2>
      <div className="container px-4">
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col">
            {/* Nombre */}
            <div>
              <label className="form-label" htmlFor="nombre">Nombre:</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-shop-window"></i>
                </span>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className="form-control"
                  placeholder="Nombre"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
            </div>
            <br />
            {/* Email */}
            <div>
              <label className="form-label" htmlFor="email">Correo electrónico:</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person-fill"></i>
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Correo electrónico"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <br />
            {/* Password */}
            <div>
              <label className="form-label" htmlFor="password">Contraseña:</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-key-fill"></i>
                </span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="Contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="col-md-12 text-center">
            <br />
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-floppy"></i> Registrar
            </button>
            <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
          </div>
        </form>
      </div>
    </>
  );
};

export default Register;