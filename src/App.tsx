import { Box, GlobalStyles } from '@mui/material'
import { useEffect, useMemo } from 'react'
import Viewer from '~/components/Viewer'
import useImage from '~/hooks/useImage'
import useTitle from '~/hooks/useTitle'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectShouldCloseWindowOnEscapeKey,
  setViewModeOnOpen,
  toggleShouldAlwaysShowSeekBar,
  toggleShouldCloseWindowOnEscapeKey,
} from '~/store/settings'
import { newWindow } from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'

const App = () => {
  const shouldCloseWindowOnEscapeKey = useAppSelector(
    selectShouldCloseWindowOnEscapeKey,
  )
  const dispatch = useAppDispatch()

  const { directory, moveNext, movePrevious, resetZoom, zoomIn, zoomOut } =
    useImage()

  useTitle(directory?.name ?? '')

  useEffect(() => {
    const removeListener = window.electronAPI.addMessageListener((message) => {
      const { type, data } = message
      switch (type) {
        case 'changeFile':
          return dispatch(newWindow(data.file))
        case 'resetZoom':
          return resetZoom()
        case 'setViewModeOnOpen':
          return dispatch(
            setViewModeOnOpen({ viewModeOnOpen: data.viewModeOnOpen }),
          )
        case 'toggleFullscreen':
          return window.electronAPI.toggleFullscreen()
        case 'toggleShouldAlwaysShowSeekBar':
          return dispatch(toggleShouldAlwaysShowSeekBar())
        case 'toggleShouldCloseWindowOnEscapeKey':
          return dispatch(toggleShouldCloseWindowOnEscapeKey())
        case 'zoomIn':
          return zoomIn()
        case 'zoomOut':
          return zoomOut()
      }
    })
    return () => removeListener()
  }, [dispatch, resetZoom, zoomIn, zoomOut])

  useEffect(() => {
    const handler = () => window.electronAPI.updateApplicationMenu({})
    handler()
    window.addEventListener('focus', handler)
    return () => window.removeEventListener('focus', handler)
  }, [])

  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          return movePrevious()
        case 'ArrowRight':
          e.preventDefault()
          return moveNext()
        case 'ArrowUp':
          e.preventDefault()
          return movePrevious()
        case 'ArrowDown':
          e.preventDefault()
          return moveNext()
        case 'Escape':
          e.preventDefault()
          if (shouldCloseWindowOnEscapeKey) {
            return await window.electronAPI.closeWindow()
          } else {
            return await window.electronAPI.exitFullscreen()
          }
        case 'f':
          e.preventDefault()
          return await window.electronAPI.toggleFullscreen()
      }
    }
    document.body.addEventListener('keydown', handler)
    return () => document.body.removeEventListener('keydown', handler)
  }, [moveNext, movePrevious, shouldCloseWindowOnEscapeKey])

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
