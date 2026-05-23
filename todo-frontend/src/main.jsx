import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // ต้องมีบรรทัดนี้เพื่อเรียกใช้ Tailwind
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)