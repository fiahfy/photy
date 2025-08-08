// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
import type { Operations as ContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import type { Operations as WindowOperations } from '@fiahfy/electron-window/preload'

type File = { name: string; path: string; url: string }

export type IElectronAPI = {
  getCursorPosition: () => Promise<{ x: number; y: number }>
  getEntries: (directoryPath: string) => Promise<File[]>
  getParentDirectory: (filePath: string) => Promise<File>
  // biome-ignore lint/suspicious/noExplicitAny: false positive
  onMessage: (callback: (message: any) => void) => () => void
  openFile: (file: globalThis.File) => Promise<void>
  updateApplicationMenu: (params: ApplicationMenuParams) => Promise<void>
} & ContextMenuOperations &
  WindowOperations<{ file: File }>

// biome-ignore lint/suspicious/noExplicitAny: false positive
export type ApplicationMenuParams = any
