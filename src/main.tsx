import '@fontsource/roboto/300'
import '@fontsource/roboto/400'
import '@fontsource/roboto/500'
import '@fontsource/roboto/700'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '~/App'
import ImageProvider from '~/providers/ImageProvider'
import StoreProvider from '~/providers/StoreProvider'
import ThemeProvider from '~/providers/ThemeProvider'
import TrafficLightProvider from '~/providers/TrafficLightProvider'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
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
