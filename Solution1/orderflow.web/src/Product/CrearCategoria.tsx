import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CrearCategoria.css'; 

interface CreateCategoryRequest {
    name: string;
    description: string;
}

export const CrearCategoria = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setIsError(false);

        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Error: Token de autenticación no encontrado.');
            setIsError(true);
            setLoading(false);
            return;
        }

        const requestBody: CreateCategoryRequest = { name, description };

        try {
            const response = await fetch('https://localhost:7058/api/v1/categories/createcategory', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                // Tu controlador devuelve Ok("Categoria creada con exito"), por lo que leeremos el texto.
                const successMessage = await response.text(); 
                setMessage(successMessage || 'Categoría creada con éxito.');
                setName('');
                setDescription('');
            } else if (response.status === 401 || response.status === 403) {
                // Por si el token expira o el rol no es correcto
                setMessage('No tienes permisos para realizar esta acción. Redirigiendo a inicio de sesión...');
                setIsError(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                const errorText = await response.text();
                throw new Error(`Fallo al crear la categoría: ${errorText || response.statusText}`);
            }
        } catch (err: any) {
            console.error("Error al crear categoría:", err);
            setMessage(err.message || 'Error de conexión con el servicio.');
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-category-page">
            <button onClick={() => navigate('/products')} className="back-btn">
                ← Volver a Productos
            </button>
            <h2>Crear Nueva Categoría</h2>
            
            {message && (
                <div className={isError ? 'error-message' : 'success-message'}>
                    {message}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="category-form">
                <div className="form-group">
                    <label htmlFor="name">Nombre de la Categoría</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descripción</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'Creando...' : 'Crear Categoría'}
                </button>
            </form>
        </div>
    );
};