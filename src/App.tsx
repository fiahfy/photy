import { Box, GlobalStyles } from '@mui/material'
import { useEffect, useMemo } from 'react'
import Player from '~/components/Player'
import useTitle from '~/hooks/useTitle'
import useVideo from '~/hooks/useVideo'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectShouldCloseWindowOnEscapeKey,
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

  const { image, moveNext, movePrevious } = useVideo()

  useTitle(image.name)

  useEffect(() => {
    const removeListener = window.electronAPI.addMessageListener((message) => {
      const { type, data } = message
      switch (type) {
        case 'changeFile':
          return dispatch(newWindow(data.file))
        case 'toggleShouldAlwaysShowSeekBar':
          return dispatch(toggleShouldAlwaysShowSeekBar())
        case 'toggleFullscreen':
          return window.electronAPI.toggleFullscreen()
        case 'toggleShouldCloseWindowOnEscapeKey':
          return dispatch(toggleShouldCloseWindowOnEscapeKey())
      }
    })
    return () => removeListener()
  }, [dispatch])

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
      <Player />
    </Box>
  )
}

export default App
