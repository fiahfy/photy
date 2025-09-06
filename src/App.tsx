import { Box, GlobalStyles } from '@mui/material'
import { useEffect, useMemo } from 'react'
import Viewer from '~/components/Viewer'
import useImage from '~/hooks/useImage'
import useTitle from '~/hooks/useTitle'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectShouldQuitAppWithEscapeKey,
  setDefaultViewMode,
  toggleShouldAlwaysShowSeekBar,
  toggleShouldQuitAppWithEscapeKey,
} from '~/store/settings'
import { createContextMenuHandler } from '~/utils/context-menu'

const App = () => {
  const shouldQuitAppWithEscapeKey = useAppSelector(
    selectShouldQuitAppWithEscapeKey,
  )
  const dispatch = useAppDispatch()

  const { directory, moveNext, movePrevious, resetZoom, zoomIn, zoomOut } =
    useImage()

  useTitle(directory?.name ?? '')

  useEffect(() => {
    const removeListener = window.messageAPI.onMessage((message) => {
      const { type, data } = message
      switch (type) {
        case 'resetZoom':
          return resetZoom()
        case 'setDefaultViewMode':
          return dispatch(
            setDefaultViewMode({ defaultViewMode: data.defaultViewMode }),
          )
        case 'toggleFullscreen':
          return window.windowAPI.toggleFullscreen()
        case 'toggleShouldAlwaysShowSeekBar':
          return dispatch(toggleShouldAlwaysShowSeekBar())
        case 'toggleShouldQuitAppWithEscapeKey':
          return dispatch(toggleShouldQuitAppWithEscapeKey())
        case 'zoomIn':
          return zoomIn()
        case 'zoomOut':
          return zoomOut()
      }
    })
    return () => removeListener()
  }, [dispatch, resetZoom, zoomIn, zoomOut])

  useEffect(() => {
    const removeListener = window.windowAPI.onFocusChange((focused) => {
      if (focused) {
        window.applicationMenuAPI.update({})
      }
    })
    return () => removeListener()
  }, [])

  useEffect(() => {
    ;(async () => {
      const focused = await window.windowAPI.isFocused()
      if (focused) {
        window.applicationMenuAPI.update({})
      }
    })()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          return moveNext()
        case 'ArrowLeft':
          e.preventDefault()
          return movePrevious()
        case 'ArrowRight':
          e.preventDefault()
          return moveNext()
        case 'ArrowUp':
          e.preventDefault()
          return movePrevious()
        case 'Escape':
          e.preventDefault()
          if (shouldQuitAppWithEscapeKey) {
            return window.electronAPI.quit()
          }
          return window.windowAPI.exitFullscreen()
        case 'f':
          e.preventDefault()
          return window.windowAPI.toggleFullscreen()
      }
    }
    document.body.addEventListener('keydown', handler)
    return () => document.body.removeEventListener('keydown', handler)
  }, [moveNext, movePrevious, shouldQuitAppWithEscapeKey])

  const handleContextMenu = useMemo(() => createContextMenuHandler(), [])

  return (
    <Box
      component="main"
      onContextMenu={handleContextMenu}
      sx={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <GlobalStyles styles={{ 'html, body, #root': { height: '100%' } }} />
      <Viewer />
    </Box>
  )
}

export default App
