import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './Auth/Login';
import { Register } from './Auth/Register';
import { Products } from './Product/Product';
import { GestionUsuarios } from './Users/GestionUsuarios';
import { DetalleUsuario } from './Users/DetalleUsuario';
import { CrearUsuario } from './Users/CrearUsuario';
import { Index } from './Index';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Index />} />
      <Route path="/productos" element={<Products />} />
      <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
      <Route path="/gestion-usuarios/:id" element={<DetalleUsuario />} />
      <Route path="/gestion-usuarios/crear" element={<CrearUsuario />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;