import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './Cart.css';

interface CreateOrderItemRequest {
    productId: string;
    unit: number;
}

interface CreateOrderRequest {
    shippingAddress?: string;
    notes?: string;
    items: CreateOrderItemRequest[];
}

export const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const navigate = useNavigate();

    const handleProceedToCheckout = () => {
        if (cart.length === 0) {
            setError('El carrito está vacío');
            return;
        }
        setShowCheckoutForm(true);
        setError(null);
    };

    const handleCreateOrder = async () => {
        if (!shippingAddress.trim()) {
            setError('La dirección de envío es obligatoria');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Preparar el request según tu estructura exacta
            const orderRequest: CreateOrderRequest = {
                shippingAddress: shippingAddress.trim(),
                notes: notes.trim() || undefined,
                items: cart.map(item => ({
                    productId: item.productId,
                    unit: item.quantity
                }))
            };

            const response = await fetch('https://localhost:7058/api/v1/Orders/Create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderRequest)
            });

            if (!response.ok) {
                if (response.status === 503) {
                    throw new Error('Servicio no disponible. Intente más tarde.');
                }
                
                if (response.status === 401) {
                    throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');
                }

                const errorText = await response.text();
                throw new Error(errorText || 'Error al crear la orden');
            }

            const orderResponse = await response.json();
            console.log('Orden creada exitosamente:', orderResponse);

            // Limpiar carrito y formulario tras éxito
            clearCart();
            setShippingAddress('');
            setNotes('');
            setSuccess(true);

            // Redirigir después de 3 segundos
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (err: any) {
            console.error('Error al crear orden:', err);
            setError(err.message || 'Error al crear la orden');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelCheckout = () => {
        setShowCheckoutForm(false);
        setShippingAddress('');
        setNotes('');
        setError(null);
    };

    if (success) {
        return (
            <div className="cart-page">
                <div className="success-message">
                    <h2>✅ ¡Orden creada exitosamente!</h2>
                    <p>Tu pedido ha sido procesado correctamente.</p>
                    <p>Redirigiendo al inicio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-header">
                <h2>🛒 Mi Carrito</h2>
                <button onClick={() => navigate('/productos')} className="back-btn">
                    ← Volver a Productos
                </button>
            </div>

            {cart.length === 0 ? (
                <div className="empty-cart">
                    <p>Tu carrito está vacío</p>
                    <button onClick={() => navigate('/productos')} className="continue-shopping-btn">
                        Ir a Comprar
                    </button>
                </div>
            ) : (
                <>
                    {!showCheckoutForm ? (
                        <>
                            <div className="cart-items">
                                {cart.map(item => (
                                    <div key={item.productId} className="cart-item">
                                        <div className="item-info">
                                            <h3>{item.name}</h3>
                                            <p className="item-price">${item.price.toFixed(2)} c/u</p>
                                        </div>

                                        <div className="item-controls">
                                            <div className="quantity-controls">
                                                <button 
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="qty-btn"
                                                >
                                                    -
                                                </button>
                                                <span className="quantity">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="qty-btn"
                                                    disabled={item.quantity >= item.stock}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <p className="item-subtotal">
                                                Subtotal: ${(item.price * item.quantity).toFixed(2)}
                                            </p>

                                            <button 
                                                onClick={() => removeFromCart(item.productId)}
                                                className="remove-btn"
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-summary">
                                <div className="summary-content">
                                    <h3>Resumen de Compra</h3>
                                    <div className="summary-line">
                                        <span>Total de productos:</span>
                                        <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                    </div>
                                    <div className="summary-line total">
                                        <span>Total a pagar:</span>
                                        <span>${getTotalPrice().toFixed(2)}</span>
                                    </div>

                                    <div className="summary-actions">
                                        <button 
                                            onClick={clearCart}
                                            className="clear-cart-btn"
                                        >
                                            Vaciar Carrito
                                        </button>
                                        <button 
                                            onClick={handleProceedToCheckout}
                                            className="checkout-btn"
                                        >
                                            Proceder al Pago
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="checkout-form">
                            <h3>Completar Información de Envío</h3>
                            
                            <div className="order-summary-section">
                                <h4>Resumen del Pedido</h4>
                                <div className="order-items-summary">
                                    {cart.map(item => (
                                        <div key={item.productId} className="summary-item">
                                            <span>{item.name} x{item.quantity}</span>
                                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="summary-total">
                                    <strong>Total:</strong>
                                    <strong>${getTotalPrice().toFixed(2)}</strong>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="shippingAddress">
                                    Dirección de Envío <span className="required">*</span>
                                </label>
                                <textarea
                                    id="shippingAddress"
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    placeholder="Ingrese su dirección completa de envío"
                                    rows={3}
                                    className="form-textarea"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes">
                                    Notas Adicionales (opcional)
                                </label>
                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Instrucciones especiales, comentarios, etc."
                                    rows={3}
                                    className="form-textarea"
                                />
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <div className="checkout-actions">
                                <button 
                                    onClick={handleCancelCheckout}
                                    className="cancel-btn"
                                    disabled={loading}
                                >
                                    ← Volver al Carrito
                                </button>
                                <button 
                                    onClick={handleCreateOrder}
                                    className="confirm-order-btn"
                                    disabled={loading || !shippingAddress.trim()}
                                >
                                    {loading ? 'Procesando...' : 'Confirmar Pedido'}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};