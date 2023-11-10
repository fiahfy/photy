import { Box, Slider } from '@mui/material'
import { useMemo, useRef } from 'react'
import { Transition } from 'react-transition-group'
import useTheme from '~/hooks/useTheme'
import { useAppSelector } from '~/store'
import { selectShouldAlwaysShowSeekBar } from '~/store/settings'

type Props = {
  controlBarVisible: boolean
}

const SeekBar = (props: Props) => {
  const { controlBarVisible } = props

  const shouldAlwaysShowSeekBar = useAppSelector(selectShouldAlwaysShowSeekBar)

  const { theme } = useTheme()

  const nodeRef = useRef(null)

  const timeout = theme.transitions.duration.shortest

  const styles = useMemo(() => {
    const styles = {
      inset: `auto ${theme.spacing(1)} 1px`,
      opacity: 1,
      transform: 'translateY(-61px)',
    }
    return {
      appear: styles,
      disappear: {
        inset: shouldAlwaysShowSeekBar ? 'auto 0 1px' : styles.inset,
        opacity: shouldAlwaysShowSeekBar ? styles.opacity : 0,
        transform: shouldAlwaysShowSeekBar
          ? 'translateY(-14px)'
          : styles.transform,
      },
    }
  }, [shouldAlwaysShowSeekBar, theme])

  const transitionStyles = {
    entering: styles.appear,
    entered: styles.appear,
    exiting: styles.disappear,
    exited: styles.disappear,
    unmounted: styles.disappear,
  }

  return (
    <Transition in={controlBarVisible} nodeRef={nodeRef} timeout={timeout}>
      {(state) => (
        <Box
          ref={nodeRef}
          sx={{
            position: 'absolute',
            transition: `opacity ${timeout}ms ease-in-out, transform ${timeout}ms ease-in-out, inset ${timeout}ms ease-in-out`,
            zIndex: (theme) => theme.zIndex.appBar,
            ...transitionStyles[state],
          }}
        >
          <Slider
            max={100}
            onChange={() => undefined}
            onKeyDown={(e) => e.preventDefault()}
            size="small"
            step={0.01}
            sx={{
              borderRadius: 0,
              inset: 0,
              position: 'absolute',
              width: 'auto',
              '.MuiSlider-thumb': {
                transform: 'translate(-50%, -50%) scale(0)',
                transition: 'none',
                '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                  boxShadow: 'inherit',
                },
                '.MuiSlider-valueLabel': {
                  backgroundColor: 'transparent',
                  opacity: 0,
                  transition: 'opacity 0.2s ease-in-out',
                  '::before': {
                    display: 'none',
                  },
                },
                '.MuiSlider-valueLabelOpen': {
                  opacity: 1,
                },
              },
              '.MuiSlider-rail, .MuiSlider-track': {
                transition: 'transform 0.2s ease-in-out',
              },
              '&:hover': {
                '.MuiSlider-thumb': {
                  transform: 'translate(-50%, -50%) scale(1)',
                },
                '.MuiSlider-rail, .MuiSlider-track': {
                  transform: 'translate(0, -50%) scale(1, 1.5)',
                },
              },
            }}
            value={99}
            valueLabelDisplay="auto"
          />
        </Box>
      )}
    </Transition>
  )
}

export default SeekBar
