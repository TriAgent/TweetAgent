import { MainNavMenu } from '@components/nav/MainNavMenu/MainNavMenu';
import { Box, CssBaseline, Drawer } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { BACKGROUND_PRIMARY_COLOR } from 'src/constants';

const drawerWidth = 240;

const DefaultLayout = () => {
  return (
    <Box sx={{ display: 'flex', bgcolor: BACKGROUND_PRIMARY_COLOR }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#111' /* '#fcc98e' */ },
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <MainNavMenu />
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default DefaultLayout;
