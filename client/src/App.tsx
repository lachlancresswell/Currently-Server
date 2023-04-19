import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Outlet,
  Routes,
} from 'react-router-dom';
import { AppBar, Box, Toolbar, IconButton, Container } from '@mui/material';

import {
  Home as HomeIcon,
  Tv as DisplayIcon,
  ViewStream as ChannelIcon,
  ShowChart as ChartIcon,
  Settings as ConfigIcon,
} from '@mui/icons-material';

import HomePage from './pages/HomePage';
import DisplayPage from './pages/DisplayPage';
import ChannelPage from './pages/ChannelPage';
import ChartPage from './pages/ChartPage';
import ConfigPage from './pages/ConfigPage';
import ConfigForm from './pages/ConfigForm';

/**
 * `App` is the main application component that sets up routing and navigation.
 *
 * The navigation menu is created with Material-UI components
 * and contains icons that link to the Home, Display, Channel, Chart, and Config pages.
 *
 * @returns JSX.Element - The App component with navigation and routes.
 */
const App: React.FC = () => {

  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              {/* Home icon button */}
              <IconButton color="inherit" component={Link} to="/">
                <HomeIcon />
              </IconButton>
              {/* Display icon button */}
              <IconButton color="inherit" component={Link} to="/display">
                <DisplayIcon />
              </IconButton>
              {/* Channel icon button */}
              <IconButton color="inherit" component={Link} to="/channel">
                <ChannelIcon />
              </IconButton>
              {/* Chart icon button */}
              <IconButton color="inherit" component={Link} to="/chart">
                <ChartIcon />
              </IconButton>
              {/* Config icon button */}
              <IconButton color="inherit" component={Link} to="/options">
                <ConfigIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
      {/* Router routes for handling page content */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route path="/channel" element={<ChannelPage />} />
        <Route path="/chart" element={<ChartPage />} />
        <Route path="/options/:pluginName" element={<ConfigForm />} />
        <Route path="/options" element={<ConfigPage />} />
      </Routes>
    </Router>
  );
};

export default App;
