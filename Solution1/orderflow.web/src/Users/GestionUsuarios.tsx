import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GestionUsuarios.css';

const API_URL = 'https://localhost:7058/api/usersAdmin/all';
const API_DELETE_URL = 'https://localhost:7058/api/usersadmin/delete';

interface UserAdminResponse {
  id: string;
  userName: string;
  email: string;
  nameRol: string;
}

export const GestionUsuarios = () => {
  const [users, setUsers] = useState<UserAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; userName: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401 || response.status === 403) {
          navigate('/'); 
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Fallo al cargar usuarios: ${errorText || response.statusText}`);
        }

        const data: UserAdminResponse[] = await response.json();
        setUsers(data);
        setError(null);
      } catch (err: any) {
        console.error("Error al obtener usuarios:", err);
        setError(err.message || 'Error de conexión con el servicio.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleCreateUser = () => {
    navigate('/gestion-usuarios/crear');
  };

  const handleViewDetails = (userId: string) => {
    navigate(`/gestion-usuarios/${userId}`); 
  };

  const openDeleteModal = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, userName });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`${API_DELETE_URL}/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        alert('No tienes permisos para eliminar usuarios.');
        navigate('/');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al eliminar usuario: ${errorText || response.statusText}`);
      }

      // Eliminar el usuario de la lista local
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
      
      closeDeleteModal();
    } catch (err: any) {
      console.error("Error al eliminar usuario:", err);
      alert(`Error: ${err.message || 'No se pudo eliminar el usuario.'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="user-management-container loading">Cargando lista de usuarios...</div>;
  }

  if (error) {
    return (
      <div className="user-management-container">
        <h2 className="title">Gestión de Usuarios</h2>
        <div className="error-message">Error: {error}</div>
        <button onClick={() => navigate('/')} className="back-btn">Volver al Inicio</button>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <h2 className="title">Gestión de Usuarios</h2>
      <div className="header-actions">
        <button onClick={() => navigate('/')} className="back-btn">Volver al Inicio</button>
        <button onClick={handleCreateUser} className="create-user-btn">
          Crear Usuario
        </button>
      </div>

      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Nombre de Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th className="actions-header">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.userName}</td>
                <td>{user.email}</td>
                <td><span className={`role-badge role-${user.nameRol.toLowerCase()}`}>{user.nameRol}</span></td>
                <td className="actions-cell"> 
                  <button 
                    className="action-btn view-btn"
                    onClick={() => handleViewDetails(user.id)}
                    title="Ver detalles del usuario"
                  >
                    Ver Detalles
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => openDeleteModal(user.id, user.userName)}
                    title="Eliminar usuario permanentemente"
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && <p className="no-users">No se encontraron usuarios registrados.</p>}

      {/* Modal de Confirmación */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Confirmar Eliminación</h3>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de que deseas eliminar al usuario?</p>
              <p className="user-to-delete">
                <strong>{userToDelete.userName}</strong>
              </p>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn cancel-btn" 
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                className="modal-btn confirm-btn" 
                onClick={confirmDeleteUser}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};