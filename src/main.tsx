import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App'
import './index.css'
import { loadAndWarmupModels } from './models/mediapipeAction'

async function initializeApp() {
  await loadAndWarmupModels()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

initializeApp()
