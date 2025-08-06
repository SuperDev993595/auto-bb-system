import * as React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Tooltip from '@mui/material/Tooltip'
import './layout.css'

const drawerWidth = 240

const menuItems = [
  { name: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { name: 'Customers', path: '/customers', icon: <PeopleIcon /> },
  // Add more items as needed
]

export default function Layout() {
  const [open, setOpen] = React.useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

  // Collapse drawer on small screens, expand on large screens
  React.useEffect(() => {
    setOpen(!isSmallScreen)
  }, [isSmallScreen])

  const handleDrawerToggle = () => {
    setOpen((prev) => !prev)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontFamily: '"Playfair Display", serif',
              letterSpacing: 1,
              fontWeight: 700,
            }}
          >
            B and B Auto Repair Shop
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 56,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 56,
            boxSizing: 'border-box',
            transition: 'width 0.3s',
            overflowX: 'hidden',
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
              <Tooltip title={!open ? item.name : ''} placement="right">
                <ListItemButton
                  selected={location.pathname === item.path}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    ...(location.pathname === item.path && {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? '#3949ab'
                        : theme.palette.action.selected,
                      color: theme.palette.mode === 'dark'
                        ? theme.palette.getContrastText('#3949ab')
                        : theme.palette.primary.main,
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.mode === 'dark'
                          ? theme.palette.getContrastText('#3949ab')
                          : theme.palette.primary.main,
                      },
                    }),
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    sx={{ opacity: open ? 1 : 0, transition: 'opacity 0.2s' }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: open ? `${drawerWidth}px` : '56px',
          transition: 'margin-left 0.3s',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
