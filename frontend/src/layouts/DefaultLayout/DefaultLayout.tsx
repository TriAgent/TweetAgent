import { Logs } from '@components/data/Logs/Logs';
import { MainNavMenu } from '@components/nav/MainNavMenu/MainNavMenu';
import { Box, CssBaseline, Drawer } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { BACKGROUND_PRIMARY_COLOR } from 'src/constants';

const drawerWidth = 400;
const bottomBarHeight = 154;

const DefaultLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: BACKGROUND_PRIMARY_COLOR }}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#111' },
          }}
        >
          <Box sx={{ overflow: 'auto' }}>
            <MainNavMenu />
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, mb: `${bottomBarHeight}px` }}>
          <Outlet />
        </Box>
      </Box>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: drawerWidth,
          width: `calc(100% - ${drawerWidth}px)`,
          height: `${bottomBarHeight}px`,
          bgcolor: 'grey.800',
          color: 'white',
          boxSizing: 'border-box',
        }}
      >
        <Logs />
      </Box>
    </Box>
  );
};

export default DefaultLayout;
