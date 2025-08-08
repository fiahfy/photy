import { type ActionCreators, register } from '@fiahfy/electron-context-menu'
import type { IpcMainInvokeEvent } from 'electron'

// biome-ignore lint/suspicious/noExplicitAny: false positive
const send = (event: IpcMainInvokeEvent, message: any) =>
  event.sender.send('onMessage', message)

const registerContextMenu = () => {
  const actionCreators: ActionCreators = {
    alwaysShowSeekBar: (event, _params, { checked }) => ({
      label: 'Always Show Seek Bar',
      checked,
      click: () => send(event, { type: 'toggleShouldAlwaysShowSeekBar' }),
      type: 'checkbox',
    }),
    closeWindowOnEscapeKey: (event, _params, { checked }) => ({
      label: 'Close Window on Escape Key',
      checked,
      click: () => send(event, { type: 'toggleShouldCloseWindowOnEscapeKey' }),
      type: 'checkbox',
    }),
    viewModeOnOpen: (event, _params, { viewModeOnOpen }) => ({
      label: 'View Mode on Open',
      submenu: [
        { label: 'Fullscreen', value: 'fullscreen' },
        { label: 'Maximized', value: 'maximized' },
        { label: 'Default', value: 'default' },
      ].map(({ label, value }) => ({
        checked: value === viewModeOnOpen,
        click: () =>
          send(event, {
            type: 'setViewModeOnOpen',
            data: { viewModeOnOpen: value },
          }),
        label,
        type: 'radio',
      })),
    }),
  }

  register(actionCreators)
}

export default registerContextMenu
