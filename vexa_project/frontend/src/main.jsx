import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { SiteProvider } from './context/SiteContext.jsx'
import { applyBrand } from './lib/brand.js'
import './index.css'

applyBrand()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SiteProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </SiteProvider>
    </BrowserRouter>
  </React.StrictMode>
)
