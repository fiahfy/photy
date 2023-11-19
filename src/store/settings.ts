import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { AppState } from '~/store'

type State = {
  shouldAlwaysShowSeekBar: boolean
  shouldCloseWindowOnEscapeKey: boolean
}

const initialState: State = {
  shouldAlwaysShowSeekBar: false,
  shouldCloseWindowOnEscapeKey: false,
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    replace(_state, action: PayloadAction<State>) {
      return action.payload
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
  replace,
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
