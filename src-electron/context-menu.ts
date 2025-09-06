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
    closeWindowWithEscapeKey: (event, _params, { checked }) => ({
      label: 'Close Window with Escape Key',
      checked,
      click: () =>
        send(event, { type: 'toggleShouldCloseWindowWithEscapeKey' }),
      type: 'checkbox',
    }),
    defaultViewMode: (event, _params, { defaultViewMode }) => ({
      label: 'Default View Mode',
      submenu: [
        { label: 'Fullscreen', value: 'fullscreen' },
        { label: 'Maximized', value: 'maximized' },
        { label: 'Normal', value: 'normal' },
      ].map(({ label, value }) => ({
        checked: value === defaultViewMode,
        click: () =>
          send(event, {
            type: 'setDefaultViewMode',
            data: { defaultViewMode: value },
          }),
        label,
        type: 'radio',
      })),
    }),
  }

  register(actionCreators)
}

export default registerContextMenu
