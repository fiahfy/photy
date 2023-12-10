import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { useAppSelector } from '~/store'
import { selectFile } from '~/store/window'
import { isImageFile } from '~/utils/file'

type File = { name: string; path: string; url: string }

export const ImageContext = createContext<
  | {
      directory: File | undefined
      fullscreen: boolean
      image: File | undefined
      images: File[]
      index: number | undefined
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

type State = {
  directory: File | undefined
  entries: File[]
  status: 'error' | 'loaded' | 'loading'
}

type Action =
  | { type: 'error' }
  | {
      type: 'loaded'
      payload: { directory: File; entries: File[] }
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
      return { directory: undefined, entries: [], status: action.type }
  }
}

type Props = { children: ReactNode }

export const ImageProvider = (props: Props) => {
  const { children } = props

  const file = useAppSelector(selectFile)

  const [fullscreen, setFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)

  const [{ directory, entries, status }, dispatch] = useReducer(reducer, {
    directory: undefined,
    entries: [],
    status: 'loading',
  })
  const [index, setIndex] = useState<number>()

  const images = useMemo(
    () => entries.filter((entry) => isImageFile(entry.path)),
    [entries],
  )

  const image = useMemo(
    () => (index ? images[index] : undefined),
    [images, index],
  )

  useEffect(() => {
    const removeListener =
      window.electronAPI.addFullscreenListener(setFullscreen)
    return () => removeListener()
  }, [])

  useEffect(() => {
    ;(async () => {
      dispatch({ type: 'loading' })
      try {
        const directory = await window.electronAPI.getParentDirectory(file.path)
        const entries = await window.electronAPI.getEntries(directory.path)
        dispatch({ type: 'loaded', payload: { directory, entries } })
      } catch (e) {
        dispatch({ type: 'error' })
      }
    })()
  }, [file.path])

  useEffect(() => {
    const index = images.findIndex((entry) => entry.path === file.path)
    setIndex(index === -1 ? 0 : index)
  }, [file.path, images])

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
    () =>
      setIndex((index) => {
        if (index === undefined) {
          return index
        }
        return index <= 0 ? images.length - 1 : index - 1
      }),
    [images.length],
  )

  const moveNext = useCallback(
    () =>
      setIndex((index) => {
        if (index === undefined) {
          return index
        }
        return index >= images.length - 1 ? 0 : index + 1
      }),
    [images.length],
  )

  const moveTo = useCallback((index: number) => setIndex(index), [])

  const value = {
    directory,
    fullscreen,
    image,
    images,
    index,
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

  return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>
}
