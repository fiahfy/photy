import { Box, Fade, Typography } from '@mui/material'
import {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
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

type State = {
  size: { height: number; width: number } | undefined
  status: 'error' | 'loaded' | 'loading'
  url: string | undefined
}

type Action =
  | { type: 'error' }
  | {
      type: 'loaded'
      payload: { size: { height: number; width: number }; url: string }
    }
  | { type: 'loading' }

const reducer = (_state: State, action: Action) => {
  switch (action.type) {
    case 'loaded':
      return {
        ...action.payload,
        status: action.type,
      }
    case 'error':
    case 'loading':
      return { size: undefined, status: action.type, url: undefined }
  }
}

const Viewer = () => {
  const { setVisible, visible } = useTrafficLight()

  const { image, status: fetchStatus, zoom, zoomBy } = useImage()

  const { dropping, ...dropHandlers } = useDrop()

  const [controlBarVisible, setControlBarVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [dragOffset, setDragOffset] = useState<{
    x: number
    y: number
  }>()
  const [{ size: nativeSize, status, url }, dispatch] = useReducer(reducer, {
    size: undefined,
    status: 'loading',
    url: undefined,
  })
  const [wrapperSize, setWrapperSize] = useState<{
    height: number
    width: number
  }>()
  const [position, setPosition] = useState<{ x: number; y: number }>()

  const wrapperRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number>()

  const size = useMemo(() => {
    if (!nativeSize || !wrapperSize) {
      return undefined
    }
    const { height, width } = nativeSize
    const { height: wrapperHeight, width: wrapperWidth } = wrapperSize
    const ratio =
      Math.min(1, Math.min(wrapperHeight / height, wrapperWidth / width)) * zoom
    return {
      height: height * ratio,
      width: width * ratio,
    }
  }, [nativeSize, wrapperSize, zoom])

  const previousSize = usePrevious(size)

  useEffect(
    () => setVisible(controlBarVisible),
    [controlBarVisible, setVisible],
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
      if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        e.preventDefault()
        setPosition({ x: e.clientX, y: e.clientY })
        zoomBy(e.deltaY * 0.01)
      }
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
    ;(async () => {
      if (!image) {
        return
      }
      const size = await (async () => {
        try {
          return await new Promise<{ height: number; width: number }>(
            (resolve, reject) => {
              const img = new Image()
              img.onload = () =>
                resolve({ height: img.height, width: img.width })
              img.onerror = (e) => reject(e)
              img.src = image.url
            },
          )
        } catch (e) {
          return undefined
        }
      })()
      if (size) {
        dispatch({ type: 'loaded', payload: { size, url: image.url } })
      } else {
        dispatch({ type: 'error' })
      }
    })()
  }, [image])

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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ height: '100%', width: '100%' }}
    >
      <Box
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={wrapperRef}
        sx={{
          alignItems: 'safe center',
          cursor: dragOffset
            ? 'grabbing'
            : controlBarVisible
              ? undefined
              : 'none',
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
        {status === 'loaded' && url && size && (
          <img
            src={url}
            style={{
              background: 'black',
              display: 'block',
              height: size.height,
              pointerEvents: 'none',
              width: size.width,
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
