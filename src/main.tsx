import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AudioProvider } from './audio/audioProvider.tsx';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AudioProvider>
      <App />
    </AudioProvider>
  </StrictMode>,
)