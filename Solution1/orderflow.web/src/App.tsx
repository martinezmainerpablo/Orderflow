import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { Login } from './Auth/Login';
import { Register } from './Auth/Register';
import { Products } from './Product/Product';
import { GestionUsuarios } from './Users/GestionUsuarios';
import { DetalleUsuario } from './Users/DetalleUsuario';
import { CrearUsuario } from './Users/CrearUsuario';
import { ActualizarUsuario } from './Users/ActualizarUsuario';
import { Cart } from './Product/Cart';
import { MisOrdenes } from './Order/MisOrdenes';
import { VerDetalles } from './Order/VerDetalles';
import { AdminOrdenes } from './Order/AdminOrdenes';
import { Index } from './Index';

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Index />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
        <Route path="/gestion-usuarios/:id" element={<DetalleUsuario />} />
        <Route path="/gestion-usuarios/crear" element={<CrearUsuario />} />
        <Route path="/gestion-usuarios/actualizar/:id" element={<ActualizarUsuario />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/mis-ordenes" element={<MisOrdenes />} />
        <Route path="/orden/:orderId" element={<VerDetalles />} />
        <Route path="/admin/ordenes" element={<AdminOrdenes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  );
}

export default App;