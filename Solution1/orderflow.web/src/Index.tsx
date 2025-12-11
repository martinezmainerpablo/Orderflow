import React, { useEffect, useState } from 'react';
import './Index.css';

// --- INTERFAZ PRODUCTO ---
// Ajustada para coincidir con lo que devuelve tu ProductListResponse
interface Product {
  id: string; // Guid en C# es string en JSON
  name: string;
  price: number;
  stock: number;
}

interface HomeProps {
  userEmail?: string;
  onLogout?: () => void;
}

export default function Index({ userEmail = "Usuario", onLogout }: HomeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // 1. OBTENER TOKEN
        // Necesitamos el token guardado en el Login para acceder a rutas [Authorize]
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error("No se encontró token de autenticación. Por favor inicia sesión nuevamente.");
        }

        console.log("Obteniendo productos");

        // 2. PETICIÓN AL BACKEND (Puerto 7223)
        const response = await fetch('https://localhost:7223/api/v1/Products/GetAll', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            // IMPORTANTE: Enviamos el token en el header Authorization
            'Authorization': 'Bearer ${token}'
          }
        });

        // 3. MANEJO DE RESPUESTASa
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          setError(null);
          return;
        }

        // Error 401: No autorizado (Token inválido o expirado)
        if (response.status === 401) {
            setError("Tu sesión ha expirado. Por favor sal y vuelve a entrar.");
            // Opcional: Podrías llamar a onLogout() automáticamente aquí si prefieres
            return;
        }

        // Error 404: "No hay productos disponibles" (según tu controlador)
        if (response.status === 404) {
           setError("No hay productos disponibles en el catálogo.");
           setProducts([]);
           return;
        }

        throw new Error('Error del servidor: ${response.status}');

      } catch (err: any) {
        console.error("Error al cargar productos:", err);
        setError(err.message || 'Error desconocido al cargar productos');
        
        // --- DATOS DEMO (Fallback visual solo si falla la conexión) ---
        // Esto ayuda a que la UI no se vea rota si el backend de productos (7223) está apagado
        // pero el de auth (7058) funcionó.
        setProducts([
            { id: 'demo-1', name: 'Producto Demo (Backend offline)', price: 0, stock: 0 },
        ]);
        // -------------------------------------------------------------
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Se ejecuta una vez al montar el componente

  return (
    <div className="home-container">
      {/* --- NAVBAR --- */}
      <nav className="navbar">
        <div className="nav-left">
          <span className="brand-logo" onClick={() => window.location.reload()}>Orderflow</span>
          <span className="nav-item">Categorías</span>
        </div>

        <div className="nav-right">
          <span className="nav-item">Carrito 🛒</span>
          <div 
            className="user-display" 
            onClick={onLogout} 
            style={{cursor: 'pointer'}} 
            title="Haz click para cerrar sesión"
          >
            👤 {userEmail} (Salir)
          </div>
        </div>
      </nav>

      {/* --- GRID DE PRODUCTOS --- */}
      <div className="products-wrapper">
        
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: '#1e293b' }}>Catálogo de Productos</h2>
        </div>

        {loading && <div className="loading-container">Cargando productos...</div>}
        
        {error && (
            <div style={{
                color: '#b91c1c', 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca', 
                padding: '1rem', 
                borderRadius: '8px', 
                textAlign: 'center', 
                marginBottom: '1rem'
            }}>
                ⚠️ {error}
            </div>
        )}

        {!loading && (
          <div className="products-grid">
            {products.length > 0 ? (
                products.map((product) => {
                const stockValue = Number(product.stock);
                const hasStock = stockValue > 0;

                return (
                    <div key={product.id} className="product-card">
                    <div className="product-info">
                        <h3>{product.name}</h3>
                        
                        <div className="product-detail">
                        <span>Precio:</span>
                        <span className="price-tag">${product.price.toFixed(2)}</span>
                        </div>

                        <div className="product-detail">
                        <span>Stock:</span>
                        {/* Usamos backticks para la clase condicional */}
                        <span className={`stock-tag ${hasStock ? 'stock-ok' : 'stock-low'}`}>
                            {hasStock ? stockValue : 'Agotado'}
                        </span>
                        </div>
                    </div>
                    </div>
                );
                })
            ) : (
                !error && <p>No se encontraron productos.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}