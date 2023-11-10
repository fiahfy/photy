import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAppSelector } from '~/store'
import { selectFile } from '~/store/window'

type File = { name: string; path: string; url: string }

export const VideoContext = createContext<
  | {
      file: File
      fullscreen: boolean
      message: string | undefined
      resetZoom: () => void
      toggleFullscreen: () => void
      zoom: number
      zoomBy: (value: number) => void
      zoomIn: () => void
      zoomOut: () => void
    }
  | undefined
>(undefined)

type Props = { children: ReactNode }

export const VideoProvider = (props: Props) => {
  const { children } = props
  const file = useAppSelector(selectFile)
  const [fullscreen, setFullscreen] = useState(false)
  const [state] = useState('loading')
  const [zoom, setZoom] = useState(1)

  const message = useMemo(() => {
    switch (state) {
      case 'loading':
        return 'Loading...'
      case 'error':
        return 'Failed to load.'
      default:
        return undefined
    }
  }, [state])

  useEffect(() => {
    const removeListener =
      window.electronAPI.addFullscreenListener(setFullscreen)
    return () => removeListener()
  }, [])

  const toggleFullscreen = useCallback(
    async () => window.electronAPI.toggleFullscreen(),
    [],
  )

  const zoomBy = useCallback(
    (value: number) =>
      setZoom((zoom) => Math.min(Math.max(1, zoom * (1 + value)), 10)),
    [],
  )

  const zoomIn = useCallback(() => zoomBy(0.1), [zoomBy])

  const zoomOut = useCallback(() => zoomBy(-0.1), [zoomBy])

  const resetZoom = useCallback(() => setZoom(1), [])

  const value = {
    file,
    fullscreen,
    message,
    resetZoom,
    toggleFullscreen,
    zoom,
    zoomBy,
    zoomIn,
    zoomOut,
  }

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
}
