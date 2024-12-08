import { type RefObject, createContext } from 'react'

export type File = { name: string; path: string; url: string }

const ImageContext = createContext<
  | {
      directory: File | undefined
      fullscreen: boolean
      image: File | undefined
      images: File[]
      index: number | undefined
      message: string | undefined
      moveNext: () => void
      movePrevious: () => void
      moveTo: (index: number) => void
      ref: RefObject<HTMLImageElement | null>
      resetZoom: () => void
      size: { height: number; width: number } | undefined
      status: 'loading' | 'loaded' | 'error'
      toggleFullscreen: () => void
      zoom: number
      zoomBy: (value: number) => void
      zoomIn: () => void
      zoomOut: () => void
    }
  | undefined
>(undefined)

export default ImageContext
