import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Index.css';

interface User {
  userId: string;
  userName:string;
  email: string;
  roles: string[];
}

export const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay usuario logueado
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavigateToUser = () => {
    navigate('/gestion-usuarios');
  };

  const handleNavigateToProducts = () => {
    navigate('/productos');
  };

  const handleNavigateToOrders = () => {
    // Si es admin, redirigir al panel de administración de órdenes
    if (isAdmin()) {
      navigate('/admin/ordenes');
    } else {
      navigate('/mis-ordenes');
    }
  };

  // Verificar si el usuario es Admin
  const isAdmin = () => {
    return user?.roles?.some(role => 
      role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrator'
    ) || false;
  };

  if (!user) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="index-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="logo">OrderFlow</h1>
          <div className="nav-right">
            <span className="user-email">Hola, {user.userName}</span>
            <button onClick={handleLogout} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <h1>Bienvenido a OrderFlow</h1>
        <p>Tu plataforma de gestión de pedidos</p>
      </div>

      {/* Cards */}
      <div className="cards-container">
        <div className="card">
          <div className="card-icon">🛍️</div>
          <h3>Productos</h3>
          <p>Explora nuestro catálogo completo de productos disponibles</p>
          <button className="card-btn" onClick={handleNavigateToProducts}>
            Ver Productos
          </button>
        </div>

        <div className="card">
          <div className="card-icon">📦</div>
          <h3>{isAdmin() ? 'Gestionar Órdenes' : 'Mis Órdenes'}</h3>
          <p>
            {isAdmin() 
              ? 'Administra todas las órdenes del sistema y gestiona estados'
              : 'Revisa el estado de tus pedidos y tu historial de compras'
            }
          </p>
          <button className="card-btn" onClick={handleNavigateToOrders}>
            {isAdmin() ? 'Ver Todas las Órdenes' : 'Ver Mis Órdenes'}
          </button>
        </div>

        {/* Card condicional según el rol */}
        {isAdmin() ? (
          <div className="card admin-card">
            <div className="card-icon">👥</div>
            <h3>Gestionar Usuarios</h3>
            <p>Administra usuarios, roles y permisos del sistema</p>
            <button className="card-btn admin-btn" onClick={handleNavigateToUser}>
              Gestionar Usuarios
            </button>
          </div>
        ) : (
          <div className="card">
            <div className="card-icon">👤</div>
            <h3>Mi Perfil</h3>
            <p>Gestiona tu información personal y preferencias</p>
            <button className="card-btn">Ver Perfil</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 OrderFlow. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};