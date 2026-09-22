import { useState } from 'react';
import './UpdateStockModal.css';

interface UpdateStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    currentStock: number;
    onStockUpdated: () => void;
}


export const UpdateStockModal = ({ 
    isOpen, 
    onClose, 
    productId, 
    productName, 
    currentStock,
    onStockUpdated 
}: UpdateStockModalProps) => {
    const [newStock, setNewStock] = useState<number>(currentStock);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (newStock < 0) {
            setError('El stock no puede ser negativo');
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
                `https://localhost:7058/api/v1/products/${productId}/updatestock`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        id: productId,
                        stock: newStock 
                    })
                }
            );

            if (response.ok) {
                   
                // Cerrar modal después de 5 segundos
                setTimeout(() => {
                    onStockUpdated();
                    onClose();
                }, 500);
            } else {
                const errorText = await response.text();
                setError(`Error al actualizar stock: ${errorText || response.statusText}`);
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
            setNewStock(currentStock);
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Actualizar Stock</h3>
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
                        <p><strong>Stock actual:</strong> {currentStock} unidades</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="newStock">Nuevo Stock *</label>
                            <input
                                type="number"
                                id="newStock"
                                value={newStock}
                                onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                                min="0"
                                required
                                disabled={loading}
                            />
                            <small>Cantidad disponible del producto</small>
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
                                {loading ? 'Actualizando...' : 'Actualizar Stock'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};