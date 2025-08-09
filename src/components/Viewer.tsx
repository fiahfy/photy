import { Box, Fade, Typography } from '@mui/material'
import {
  type MouseEvent,
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
import usePrevious from '~/hooks/usePrevious'
import useTrafficLight from '~/hooks/useTrafficLight'
import useVisibilityState from '~/hooks/useVisibilityState'

const Viewer = () => {
  const { setVisible, visible } = useTrafficLight()

  const {
    directory,
    fullscreen,
    image,
    message,
    ref,
    size: nativeSize,
    status,
    zoom,
    zoomBy,
  } = useImage()

  const { dropping, ...dropHandlers } = useDrop()

  const {
    visible: controlBarVisible,
    show: showControlBar,
    hide: hideControlBar,
    hideAfter: hideControlBarAfter,
  } = useVisibilityState()

  const [dragOffset, setDragOffset] = useState<{
    x: number
    y: number
  }>()
  const [wrapperSize, setWrapperSize] = useState<{
    height: number
    width: number
  }>()
  const [position, setPosition] = useState<{ x: number; y: number }>()

  const wrapperRef = useRef<HTMLDivElement>(null)

  const size = useMemo(() => {
    if (!nativeSize || !wrapperSize) {
      return undefined
    }
    const { height, width } = nativeSize
    const { height: wrapperHeight, width: wrapperWidth } = wrapperSize
    const ratio = Math.min(wrapperHeight / height, wrapperWidth / width) * zoom
    return {
      height: height * ratio,
      width: width * ratio,
    }
  }, [nativeSize, wrapperSize, zoom])

  const previousSize = usePrevious(size)

  useEffect(
    () => setVisible(fullscreen || controlBarVisible),
    [fullscreen, controlBarVisible, setVisible],
  )

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) {
      return
    }
    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0]
      if (entry) {
        const { height, width } = entry.contentRect
        setWrapperSize({ height, width })
      }
    }
    const observer = new ResizeObserver(handleResize)
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) {
      return
    }
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomBy(e.deltaY * 0.01)
    }
    wrapper.addEventListener('wheel', handleWheel, { passive: false })
    return () => wrapper.removeEventListener('wheel', handleWheel)
  }, [zoomBy])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) {
      return
    }
    if (!position || !previousSize || !size) {
      return
    }
    const left =
      ((wrapper.scrollLeft + position.x) / previousSize.width) * size.width -
      position.x
    const top =
      ((wrapper.scrollTop + position.y) / previousSize.height) * size.height -
      position.y
    wrapper.scrollTo({ left, top })
  }, [position, previousSize, size])

  useEffect(() => {
    let id: number

    const callback = async () => {
      const { x, y } = await window.electronAPI.getCursorPosition()

      const left = window.screenX
      const right = left + window.innerWidth
      const top = window.screenY
      const bottom = top + window.innerHeight

      if (left <= x && x <= right && top <= y && y <= bottom) {
        // noop
      } else {
        hideControlBar()
      }

      id = requestAnimationFrame(callback)
    }

    callback()

    return () => {
      window.cancelAnimationFrame(id)
    }
  }, [hideControlBar])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const wrapper = wrapperRef.current
    if (wrapper) {
      setDragOffset({
        x: wrapper.scrollLeft + e.clientX,
        y: wrapper.scrollTop + e.clientY,
      })
    }
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      showControlBar()
      hideControlBarAfter(2000)
      setPosition({ x: e.clientX, y: e.clientY })
      const wrapper = wrapperRef.current
      if (wrapper && dragOffset) {
        wrapper.scrollLeft = dragOffset.x - e.clientX
        wrapper.scrollTop = dragOffset.y - e.clientY
      }
    },
    [dragOffset, hideControlBarAfter, showControlBar],
  )

  const handleMouseUp = useCallback(() => setDragOffset(undefined), [])

  const handleMouseEnterBar = useCallback(
    () => showControlBar(),
    [showControlBar],
  )

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={wrapperRef}
        sx={{
          alignItems: 'safe center',
          cursor: dragOffset ? 'grabbing' : controlBarVisible ? 'grab' : 'none',
          display: 'flex',
          height: '100%',
          justifyContent: 'safe center',
          overflow: 'auto',
          width: '100%',
          '::-webkit-scrollbar': {
            display: 'none',
          },
        }}
        {...dropHandlers}
      >
        {/* biome-ignore lint/a11y/useAltText: false positive */}
        <img
          ref={ref}
          src={image?.url}
          style={{
            background: 'black',
            display: status === 'loaded' ? 'block' : 'none',
            pointerEvents: 'none',
            ...(size ? { ...size } : {}),
          }}
        />
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
            sx={{ pointerEvents: 'auto' }}
          >
            <ControlBar />
          </Box>
        </Fade>
        <Box onMouseEnter={handleMouseEnterBar} sx={{ pointerEvents: 'auto' }}>
          <SeekBar controlBarVisible={controlBarVisible} />
        </Box>
        <Fade in={visible}>
          <Box sx={{ pointerEvents: 'auto' }}>
            <TitleBar
              onMouseEnter={handleMouseEnterBar}
              title={directory?.name ?? ''}
            />
          </Box>
        </Fade>
      </Box>
    </Box>
  )
}

export default Viewer
