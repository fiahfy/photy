import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { AppState, AppThunk } from '~/store'
import { selectWindowId } from '~/store/window-id'

type WindowState = {
  filePath?: string
}

type State = {
  [id: number]: WindowState
}

const defaultWindowState: WindowState = {
  filePath: undefined,
}

const initialState: State = {}

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    load(state, action: PayloadAction<{ id: number; filePath: string }>) {
      const { id, filePath } = action.payload
      return {
        ...state,
        [id]: {
          ...defaultWindowState,
          filePath,
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

export const selectFilePath = createSelector(
  selectCurrentWindow,
  (window) => window.filePath,
)

export const load =
  (filePath: string): AppThunk =>
  async (dispatch, getState) => {
    const { load } = windowSlice.actions

    const id = selectWindowId(getState())

    dispatch(load({ id, filePath }))
  }
