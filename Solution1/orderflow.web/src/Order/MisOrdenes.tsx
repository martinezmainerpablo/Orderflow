import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MisOrdenes.css';

interface OrderListResponse {
  idOrder: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

export const MisOrdenes = () => {
  const [orders, setOrders] = useState<OrderListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://localhost:7058/api/v1/orders/getallorders', {
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

      if (!response.ok) {
        throw new Error('Error al cargar las órdenes');
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);
      setOrders(data);
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    
    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`https://localhost:7058/api/v1/Orders/${selectedOrderId}/cancel`, {
        method: 'POST',
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

      if (!response.ok) {
        throw new Error('Error al cancelar la orden');
      }

      const result = await response.json();
      console.log('Orden cancelada:', result);
      
      // Actualizar el estado local
      setOrders(orders.map(order => 
        order.idOrder === selectedOrderId 
          ? { ...order, status: 'Cancelled' }
          : order
      ));
      
      setShowCancelModal(false);
      setSelectedOrderId(null);
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Orden cancelada exitosamente');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error al cancelar:', err);
      setError(err instanceof Error ? err.message : 'Error al cancelar la orden');
      setTimeout(() => setError(null), 5000);
    } finally {
      setCancelling(false);
    }
  };

  const openCancelModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrderId(null);
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
    navigate(`/orden/${orderId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className="ordenes-container">
      {/* Header */}
      <div className="ordenes-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Volver
        </button>
        <h1>Mis Órdenes</h1>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <span>✓ {successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}>✕</button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Orders List */}
      {!error && orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>No tienes órdenes aún</h2>
          <p>Tus pedidos aparecerán aquí una vez que realices una compra</p>
          <button onClick={() => navigate('/productos')} className="shop-btn">
            Ver Productos
          </button>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.idOrder} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Orden #{order.idOrder ? order.idOrder.substring(0, 8) : 'N/A'}</h3>
                  <p className="order-date">{order.createdAt ? formatDate(order.createdAt) : 'Fecha no disponible'}</p>
                </div>
                <span 
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status || 'pending') }}
                >
                  {getStatusLabel(order.status || 'pending')}
                </span>
              </div>

              <div className="order-details">
                <div className="detail-item">
                  <span className="detail-label">Artículos:</span>
                  <span className="detail-value">{order.itemCount || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total:</span>
                  <span className="detail-value total">{formatCurrency(order.totalAmount || 0)}</span>
                </div>
              </div>

              <div className="order-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => handleViewDetails(order.idOrder)}
                >
                  Ver Detalles
                </button>
                {order.status.toLowerCase() === 'pending' && (
                  <button 
                    className="btn-danger"
                    onClick={() => openCancelModal(order.idOrder)}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmación de Cancelación */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={closeCancelModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Confirmar Cancelación</h2>
              <button 
                className="close-btn" 
                onClick={closeCancelModal}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro que deseas cancelar esta orden?</p>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={closeCancelModal}
                disabled={cancelling}
              >
                No, mantener orden
              </button>
              <button 
                className="btn-danger"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelando...' : 'Sí, cancelar orden'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};