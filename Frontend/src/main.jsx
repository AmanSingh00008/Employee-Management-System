import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const savedTheme = localStorage.getItem("workforcehub-theme");
document.documentElement.classList.toggle("dark", savedTheme === "dark");
document.documentElement.style.colorScheme = savedTheme === "dark" ? "dark" : "light";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
