import { Box, Fade, Typography } from '@mui/material'
import {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import ControlBar from '~/components/ControlBar'
import DroppableMask from '~/components/DroppableMask'
import SeekBar from '~/components/SeekBar'
import TitleBar from '~/components/TitleBar'
import useDrop from '~/hooks/useDrop'
import useImage from '~/hooks/useImage'
import useTrafficLight from '~/hooks/useTrafficLight'

const Viewer = () => {
  const { setVisible, visible } = useTrafficLight()

  const { image, status: fetchStatus } = useImage()

  const { dropping, ...dropHandlers } = useDrop()

  const [controlBarVisible, setControlBarVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [dragOffset, setDragOffset] = useState<{
    x: number
    y: number
  }>()
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading',
  )

  const wrapperRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number>()

  useEffect(() => {
    setVisible(controlBarVisible)
  }, [controlBarVisible, setVisible])

  useEffect(() => {
    ;(async () => {
      setStatus('loading')
      const success = await (async () => {
        if (!image?.url) {
          return true
        }
        try {
          await new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(undefined)
            img.onerror = (e) => reject(e)
            img.src = image.url
          })
          return true
        } catch (e) {
          return false
        }
      })()
      setStatus(success ? 'loaded' : 'error')
    })()
  }, [image?.url])

  const message = useMemo(() => {
    switch (fetchStatus) {
      case 'loading':
        return 'Loading...'
      case 'error':
        return 'Failed to load.'
      default:
        switch (status) {
          case 'loading':
            return 'Loading...'
          case 'error':
            return 'Failed to load.'
          default:
            return undefined
        }
    }
  }, [fetchStatus, status])

  const clearTimer = useCallback(() => window.clearTimeout(timer.current), [])

  const resetTimer = useCallback(
    (hovered: boolean) => {
      setControlBarVisible(true)
      clearTimer()
      if (hovered) {
        return
      }
      timer.current = window.setTimeout(() => setControlBarVisible(false), 2000)
    },
    [clearTimer],
  )

  useEffect(() => {
    if (hovered) {
      resetTimer(hovered)
    }
  }, [hovered, resetTimer])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
      const wrapper = wrapperRef.current
      if (wrapper) {
        setDragOffset({
          x: wrapper.scrollLeft + e.clientX,
          y: wrapper.scrollTop + e.clientY,
        })
      }
    }
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      resetTimer(hovered)
      const wrapper = wrapperRef.current
      if (wrapper && dragOffset) {
        wrapper.scrollLeft = dragOffset.x - e.clientX
        wrapper.scrollTop = dragOffset.y - e.clientY
      }
    },
    [dragOffset, hovered, resetTimer],
  )

  const handleMouseUp = useCallback(() => setDragOffset(undefined), [])

  const handleMouseEnter = useCallback(
    () => resetTimer(hovered),
    [hovered, resetTimer],
  )

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (
      e.clientX < 0 ||
      e.clientX > window.innerWidth ||
      e.clientY < 0 ||
      e.clientY > window.innerHeight
    ) {
      setDragOffset(undefined)
      setControlBarVisible(false)
    }
  }, [])

  const handleMouseEnterBar = useCallback(() => {
    setHovered(true)
    resetTimer(true)
  }, [resetTimer])

  const handleMouseLeaveBar = useCallback(() => {
    setHovered(false)
    resetTimer(false)
  }, [resetTimer])

  return (
    <Box
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      sx={{ height: '100%', width: '100%' }}
      {...dropHandlers}
    >
      <Box
        ref={wrapperRef}
        sx={{
          alignItems: 'center',
          cursor: dragOffset
            ? 'grabbing'
            : controlBarVisible
            ? undefined
            : 'none',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          overflow: 'auto',
          width: '100%',
          '::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {status === 'loaded' && image && (
          <img
            src={image.url}
            style={{
              background: 'black',
              display: 'block',
              maxHeight: '100%',
              maxWidth: '100%',
            }}
          />
        )}
      </Box>
      <Box
        sx={{
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          position: 'absolute',
        }}
      >
        {message && (
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              inset: 0,
              justifyContent: 'center',
              position: 'absolute',
            }}
          >
            <Typography variant="caption">{message}</Typography>
          </Box>
        )}
        <DroppableMask dropping={dropping} />
        <Fade in={controlBarVisible}>
          <Box
            onMouseEnter={handleMouseEnterBar}
            onMouseLeave={handleMouseLeaveBar}
            sx={{ pointerEvents: 'auto' }}
          >
            <ControlBar />
          </Box>
        </Fade>
        <Box
          onMouseEnter={handleMouseEnterBar}
          onMouseLeave={handleMouseLeaveBar}
          sx={{ pointerEvents: 'auto' }}
        >
          <SeekBar controlBarVisible={controlBarVisible} />
        </Box>
        <Fade in={visible}>
          <Box sx={{ pointerEvents: 'auto' }}>
            <TitleBar />
          </Box>
        </Fade>
      </Box>
    </Box>
  )
}

export default Viewer
