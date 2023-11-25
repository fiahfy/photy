import { AppBar, Toolbar, Typography } from '@mui/material'
import useImage from '~/hooks/useImage'

const TitleBar = () => {
  const { directory } = useImage()

  return (
    <AppBar
      color="default"
      component="div"
      elevation={0}
      enableColorOnDark
      sx={{ WebkitAppRegion: 'drag', opacity: 0.95 }}
    >
      <Toolbar
        disableGutters
        sx={{
          justifyContent: 'center',
          minHeight: (theme) => `${theme.spacing(3.5)}!important`,
          px: 8.5,
        }}
      >
        {directory && (
          <Typography mt={0.25} noWrap variant="caption">
            {directory.name}
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default TitleBar
