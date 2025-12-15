import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './DetalleUsuario.css';

const API_BASE_URL = 'https://localhost:7058/api/usersadmin'; // Base de la ruta del controlador

interface UserDetail {
    id: string;
    userName: string;
    email: string;
    roles: string[];
}

export const DetalleUsuario = () => {
    // Obtener el 'id' de la URL (ruta dinámica)
    const { id } = useParams<{ id: string }>(); 
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) {
            setError("ID de usuario no proporcionado en la URL.");
            setLoading(false);
            return;
        }

        const fetchUserDetail = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // 🔗 La llamada a la API utiliza el ID de la URL
                const response = await fetch(`${API_BASE_URL}/${id}`, { 
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 404) {
                    setError("El usuario no fue encontrado.");
                } else if (!response.ok) {
                    throw new Error(`Fallo al cargar detalles: ${response.statusText}`);
                } else {
                    const data: UserDetail = await response.json();
                    setUser(data);
                    setError(null);
                }
            } catch (err: any) {
                console.error("Error al obtener detalles del usuario:", err);
                setError(err.message || 'Error de conexión con el servicio.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetail();
    }, [id, navigate]); // Dependencia del ID para recargar si cambia

    // 🆕 FUNCIÓN PARA ACTUALIZAR DATOS
    const handleUpdateData = () => {
        // En el futuro, esto podría abrir un modal o navegar a una página de edición.
        alert(`Simulación: Abrir formulario para actualizar datos de ${user?.userName}`);
        // navigate(`/gestion-usuarios/editar/${user?.id}`);
    };

    // 🆕 FUNCIÓN PARA CAMBIAR ROL
    const handleChangeRole = () => {
        // En el futuro, esto abrirá un modal con un selector de rol
        alert(`Simulación: Abrir selector para cambiar el rol de ${user?.userName}`);
    };

    if (loading) {
        return <div className="user-detail-container loading">Cargando detalles del usuario...</div>;
    }

    if (error) {
        return (
            <div className="user-detail-container">
                <h2 className="detail-title">Detalles del Usuario</h2>
                <div className="error-message">Error: {error}</div>
                <button onClick={() => navigate('/gestion-usuarios')} className="back-btn">Volver a Gestión de Usuarios</button>
            </div>
        );
    }

    // Se asume que user existe aquí
    return (
        <div className="user-detail-container">
            <h2 className="detail-title">Detalles del Usuario</h2>
            <button onClick={() => navigate('/gestion-usuarios')} className="back-btn">Volver a Gestión de Usuarios</button>

            <div className="detail-card">
                <h3>Información General</h3>
                <div className="detail-row">
                    <span className="label">ID:</span>
                    <span className="value">{user?.id}</span>
                </div>
                <div className="detail-row">
                    <span className="label">Nombre de Usuario:</span>
                    <span className="value">{user?.userName}</span>
                </div>
                <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">{user?.email}</span>
                </div>
                <div className="detail-row roles-row">
                    <span className="label">Roles:</span>
                    <div className="roles-list">
                        {user?.roles.map(role => (
                            <span key={role} className={`role-badge role-${role.toLowerCase()}`}>
                                {role}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="edit-buttons-group"> 
                    <button 
                        onClick={handleUpdateData} 
                        className="action-btn update-btn"
                        title="Abrir formulario para editar nombre o email"
                    >
                        Actualizar Datos
                    </button>
                    <button 
                        onClick={handleChangeRole} 
                        className="action-btn role-btn"
                        title="Asignar un rol diferente al usuario"
                    >
                        Cambiar Rol
                    </button>
                </div>
            </div>
        </div>
    );
};