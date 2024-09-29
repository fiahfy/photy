import { useContext } from 'react'
import ImageContext from '~/contexts/ImageContext'

const useImage = () => {
  const context = useContext(ImageContext)
  if (!context) {
    throw new Error('useImage must be used within a Provider')
  }
  return context
}

export default useImage
