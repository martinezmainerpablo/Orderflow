import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminOrdenes.css';

interface OrderListResponse {
  idOrder: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  userId?: string;
  userName?: string;
}

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | null;

export const AdminOrdenes = () => {
  const [orders, setOrders] = useState<OrderListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>(null);
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, userIdFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Construir URL con parámetros opcionales
      let url = 'https://localhost:7058/api/v1/admin/orders/GetAllOrders';
      const params = new URLSearchParams();
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      if (userIdFilter.trim()) {
        params.append('userId', userIdFilter.trim());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      if (response.status === 403) {
        setError('No tienes permisos de administrador');
        return;
      }

      if (!response.ok) {
        throw new Error('Error al cargar las órdenes');
      }

      const data = await response.json();
      console.log('Órdenes del admin:', data);
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter(null);
    setUserIdFilter('');
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'pending': '#fbbf24',
      'processing': '#3b82f6',
      'shipped': '#8b5cf6',
      'delivered': '#10b981',
      'cancelled': '#ef4444',
    };
    return statusColors[status.toLowerCase()] || '#6b7280';
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado',
    };
    return statusLabels[status.toLowerCase()] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleViewDetails = (orderId: string) => {
    navigate(`/api/v1/admin/orders/${orderId}`);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className="admin-ordenes-container">
      {/* Header */}
      <div className="admin-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Volver
        </button>
        <div className="header-content">
          <h1>Gestión de Órdenes</h1>
          <span className="admin-badge">ADMIN</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-card">
          <h3>🔍 Filtros</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="status-filter">Estado:</label>
              <select
                id="status-filter"
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus || null)}
                className="filter-select"
              >
                <option value="">Todos los estados</option>
                <option value="Pending">Pendiente</option>
                <option value="Processing">Procesando</option>
                <option value="Shipped">Enviado</option>
                <option value="Delivered">Entregado</option>
                <option value="Cancelled">Cancelado</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="user-filter">ID de Usuario:</label>
              <input
                id="user-filter"
                type="text"
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                placeholder="Filtrar por usuario (GUID)"
                className="filter-input"
              />
            </div>

            <div className="filter-actions">
              <button onClick={fetchOrders} className="apply-btn" disabled={loading}>
                {loading ? 'Cargando...' : 'Aplicar Filtros'}
              </button>
              <button onClick={handleClearFilters} className="clear-btn">
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={fetchOrders}>Reintentar</button>
        </div>
      )}

      {/* Estadísticas */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-label">Total Órdenes</span>
            <span className="stat-value">{orders.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-label">Valor Total</span>
            <span className="stat-value">
              {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-label">Entregadas</span>
            <span className="stat-value">
              {orders.filter(o => o.status.toLowerCase() === 'delivered').length}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-label">Pendientes</span>
            <span className="stat-value">
              {orders.filter(o => o.status.toLowerCase() === 'pending').length}
            </span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>No hay órdenes</h2>
          <p>No se encontraron órdenes con los filtros aplicados</p>
          <button onClick={handleClearFilters} className="clear-btn">
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID Orden</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Artículos</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.idOrder}>
                  <td className="order-id-cell">
                    <span className="order-id-short">#{order.idOrder.substring(0, 8)}</span>
                  </td>
                  <td className="user-cell">
                    {order.userName || order.userId?.substring(0, 8) || 'N/A'}
                  </td>
                  <td>
                    <span 
                      className="status-badge-table"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="items-cell">{order.itemCount}</td>
                  <td className="amount-cell">{formatCurrency(order.totalAmount)}</td>
                  <td className="date-cell">{formatDate(order.createdAt)}</td>
                  <td className="actions-cell">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewDetails(order.idOrder)}
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};