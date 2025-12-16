import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './DetalleUsuario.css';

const API_BASE_URL = 'https://localhost:7058/api/usersadmin';
const API_ROLES_URL = 'https://localhost:7058/api/roles/all';
const API_UPDATE_ROLE_URL = 'https://localhost:7058/api/usersadmin/RemoveRol';

interface UserDetail {
    id: string;
    userName: string;
    email: string;
    roles: string[];
}

interface RoleResponse {
    id: string;
    name: string;
}

export const DetalleUsuario = () => {
    const { id } = useParams<{ id: string }>(); 
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [isChangingRole, setIsChangingRole] = useState(false);
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
    }, [id, navigate]);

    const handleUpdateData = () => {
            
            if (id) {
                navigate(`/gestion-usuarios/actualizar/${id}`); 
            } else {
                alert('Error: ID de usuario no disponible para la actualización.');
            }
        };

    const openRoleModal = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(API_ROLES_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al cargar roles');
            }

            const data: RoleResponse[] = await response.json();
            const roleNames = data.map(r => r.name);
            setAvailableRoles(roleNames);
            
            // Seleccionar el rol actual por defecto
            if (user?.roles && user.roles.length > 0) {
                setSelectedRole(user.roles[0]);
            } else if (roleNames.length > 0) {
                setSelectedRole(roleNames[0]);
            }
            
            setShowRoleModal(true);
        } catch (err: any) {
            console.error("Error al cargar roles:", err);
            alert('Error al cargar los roles disponibles');
        }
    };

    const closeRoleModal = () => {
        setShowRoleModal(false);
        setSelectedRole('');
    };

const confirmChangeRole = async () => {
  if (!user || !selectedRole) return;

  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
    return;
  }

  setIsChangingRole(true);

  try {
    console.log('🔍 Cambiando rol a:', selectedRole);
    console.log('🔍 URL:', `${API_UPDATE_ROLE_URL}/${id}`);
    
    const response = await fetch(`${API_UPDATE_ROLE_URL}/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rolName: selectedRole }),
    });

    console.log('🔍 Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('🔍 Error Response:', errorText);
      throw new Error(`Error al cambiar el rol: ${errorText}`);
    }

    const result = await response.text();
    console.log('✅ Success:', result);

    // Actualizar el estado local
    setUser(prevUser => prevUser ? { ...prevUser, roles: [selectedRole] } : null);
    
    closeRoleModal();
  } catch (err: any) {
    console.error("❌ Error completo:", err);
    alert(`Error: ${err.message || 'No se pudo cambiar el rol'}`);
  } finally {
    setIsChangingRole(false);
  }
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
                        onClick={openRoleModal} 
                        className="action-btn role-btn"
                        title="Asignar un rol diferente al usuario"
                    >
                        Cambiar Rol
                    </button>
                </div>
            </div>

            {/* Modal de Cambiar Rol */}
            {showRoleModal && (
                <div className="modal-overlay" onClick={closeRoleModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🔄 Cambiar Rol de Usuario</h3>
                        </div>
                        <div className="modal-body">
                            <p>Selecciona el nuevo rol para <strong>{user?.userName}</strong>:</p>
                            
                            <div className="current-role-info">
                                <span>Rol actual: </span>
                                {user?.roles.map(role => (
                                    <span key={role} className={`role-badge role-${role.toLowerCase()}`}>
                                        {role}
                                    </span>
                                ))}
                            </div>

                            <div className="role-select-group">
                                <label htmlFor="roleSelect">Nuevo Rol:</label>
                                <select
                                    id="roleSelect"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    disabled={isChangingRole}
                                    className="role-select"
                                >
                                    {availableRoles.map(role => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="modal-btn cancel-btn" 
                                onClick={closeRoleModal}
                                disabled={isChangingRole}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="modal-btn confirm-btn" 
                                onClick={confirmChangeRole}
                                disabled={isChangingRole}
                            >
                                {isChangingRole ? 'Cambiando...' : 'Confirmar Cambio'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};