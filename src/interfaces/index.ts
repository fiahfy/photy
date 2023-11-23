// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
import { Operations as ContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { Operations as TrafficLightOperations } from '@fiahfy/electron-traffic-light/preload'
import { Operations as WindowOperations } from '@fiahfy/electron-window/preload'
import { Operations as FullscreenOperations } from 'electron-fullscreen/preload'

type File = { name: string; path: string; url: string }

export type IElectronAPI = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addMessageListener: (callback: (message: any) => void) => () => void
  getEntries: (filePath: string) => Promise<File[]>
  openFile: (filePath: string) => Promise<void>
  updateApplicationMenu: (params: ApplicationMenuParams) => Promise<void>
} & ContextMenuOperations &
  FullscreenOperations &
  TrafficLightOperations &
  WindowOperations<{ file: File }>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApplicationMenuParams = any