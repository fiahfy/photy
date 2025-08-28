import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { Entry } from '~/interfaces'
import type { AppState, AppThunk } from '~/store'
import { selectWindowId } from '~/store/window-id'

type WindowState = {
  file?: Entry
}

type State = {
  [id: number]: WindowState
}

const defaultWindowState: WindowState = {
  file: undefined,
}

const initialState: State = {}

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    newWindow(
      state,
      action: PayloadAction<{
        id: number
        file: Entry
      }>,
    ) {
      const { id, file } = action.payload
      return {
        ...state,
        [id]: {
          ...defaultWindowState,
          file,
        },
      }
    },
  },
})

export const { replaceState } = windowSlice.actions

export default windowSlice.reducer

export const selectWindow = (state: AppState) => state.window

export const selectCurrentWindow = createSelector(
  selectWindow,
  selectWindowId,
  (window, windowId) => window[windowId] ?? defaultWindowState,
)

export const selectFile = createSelector(
  selectCurrentWindow,
  (window) => window.file ?? { name: '', path: '', url: '' },
)

export const newWindow =
  (filePath: string): AppThunk =>
  async (dispatch, getState) => {
    const { newWindow } = windowSlice.actions

    const id = selectWindowId(getState())

    const entry = await window.electronAPI.getEntry(filePath)

    dispatch(newWindow({ id, file: entry }))
  }
