import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ActualizarUsuario.css'; // Crearás este CSS más tarde

const API_BASE_URL = 'https://localhost:7058/api/usersadmin';
const API_UPDATE_URL = `${API_BASE_URL}/Update`; // La base para la llamada PUT
// Endpoint de detalles ya está cubierto por API_BASE_URL/{id}

// 📌 Request que se envía al backend para la actualización (coincide con tu UserAdminUpdateRequest)
interface UserUpdateRequest {
  userName: string;
  email: string;
  password?: string; // La contraseña es opcional si el backend no la requiere forzosamente en el PUT
}

// 📌 Detalle del usuario que se recibe del GET
interface UserDetailResponse {
    id: string;
    userName: string;
    email: string;
    roles: string[];
}

export const ActualizarUsuario = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<UserUpdateRequest>({
    userName: '',
    email: '',
    password: '',
  });
  
  const [loadingInitial, setLoadingInitial] = useState(true); // Carga inicial de datos
  const [loadingUpdate, setLoadingUpdate] = useState(false);  // Carga al enviar el formulario
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string[] } | null>(null);

  // 1. Cargar datos actuales del usuario
  useEffect(() => {
    if (!id) {
      setError("ID de usuario no proporcionado.");
      setLoadingInitial(false);
      return;
    }

    const fetchUserDetails = async () => {
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
          const data: UserDetailResponse = await response.json();
          // Llenar el formulario con los datos actuales, excepto la contraseña
          setFormData({
            userName: data.userName,
            email: data.email,
            password: '', 
          });
          setError(null);
        }
      } catch (err: any) {
        console.error("Error al obtener detalles:", err);
        setError(err.message || 'Error de conexión.');
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchUserDetails();
  }, [id, navigate]);


  // 2. Manejo de cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Enviar actualización (Método PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingUpdate(true);
    setStatusMessage(null);
    
    // Asegurarse de enviar solo los campos que cambian (o el body completo)
    // El backend requiere UserName, Email y Password, así que enviamos todo.
    const payload = {
        userName: formData.userName,
        email: formData.email,
        password: formData.password || '', // Si está vacío, enviar vacío para que el backend lo maneje
    };

    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
        return;
    }

    try {
      // 💥 USO DEL MÉTODO PUT Y LA RUTA CORRECTA 💥
      const response = await fetch(`${API_UPDATE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatusMessage({ type: 'success', message: ['Usuario actualizado con éxito.'] });
        // Opcional: Redirigir al detalle después de un éxito
        // setTimeout(() => navigate(`/gestion-usuarios/detalle/${id}`), 2000); 

      } else if (response.status === 400) {
        // Manejar errores de validación (400 Bad Request)
        const errorData = await response.json();
        let errors: string[] = [];
        
        // Asumiendo que el backend devuelve errores como un array de strings/objetos
        if (Array.isArray(errorData)) {
            errors = errorData.map(err => typeof err === 'string' ? err : JSON.stringify(err));
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
            errors = errorData.errors.map((e: any) => e.description || e.ErrorMessage || e.Message || 'Error de validación desconocido.');
        } else if (typeof errorData === 'string') {
            errors = [errorData];
        } else {
             errors = ['Fallo de validación. Verifique la información e intente de nuevo.'];
        }
        
        setStatusMessage({ type: 'error', message: errors });

      } else if (response.status === 404) {
        setStatusMessage({ type: 'error', message: ['Error: Usuario no encontrado.'] });
      } else {
        throw new Error(`Fallo en la actualización (Código: ${response.status})`);
      }
    } catch (err: any) {
      console.error("Error al actualizar usuario:", err);
      setStatusMessage({ type: 'error', message: [err.message || 'Error de conexión con el servicio.'] });
    } finally {
      setLoadingUpdate(false);
    }
  };


  // 4. Renderizado

  if (loadingInitial) {
    return <div className="update-user-container loading">Cargando datos del usuario...</div>;
  }

  if (error) {
    return (
        <div className="update-user-container">
            <h2 className="update-title">Actualizar Usuario</h2>
            <div className="error-message">Error: {error}</div>
            <button onClick={() => navigate('/gestion-usuarios')} className="back-btn">Volver a Gestión</button>
        </div>
    );
  }

  return (
    <div className="update-user-container">
      <h2 className="update-title">Actualizar Usuario: {formData.userName}</h2>
      <button onClick={() => navigate(`/gestion-usuarios/detalle/${id}`)} className="back-btn">Volver a Detalles</button>

      <form onSubmit={handleSubmit} className="update-form">
        
        {/* Nombre de Usuario */}
        <div className="form-group">
          <label htmlFor="userName">Nombre de Usuario:</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            required
            disabled={loadingUpdate}
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={loadingUpdate}
          />
        </div>

        {/* Contraseña (El backend la requiere y actualiza) */}
        <div className="form-group">
          <label htmlFor="password">Nueva Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            // Importante: Requerir la contraseña solo si tu backend lo exige en el PUT.
            // Si el PUT debe actualizar la contraseña, la pones como requerida.
            // Si solo actualiza si se proporciona, la dejas opcional. La he dejado requerida para coincidir con tu controlador que siempre la actualiza.
            required 
            placeholder="Introduce la nueva contraseña o déjala si el backend lo permite"
            disabled={loadingUpdate}
          />
          <small className="help-text">La contraseña es obligatoria para actualizar el usuario (el backend la reemplaza).</small>
        </div>
        
        {/* Mensaje de Estado */}
        {statusMessage && (
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.message.map((msg, index) => (
                <p key={index}>{msg}</p>
            ))}
          </div>
        )}

        {/* Botón de Envío */}
        <button type="submit" className="submit-btn" disabled={loadingUpdate}>
          {loadingUpdate ? 'Actualizando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};