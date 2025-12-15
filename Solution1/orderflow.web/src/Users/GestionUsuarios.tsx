import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GestionUsuarios.css'; // Importamos los estilos

const API_URL = 'https://localhost:7058/api/usersAdmin/all';

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
          // Si no es Admin o el token expiró
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
      <button onClick={() => navigate('/')} className="back-btn">Volver al Inicio</button>

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
                        //onClick={() => handleViewDetails(user.id)}
                        title="Ver detalles del usuario"
                    >
                        Ver Detalles
                    </button>
                    <button 
                        className="action-btn delete-btn"
                        //onClick={() => handleDeleteUser(user.id, user.userName)}
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
    </div>
  );
};