// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
import { Operations as ContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { Operations as WindowOperations } from '@fiahfy/electron-window/preload'

type File = { name: string; path: string; url: string }

export type IElectronAPI = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addMessageListener: (callback: (message: any) => void) => () => void
  getEntries: (directoryPath: string) => Promise<File[]>
  getParentDirectory: (filePath: string) => Promise<File>
  openFile: (filePath: string) => Promise<void>
  updateApplicationMenu: (params: ApplicationMenuParams) => Promise<void>
} & ContextMenuOperations &
  WindowOperations<{ file: File }>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApplicationMenuParams = any
