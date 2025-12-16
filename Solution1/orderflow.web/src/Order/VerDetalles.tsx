import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './VerDetalles.css';

interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  unit: number;
  total: number;
}

interface OrderResponse {
  idOrder: string;
  userId: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
}

export const VerDetalles = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`https://localhost:7058/api/v1/orders/getorder/${orderId}`, {
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

      if (response.status === 404) {
        setError('Orden no encontrada');
        return;
      }

      if (response.status === 403) {
        setError('No tienes permiso para ver esta orden');
        return;
      }

      if (!response.ok) {
        throw new Error('Error al cargar los detalles de la orden');
      }

      const data = await response.json();
      console.log('Detalles de la orden:', data);
      setOrder(data);
    } catch (err) {
      console.error('Error al cargar detalles:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;
    
    setCancelling(true);
    setCancelError(null);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`https://localhost:7058/api/v1/Orders/${orderId}/cancel`, {
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
      if (order) {
        setOrder({ ...order, status: 'Cancelled' });
      }
      
      setShowCancelModal(false);
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Orden cancelada exitosamente');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error al cancelar:', err);
      setCancelError(err instanceof Error ? err.message : 'Error al cancelar la orden');
      setTimeout(() => setCancelError(null), 5000);
    } finally {
      setCancelling(false);
    }
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando detalles de la orden...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>⚠️ Error</h2>
          <p>{error || 'No se pudo cargar la orden'}</p>
          <button onClick={() => navigate('/mis-ordenes')} className="back-btn">
            Volver a Mis Órdenes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      {/* Header */}
      <div className="details-header">
        <button onClick={() => navigate('/mis-ordenes')} className="back-btn">
          ← Volver a Mis Órdenes
        </button>
        <h1>Detalles de la Orden</h1>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="success-message-details">
          <span>✓ {successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}>✕</button>
        </div>
      )}

      {/* Cancel Error Message */}
      {cancelError && (
        <div className="error-message-details">
          <span>⚠️ {cancelError}</span>
          <button onClick={() => setCancelError(null)}>✕</button>
        </div>
      )}

      {/* Información principal */}
      <div className="details-container">
        <div className="details-card">
          <div className="card-header">
            <div>
              <h2>Orden #{order.idOrder.substring(0, 8).toUpperCase()}</h2>
              <p className="order-id-full">ID completo: {order.idOrder}</p>
            </div>
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(order.status) }}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>

          <div className="card-section">
            <h3>Información General</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Fecha de Creación:</span>
                <span className="value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="info-item">
                <span className="label">Última Actualización:</span>
                <span className="value">{formatDate(order.updatedAt)}</span>
              </div>
              <div className="info-item">
                <span className="label">Dirección de Envío:</span>
                <span className="value">{order.shippingAddress || 'No especificada'}</span>
              </div>
              {order.notes && (
                <div className="info-item full-width">
                  <span className="label">Notas:</span>
                  <span className="value">{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card-section">
            <h3>Productos ({order.items.length})</h3>
            <div className="products-table">
              <div className="table-header">
                <span>Producto</span>
                <span>Precio Unit.</span>
                <span>Cantidad</span>
                <span>Total</span>
              </div>
              {order.items.map((item) => (
                <div key={item.id} className="table-row">
                  <div className="product-info">
                    <span className="product-name">{item.productName}</span>
                    <span className="product-id">ID: {item.productId.substring(0, 8)}</span>
                  </div>
                  <span className="price">{formatCurrency(item.unitPrice)}</span>
                  <span className="quantity">{item.unit}</span>
                  <span className="total">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-section total-section">
            <div className="total-row">
              <span className="total-label">Total de la Orden:</span>
              <span className="total-amount">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Botones de acción */}
          {order.status.toLowerCase() === 'pending' && (
            <div className="actions-section">
              <button 
                className="cancel-btn"
                onClick={() => setShowCancelModal(true)}
              >
                Cancelar Orden
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Cancelación */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Confirmar Cancelación</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowCancelModal(false)}
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
                onClick={() => setShowCancelModal(false)}
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