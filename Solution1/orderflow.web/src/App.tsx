import React, { useState } from 'react';
// Asegúrate de que las rutas sean correctas según tu estructura de carpetas
import Login from './Login';
import Register from './Register';
import Home from './Index';
import './Index.css';

type ViewState = 'login' | 'register' | 'home';

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('login');

  const handleLogin = (email: string) => {
    setUser(email);
    setCurrentView('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  // Renderizado condicional basado en la vista actual
  if (user && currentView === 'home') {
    return <Home userEmail={user} onLogout={handleLogout} />;
  }

  if (currentView === 'register') {
    return (
      <Register 
        onRegister={handleLogin} 
        onSwitchToLogin={() => setCurrentView('login')} 
      />
    );
  }

  // Por defecto: Login
  return (
    <Login 
      onLogin={handleLogin} 
      onSwitchToRegister={() => setCurrentView('register')} 
    />
  );
}