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
import { isImageFile } from '~/utils/file'

type File = { name: string; path: string; url: string }

export const VideoContext = createContext<
  | {
      fullscreen: boolean
      image: File
      images: File[]
      index: number
      movePrevious: () => void
      moveNext: () => void
      moveTo: (index: number) => void
      resetZoom: () => void
      status: 'loading' | 'loaded' | 'error'
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
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading',
  )
  const [zoom, setZoom] = useState(1)

  const [entries, setEntries] = useState<File[]>([])
  const [index, setIndex] = useState(0)

  const images = useMemo(
    () => entries.filter((entry) => isImageFile(entry.path)),
    [entries],
  )

  const image = useMemo(
    () => images[index] ?? { name: '', path: '', url: '' },
    [images, index],
  )

  const message = useMemo(() => {
    switch (status) {
      case 'loading':
        return 'Loading...'
      case 'error':
        return 'Failed to load.'
      default:
        return undefined
    }
  }, [status])

  useEffect(() => {
    const removeListener =
      window.electronAPI.addFullscreenListener(setFullscreen)
    return () => removeListener()
  }, [])

  useEffect(() => {
    ;(async () => {
      setStatus('loading')
      setEntries([])
      try {
        const entries = await window.electronAPI.getEntries(file.path)
        setEntries(entries)
        setStatus('loaded')
      } catch (e) {
        setStatus('error')
      }
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
    () => setIndex((index) => (index <= 0 ? images.length - 1 : index - 1)),
    [images.length],
  )

  const moveNext = useCallback(
    () => setIndex((index) => (index >= images.length - 1 ? 0 : index + 1)),
    [images.length],
  )

  const moveTo = useCallback((index: number) => setIndex(index), [])

  const value = {
    fullscreen,
    image,
    images,
    index,
    message,
    movePrevious,
    moveNext,
    moveTo,
    resetZoom,
    status,
    toggleFullscreen,
    zoom,
    zoomBy,
    zoomIn,
    zoomOut,
  }

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
}
