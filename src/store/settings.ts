import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { AppState } from '~/store'

type State = {
  defaultViewMode: 'fullscreen' | 'maximized' | 'normal'
  shouldAlwaysShowSeekBar: boolean
  shouldCloseWindowWithEscapeKey: boolean
}

const initialState: State = {
  defaultViewMode: 'normal',
  shouldAlwaysShowSeekBar: false,
  shouldCloseWindowWithEscapeKey: false,
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    setDefaultViewMode(
      state,
      action: PayloadAction<{ defaultViewMode: State['defaultViewMode'] }>,
    ) {
      const { defaultViewMode } = action.payload
      return {
        ...state,
        defaultViewMode,
      }
    },
    toggleShouldAlwaysShowSeekBar(state) {
      return {
        ...state,
        shouldAlwaysShowSeekBar: !state.shouldAlwaysShowSeekBar,
      }
    },
    toggleShouldCloseWindowWithEscapeKey(state) {
      return {
        ...state,
        shouldCloseWindowWithEscapeKey: !state.shouldCloseWindowWithEscapeKey,
      }
    },
  },
})

export const {
  replaceState,
  setDefaultViewMode,
  toggleShouldAlwaysShowSeekBar,
  toggleShouldCloseWindowWithEscapeKey,
} = settingsSlice.actions

export default settingsSlice.reducer

export const selectSettings = (state: AppState) => state.settings

export const selectDefaultViewMode = createSelector(
  selectSettings,
  (settings) => settings.defaultViewMode,
)

export const selectShouldAlwaysShowSeekBar = createSelector(
  selectSettings,
  (settings) => settings.shouldAlwaysShowSeekBar,
)

export const selectShouldCloseWindowWithEscapeKey = createSelector(
  selectSettings,
  (settings) => settings.shouldCloseWindowWithEscapeKey,
)
