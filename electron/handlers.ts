import { IpcMainInvokeEvent, ipcMain } from 'electron'
import { readdir } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

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
    'getEntries',
    async (_event: IpcMainInvokeEvent, filePath: string) => {
      const directoryPath = dirname(filePath)
      const dirents = await readdir(directoryPath, { withFileTypes: true })
      return dirents.reduce((acc, dirent) => {
        const path = join(directoryPath, dirent.name)
        return [
          ...acc,
          {
            name: dirent.name.normalize('NFC'),
            path,
            url: pathToFileURL(path).href,
          },
        ]
      }, [] as Entry[])
    },
  )
}

export default registerHandlers
