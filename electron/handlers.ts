import { readdir } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { type IpcMainInvokeEvent, ipcMain } from 'electron'

type Entry = {
  name: string
  path: string
  url: string
}

const registerHandlers = () => {
  ipcMain.handle('openFile', (event: IpcMainInvokeEvent, filePath: string) => {
    const file = {
      name: basename(filePath),
      path: filePath,
      url: pathToFileURL(filePath).href,
    }
    event.sender.send('sendMessage', { type: 'changeFile', data: { file } })
  })
  ipcMain.handle(
    'getParentDirectory',
    async (_event: IpcMainInvokeEvent, filePath: string) => {
      const path = dirname(filePath)
      const name = basename(path)
      return {
        name: name.normalize('NFC'),
        path,
        url: pathToFileURL(path).href,
      }
    },
  )
  ipcMain.handle(
    'getEntries',
    async (_event: IpcMainInvokeEvent, directoryPath: string) => {
      const dirents = await readdir(directoryPath, { withFileTypes: true })
      return dirents.reduce((acc, dirent) => {
        const path = join(directoryPath, dirent.name)
        acc.push({
          name: dirent.name.normalize('NFC'),
          path,
          url: pathToFileURL(path).href,
        })
        return acc
      }, [] as Entry[])
    },
  )
}

export default registerHandlers
