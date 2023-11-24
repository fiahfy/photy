import mime from 'mime'

export const isImageFile = (path: string) => {
  const type = mime.getType(path)
  if (!type) {
    return false
  }
  return type.startsWith('image/')
}
