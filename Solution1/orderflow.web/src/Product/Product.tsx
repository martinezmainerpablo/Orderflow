import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './Product.css';

interface ProductListResponse {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
}

interface User {
    userId: string;
    email: string;
    roles: string[];
}

export const Products = () => {
    const [products, setProducts] = useState<ProductListResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const { addToCart, getTotalItems } = useCart();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const fetchProducts = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('https://localhost:7058/api/v1/products/getall/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 404) {
                    setError('No hay productos disponibles.');
                    setProducts([]);
                } else if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Fallo al cargar productos: ${errorText || response.statusText}`);
                } else {
                    const data: ProductListResponse[] = await response.json();
                    setProducts(data);
                }
            } catch (err: any) {
                console.error("Error al obtener productos:", err);
                setError(err.message || 'Error de conexión con el servicio.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [navigate]);

    const isAdmin = () => {
        return user?.roles?.some(role => 
            role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrator'
        ) || false;
    };

    const handleCreateProduct = () => {
        console.log('Crear producto');
    };

    const handleCreateCategory = () => {
        console.log('Crear categoría');
    };

    const handleUpdateStock = (productId: string) => {
        console.log('Actualizar stock del producto:', productId);
    };

    const handleUpdatePrice = (productId: string) => {
        console.log('Actualizar precio del producto:', productId);
    };

    const handleAddToCart = (product: ProductListResponse) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock
        });
    };

    if (loading) {
        return <div className="loading">Cargando productos...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="products-page">
            <div className="products-header">
                <h2>Catálogo de Productos</h2>
                <div className="header-buttons">
                    <button onClick={() => navigate('/')} className="back-btn">
                        Volver al Inicio
                    </button>
                    
                    {/* Botón de carrito solo para Users */}
                    {!isAdmin() && (
                        <button onClick={() => navigate('/cart')} className="cart-badge-btn">
                            🛒 Carrito ({getTotalItems()})
                        </button>
                    )}
                    
                    {isAdmin() && (
                        <>
                            <button onClick={handleCreateProduct} className="admin-btn create-product-btn">
                                + Crear Producto
                            </button>
                            <button onClick={handleCreateCategory} className="admin-btn create-category-btn">
                                + Crear Categoría
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            <div className="product-list">
                {products.map(product => (
                    <div key={product.id} className="product-card">
                        <h3>{product.name}</h3>
                        <p className="product-description">{product.description}</p>
                        <p className="product-price">Precio: ${product.price.toFixed(2)}</p>
                        <p className="product-stock">Stock: {product.stock}</p>
                        
                        <div className="product-actions">
                            {isAdmin() ? (
                                <>
                                    <button 
                                        onClick={() => handleUpdateStock(product.id)} 
                                        className="action-btn stock-btn"
                                    >
                                        📦 Actualizar Stock
                                    </button>
                                    <button 
                                        onClick={() => handleUpdatePrice(product.id)} 
                                        className="action-btn price-btn"
                                    >
                                        💰 Actualizar Precio
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => handleAddToCart(product)} 
                                    className="action-btn cart-btn"
                                    disabled={product.stock === 0}
                                >
                                    {product.stock === 0 ? '❌ Sin Stock' : '🛒 Añadir al Carrito'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && !error && (
                <p className="no-products">No hay productos disponibles en este momento.</p>
            )}
        </div>
    );
};