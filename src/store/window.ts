import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { Entry } from '~/interfaces'
import type { AppState, AppThunk } from '~/store'
import { selectWindowId } from '~/store/window-id'

type WindowState = {
  error: boolean
  file?: Entry
  loading: boolean
}

type State = {
  [id: number]: WindowState
}

const defaultWindowState: WindowState = {
  error: false,
  file: undefined,
  loading: false,
}

const initialState: State = {}

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    load(state, action: PayloadAction<{ id: number }>) {
      const { id } = action.payload
      return {
        ...state,
        [id]: {
          ...defaultWindowState,
          loading: true,
        },
      }
    },
    loaded(
      state,
      action: PayloadAction<{
        id: number
        file: Entry
      }>,
    ) {
      const { id, file } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      return {
        ...state,
        [id]: {
          ...window,
          file,
          loading: false,
        },
      }
    },
    loadFailed(state, action: PayloadAction<{ id: number }>) {
      const { id } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      return {
        ...state,
        [id]: {
          ...window,
          error: true,
          loading: false,
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

export const selectError = createSelector(
  selectCurrentWindow,
  (window) => window.error,
)

export const selectFile = createSelector(
  selectCurrentWindow,
  (window) => window.file,
)

export const selectLoading = createSelector(
  selectCurrentWindow,
  (window) => window.loading,
)

export const load =
  (filePath: string, force: boolean): AppThunk =>
  async (dispatch, getState) => {
    const { load, loaded, loadFailed } = windowSlice.actions

    const loading = selectLoading(getState())
    if (!force && loading) {
      return
    }

    const id = selectWindowId(getState())

    dispatch(load({ id }))
    try {
      const entry = await window.electronAPI.getEntry(filePath)
      dispatch(loaded({ id, file: entry }))
    } catch {
      dispatch(loadFailed({ id }))
    }
  }
