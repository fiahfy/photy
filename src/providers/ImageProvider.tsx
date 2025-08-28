import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import ImageContext, { type File } from '~/contexts/ImageContext'
import { useAppSelector } from '~/store'
import { selectFile } from '~/store/window'
import { isImageFile } from '~/utils/file'

type DirectoryState = {
  directory: File | undefined
  entries: File[]
  status: 'error' | 'loaded' | 'loading'
}

type DirectoryAction =
  | { type: 'error' }
  | {
      type: 'loaded'
      payload: { directory: File; entries: File[] }
    }
  | { type: 'loading' }

const directoryReducer = (_state: DirectoryState, action: DirectoryAction) => {
  switch (action.type) {
    case 'loaded':
      return {
        ...action.payload,
        status: action.type,
      }
    case 'error':
    case 'loading':
      return { directory: undefined, entries: [], status: action.type }
  }
}

type FileState = {
  size: { height: number; width: number } | undefined
  status: 'error' | 'loaded' | 'loading'
}

type FileAction =
  | { type: 'error' }
  | {
      type: 'loaded'
      payload: { size: { height: number; width: number } }
    }
  | { type: 'loading' }

const fileReducer = (_state: FileState, action: FileAction) => {
  switch (action.type) {
    case 'loaded':
      return {
        ...action.payload,
        status: action.type,
      }
    case 'error':
    case 'loading':
      return { size: undefined, status: action.type }
  }
}

type Props = { children: ReactNode }

const ImageProvider = (props: Props) => {
  const { children } = props

  const file = useAppSelector(selectFile)

  const [{ directory, entries, status: directoryStatus }, directoryDispatch] =
    useReducer(directoryReducer, {
      directory: undefined,
      entries: [],
      status: 'loading',
    })
  const [{ size, status: fileStatus }, fileDispatch] = useReducer(fileReducer, {
    size: undefined,
    status: 'loading',
  })

  const [fullscreen, setFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [index, setIndex] = useState(0)

  const ref = useRef<HTMLImageElement>(null)

  const images = useMemo(
    () => entries.filter((entry) => isImageFile(entry.path)),
    [entries],
  )
  const image = useMemo(
    () => (index !== undefined ? images[index] : undefined),
    [images, index],
  )
  const message = useMemo(() => {
    switch (directoryStatus) {
      case 'loading':
        return 'Loading...'
      case 'error':
        return 'Failed to load.'
      default:
        switch (fileStatus) {
          case 'loading':
            return 'Loading...'
          case 'error':
            return 'Failed to load.'
          default:
            return undefined
        }
    }
  }, [directoryStatus, fileStatus])

  const toggleFullscreen = useCallback(
    () => window.windowAPI.toggleFullscreen(),
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
    () =>
      setIndex((index) => {
        return index <= 0 ? images.length - 1 : index - 1
      }),
    [images.length],
  )

  const moveNext = useCallback(
    () =>
      setIndex((index) => {
        return index >= images.length - 1 ? 0 : index + 1
      }),
    [images.length],
  )

  const moveTo = useCallback((index: number) => setIndex(index), [])

  useEffect(() => {
    const removeListener = window.windowAPI.onFullscreenChange(setFullscreen)
    return () => removeListener()
  }, [])

  useEffect(() => {
    ;(async () => {
      directoryDispatch({ type: 'loading' })
      try {
        const directory = await window.electronAPI.getParentEntry(file.path)
        const entries = await window.electronAPI.getEntries(directory.path)
        directoryDispatch({ type: 'loaded', payload: { directory, entries } })
      } catch {
        directoryDispatch({ type: 'error' })
      }
    })()
  }, [file.path])

  useEffect(() => {
    const index = images.findIndex((entry) => entry.path === file.path)
    if (index === -1) {
      return
    }
    setIndex(index)
  }, [file.path, images])

  useEffect(() => {
    const img = ref.current
    if (!img) {
      return
    }

    const handleLoad = () => {
      setZoom(1)
      fileDispatch({
        type: 'loaded',
        payload: {
          size: { height: img.naturalHeight, width: img.naturalWidth },
        },
      })
    }
    const handleError = () => {
      setZoom(1)
      fileDispatch({ type: 'error' })
    }
    img.addEventListener('load', handleLoad)
    img.addEventListener('error', handleError)
    return () => {
      img.removeEventListener('load', handleLoad)
      img.removeEventListener('error', handleError)
    }
  }, [])

  const value = {
    directory,
    fullscreen,
    image,
    images,
    index,
    message,
    moveNext,
    movePrevious,
    moveTo,
    ref,
    resetZoom,
    size,
    status: fileStatus,
    toggleFullscreen,
    zoom,
    zoomBy,
    zoomIn,
    zoomOut,
  }

  return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>
}

export default ImageProvider
