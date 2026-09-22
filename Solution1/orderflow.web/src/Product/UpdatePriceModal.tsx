import { useState } from 'react';
import './UpdatePriceModal.css';

interface UpdatePriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    currentPrice: number;
    onPriceUpdated: () => void;
}


export const UpdatePriceModal = ({ 
    isOpen, 
    onClose, 
    productId, 
    productName, 
    currentPrice,
    onPriceUpdated 
}: UpdatePriceModalProps) => {
    const [newPrice, setNewPrice] = useState<number>(currentPrice);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (newPrice <= 0) {
            setError('El precio debe ser mayor a 0');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No estás autenticado');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `https://localhost:7058/api/v1/products/${productId}/updateprice`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        id: productId,
                        price: newPrice 
                    })
                }
            );

            if (response.ok) {
                // Cerrar modal después de 1.5 segundos
                setTimeout(() => {
                    onPriceUpdated();
                    onClose();
                }, 500);
            } else {
                const errorText = await response.text();
                setError(`Error al actualizar precio: ${errorText || response.statusText}`);
            }
        } catch (err: any) {
            console.error('Error:', err);
            setError(err.message || 'Error de conexión con el servicio');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setError(null);
            setSuccessMessage(null);
            setNewPrice(currentPrice);
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Actualizar Precio</h3>
                    <button 
                        className="close-btn" 
                        onClick={handleClose}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <div className="product-info">
                        <p><strong>Producto:</strong> {productName}</p>
                        <p><strong>Precio actual:</strong> ${currentPrice.toFixed(2)}</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="newPrice">Nuevo Precio *</label>
                            <input
                                type="number"
                                id="newPrice"
                                value={newPrice}
                                onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                                step="0.01"
                                min="0.01"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="modal-actions">
                            <button 
                                type="button" 
                                onClick={handleClose} 
                                className="btn-secondary"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Actualizando...' : 'Actualizar Precio'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};