import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CrearProducto.css';

interface Category {
    idCategory: string;
    name: string;
    description: string;
    productCount: number;
}

interface CreateProductRequest {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    categoryName: string;
}

export const CrearProducto = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateProductRequest>({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        categoryId: '',
        categoryName: ''
    });

    // Cargar categorías al montar el componente
    useEffect(() => {
        const fetchCategories = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('https://localhost:7058/api/v1/categories/getallcategory', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data: Category[] = await response.json();
                    console.log('Categorías recibidas:', data);
                    setCategories(data);
                } else {
                    console.error('Error al cargar categorías');
                }
            } catch (err) {
                console.error('Error al obtener categorías:', err);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, [navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value
        }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedCategory = categories.find(cat => cat.idCategory === selectedId);
        
        setFormData(prev => ({
            ...prev,
            categoryId: selectedId,
            categoryName: selectedCategory?.name || ''
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        // Validaciones
        if (!formData.name.trim()) {
            setError('El nombre del producto es obligatorio');
            setLoading(false);
            return;
        }

        if (formData.price <= 0) {
            setError('El precio debe ser mayor a 0');
            setLoading(false);
            return;
        }

        if (formData.stock < 0) {
            setError('El stock no puede ser negativo');
            setLoading(false);
            return;
        }

        if (!formData.categoryId) {
            setError('Debes seleccionar una categoría');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            // Debug: ver qué estamos enviando
            console.log('FormData antes de enviar:', formData);
            
            const response = await fetch('https://localhost:7058/api/v1/Products/Create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSuccessMessage('¡Producto creado con éxito!');
                
                // Resetear formulario
                setFormData({
                    name: '',
                    description: '',
                    price: 0,
                    stock: 0,
                    categoryId: '',
                    categoryName: ''
                });

                // Redirigir después de 2 segundos
                setTimeout(() => {
                    navigate('/productos');
                }, 2000);
            } else {
                const errorText = await response.text();
                setError(`Error al crear producto: ${errorText || response.statusText}`);
            }
        } catch (err: any) {
            console.error('Error:', err);
            setError(err.message || 'Error de conexión con el servicio');
        } finally {
            setLoading(false);
        }
    };

    if (loadingCategories) {
        return <div className="loading">Cargando categorías...</div>;
    }

    return (
        <div className="crear-producto-page">
            <div className="crear-producto-container">
                <h2>Crear Nuevo Producto</h2>
                
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <form onSubmit={handleSubmit} className="producto-form">
                    <div className="form-group">
                        <label htmlFor="name">Nombre del Producto *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Ej: Laptop HP"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Descripción</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Descripción del producto"
                            rows={4}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="price">Precio *</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="stock">Stock *</label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                min="0"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="categoryId">Categoría *</label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleCategoryChange}
                            required
                        >
                            <option value="">Selecciona una categoría</option>
                            {categories.map(category => (
                                <option key={category.idCategory} value={category.idCategory}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={() => navigate('/productos')} 
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
                            {loading ? 'Creando...' : 'Crear Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};