import { ActionCreators, register } from '@fiahfy/electron-context-menu'
import { IpcMainInvokeEvent } from 'electron'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const send = (event: IpcMainInvokeEvent, message: any) =>
  event.sender.send('sendMessage', message)

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
  }

  register(actionCreators)
}

export default registerContextMenu