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
      entries: File[]
      entry: File
      fullscreen: boolean
      index: number
      message: string | undefined
      movePrevious: () => void
      moveNext: () => void
      moveTo: (index: number) => void
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

  const [entries, setEntries] = useState<File[]>([])
  const [index, setIndex] = useState(0)

  const entry = useMemo(
    () => entries[index] ?? { name: '', path: '', url: '' },
    [entries, index],
  )

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

  useEffect(() => {
    ;(async () => {
      const entries = await window.electronAPI.getEntries(file.path)
      setEntries(entries)
    })()
  }, [file.path])

  const toggleFullscreen = useCallback(
    () => window.electronAPI.toggleFullscreen(),
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

  const movePrevious = useCallback(
    () => setIndex((index) => (index <= 0 ? entries.length - 1 : index - 1)),
    [entries.length],
  )

  const moveNext = useCallback(
    () => setIndex((index) => (index >= entries.length - 1 ? 0 : index + 1)),
    [entries.length],
  )

  const moveTo = useCallback((index: number) => setIndex(index), [])

  const value = {
    entries,
    entry,
    fullscreen,
    index,
    message,
    movePrevious,
    moveNext,
    moveTo,
    resetZoom,
    toggleFullscreen,
    zoom,
    zoomBy,
    zoomIn,
    zoomOut,
  }

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
}
