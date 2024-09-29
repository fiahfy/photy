import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '~/App'
import ImageProvider from '~/providers/ImageProvider'
import StoreProvider from '~/providers/StoreProvider'
import ThemeProvider from '~/providers/ThemeProvider'
import TrafficLightProvider from '~/providers/TrafficLightProvider'

// biome-ignore lint/style/noNonNullAssertion: <explanation>
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
