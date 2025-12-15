import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './Auth/Login';
import { Register } from './Auth/Register';
import { Products } from './Product/Product';
import { GestionUsuarios } from './Users/GestionUsuarios';
import { Index } from './Index';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Index />} />
      <Route path="/productos" element={<Products />} />
      <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;