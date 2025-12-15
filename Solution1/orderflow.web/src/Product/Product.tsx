import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Product.css';

// 🛠️ DTOs para la respuesta de la API (Ajusta según tu backend)
interface ProductListResponse {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
}

export const Products = () => {
    const [products, setProducts] = useState<ProductListResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
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
                        'Authorization': `Bearer ${token}`, // 🔑 Usar el token para la autorización
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 404) {
                    setError('No hay productos disponibles.');
                    setProducts([]);
                } else if (!response.ok) {
                    // Manejar otros errores HTTP (ej. 401 Unauthorized, 500 Internal Server Error)
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

    if (loading) {
        return <div className="loading">Cargando productos...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="products-page">
            <h2>Catálogo de Productos</h2>
            <button onClick={() => navigate('/')}>Volver al Inicio</button>
            
            <div className="product-list">
                {products.map(product => (
                    <div key={product.id} className="product-card">
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p>Precio: ${product.price.toFixed(2)}</p>
                        <p>Stock: {product.stock}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};