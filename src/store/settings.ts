import {
  type PayloadAction,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import type { AppState } from '~/store'

type State = {
  shouldAlwaysShowSeekBar: boolean
  shouldCloseWindowOnEscapeKey: boolean
  viewModeOnOpen: 'fullscreen' | 'maximized' | 'default'
}

const initialState: State = {
  shouldAlwaysShowSeekBar: false,
  shouldCloseWindowOnEscapeKey: false,
  viewModeOnOpen: 'default',
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    setViewModeOnOpen(
      state,
      action: PayloadAction<{ viewModeOnOpen: State['viewModeOnOpen'] }>,
    ) {
      const { viewModeOnOpen } = action.payload
      return {
        ...state,
        viewModeOnOpen,
      }
    },
    toggleShouldAlwaysShowSeekBar(state) {
      return {
        ...state,
        shouldAlwaysShowSeekBar: !state.shouldAlwaysShowSeekBar,
      }
    },
    toggleShouldCloseWindowOnEscapeKey(state) {
      return {
        ...state,
        shouldCloseWindowOnEscapeKey: !state.shouldCloseWindowOnEscapeKey,
      }
    },
  },
})

export const {
  replaceState,
  setViewModeOnOpen,
  toggleShouldAlwaysShowSeekBar,
  toggleShouldCloseWindowOnEscapeKey,
} = settingsSlice.actions

export default settingsSlice.reducer

export const selectSettings = (state: AppState) => state.settings

export const selectShouldAlwaysShowSeekBar = createSelector(
  selectSettings,
  (settings) => settings.shouldAlwaysShowSeekBar,
)

export const selectShouldCloseWindowOnEscapeKey = createSelector(
  selectSettings,
  (settings) => settings.shouldCloseWindowOnEscapeKey,
)

export const selectViewModeOnOpen = createSelector(
  selectSettings,
  (settings) => settings.viewModeOnOpen,
)
