import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '~/App'
import { ImageProvider } from '~/contexts/ImageContext'
import { StoreProvider } from '~/contexts/StoreContext'
import { ThemeProvider } from '~/contexts/ThemeContext'
import { TrafficLightProvider } from '~/contexts/TrafficLightContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <ThemeProvider>
        <TrafficLightProvider>
          <ImageProvider>
            <App />
          </ImageProvider>
        </TrafficLightProvider>
      </ThemeProvider>
    </StoreProvider>
  </React.StrictMode>,
)
