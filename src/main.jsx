import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@radix-ui/themes/styles.css'
import './index.css'
import { Theme } from '@radix-ui/themes'
import App from './App.jsx'
import './lib/theme.js'
import { AuthProvider } from './lib/authContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*
      Важно: не фиксируем светлую тему. Radix будет наследовать текущую тему,
      определяемую через атрибут data-theme на <html> (ThemeManager).
    */}
    <Theme appearance="inherit" accentColor="#1E3A8A" grayColor={`var(--muted)`} radius="medium" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Theme>
  </StrictMode>,
)
