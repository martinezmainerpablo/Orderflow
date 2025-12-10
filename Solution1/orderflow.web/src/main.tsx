import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// IMPORTANTE: Esta línea carga tus variables de color (--deep-twilight, etc.)
import './CSS/colores.css' 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)