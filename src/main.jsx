import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  )
} catch (err) {
  console.error("OmniStock Root Mounting Exception:", err);
}
