import {
  Fullscreen as FullscreenEnterIcon,
  FullscreenExit as FullscreenExitIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material'
import { useMemo } from 'react'
import useImage from '~/hooks/useImage'
import { useAppSelector } from '~/store'
import {
  selectShouldAlwaysShowSeekBar,
  selectShouldCloseWindowOnEscapeKey,
} from '~/store/settings'
import { createContextMenuHandler } from '~/utils/contextMenu'

const ControlBar = () => {
  const shouldAlwaysShowSeekBar = useAppSelector(selectShouldAlwaysShowSeekBar)
  const shouldCloseWindowOnEscapeKey = useAppSelector(
    selectShouldCloseWindowOnEscapeKey,
  )

  const {
    image,
    images,
    fullscreen,
    index,
    moveNext,
    movePrevious,
    toggleFullscreen,
  } = useImage()

  const FullscreenIcon = useMemo(
    () => (fullscreen ? FullscreenExitIcon : FullscreenEnterIcon),
    [fullscreen],
  )

  const handleClickSettings = useMemo(
    () =>
      createContextMenuHandler([
        {
          type: 'alwaysShowSeekBar',
          data: { checked: shouldAlwaysShowSeekBar },
        },
        {
          type: 'closeWindowOnEscapeKey',
          data: { checked: shouldCloseWindowOnEscapeKey },
        },
      ]),
    [shouldAlwaysShowSeekBar, shouldCloseWindowOnEscapeKey],
  )

  return (
    <AppBar
      color="transparent"
      component="div"
      elevation={0}
      sx={{
        bottom: 0,
        top: 'auto',
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.7))',
          height: (theme) => theme.spacing(25),
          inset: 'auto 0 0',
          pointerEvents: 'none',
          position: 'absolute',
        }}
      />
      <Toolbar disableGutters sx={{ gap: 0.5, px: 1 }} variant="dense">
        <IconButton
          disabled={false}
          onClick={movePrevious}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          title="Previous Image"
        >
          <KeyboardArrowLeftIcon fontSize="small" />
        </IconButton>
        <IconButton
          disabled={false}
          onClick={moveNext}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          title="Next Image"
        >
          <KeyboardArrowRightIcon fontSize="small" />
        </IconButton>
        <Typography
          noWrap
          sx={{
            flexShrink: 0,
            mx: 1,
          }}
          variant="body2"
        >
          {index + 1} / {images.length}
        </Typography>
        {image && (
          <Typography noWrap variant="body2">
            ・ {image.name}
          </Typography>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={handleClickSettings} size="small" title="Settings">
          <SettingsIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={toggleFullscreen}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          title={`${fullscreen ? 'Exit full screen' : 'Full screen'} (f)`}
        >
          <FullscreenIcon fontSize="small" />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default ControlBar
