import { useEffect, useState } from 'react';
import { PageChannel } from './Pages/PageChannel'
import ConfigPage from './Pages/ConfigPage';
import { PageBasic } from './Pages/PageBasic';
import { PageAdv } from './Pages/PageAdv';
import { Status } from './Components/Status';
import { PageHome } from './Pages/PageHome';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  NavLink,
  useLocation
} from "react-router-dom";
import { NeighbourProvider, useNeighbourContext } from './Hooks/neighbourContext';
import { NeighbourDataProvider } from './Hooks/neighbourDataContext';
import { ConfigDataProvider } from './Hooks/configContext';
import './Styles/App.css';
import './Styles/Page.css';
import './Styles/Button.css';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import HomeIcon from '@mui/icons-material/Home';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LightModeIcon from '@mui/icons-material/LightMode';
import PageChart from './Pages/PageChart';
import { PageDisplay } from './Pages/PageDisplay';
import { WarningSettings } from './Pages/PageConfigWarnings';
import { LocaleSettings } from './Pages/PageConfigLocale';
import { VersionSettings } from './Pages/PageConfigVersions';
import { TimezoneSettings } from './Pages/PageConfigTimezone';
import { useTheme } from './Hooks/useTheme';
import { Modal } from './Components/ConfigModal'
import NetworkSettingsWrapper from './Pages/NetworkSettingsWrapper';
import { ChartSettings } from './Pages/PageConfigChart';
import { usePhaseColors } from './Hooks/usePhaseColors';

const NeighbourSelector = () => {
  const { neighbours, selectedNeighbour, setSelectedNeighbour } = useNeighbourContext();

  const handleSelectNeighbour = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAddress = event.target.value;
    const selectedNeighbour = neighbours.find((neighbour) => neighbour.address === selectedAddress);
    setSelectedNeighbour(selectedNeighbour!);
  };

  return (
    <div>
      <h1>Neighbour:</h1>
      <select value={selectedNeighbour?.address || ''} onChange={handleSelectNeighbour}>
        <option value="">Select</option>
        {neighbours.map((neighbour) => (
          <option key={neighbour.address} value={neighbour.address}>
            {neighbour.name}
          </option>
        ))}
      </select>
    </div>
  );
};

const MainMenu = () => {
  const urlPath = useLocation().pathname;
  const isSelected = (path: string) => urlPath.includes(path) ? ' selected' : '';

  return (<>
    <Status />
    <div className={"menu "}>
      <NavLink to={"/"} className={`${isSelected('/home')}`}>
        <HomeIcon />
      </NavLink>
      <NavLink to={"/display"} className={`${isSelected('/display')}`}>
        <LightModeIcon />
      </NavLink>
      <NavLink to={"/channel/basic"} className={`${isSelected('/channel')}`}>
        <FormatListNumberedIcon />
      </NavLink>
      <NavLink to={"/chart"} className={`${isSelected('/chart')}`}>
        <ShowChartIcon />
      </NavLink>
      <NavLink to={"/options"} className={`${isSelected('/options')}`}>
        <SettingsOutlinedIcon />
      </NavLink>
    </div>
    <Outlet />
  </>);
}

const ChannelMenu = () => {
  const urlPath = useLocation().pathname;
  const isSelected = (path: string) => urlPath.includes(path) ? ' selected' : '';

  return (
    <>
      <Outlet />
      <div className={'menu footer'}>
        <NavLink to={"/channel/basic"} className={`${isSelected('/channel/basic')}`}>Basic</NavLink>
        <NavLink to={"/channel/phase/1"} className={`${isSelected('/channel/phase/1')}`}>L1</NavLink>
        <NavLink to={"/channel/phase/2"} className={`${isSelected('/channel/phase/2')}`}>L2</NavLink>
        <NavLink to={"/channel/phase/3"} className={`${isSelected('/channel/phase/3')}`}>L3</NavLink>
        <NavLink to={"/channel/adv"} className={`${isSelected('/channel/adv')}`}>Adv</NavLink>
      </div>
    </>);
}

const router = createBrowserRouter([{
  path: '/',
  element: <MainMenu />,
  children: [{
    path: "/channel",
    element: <ChannelMenu />,
    children: [{
      path: "/channel/basic",
      element: <PageBasic />
    }, {
      path: "/channel/adv",
      element: <PageAdv />
    }, {
      path: "/channel/phase/:phase",
      element: <PageChannel />
    }]
  }, {
    path: "/",
    element: <PageHome />
  }, {
    path: "/home",
    element: <PageHome />
  }, {
    path: "/display",
    element: <PageDisplay />
  }, {
    path: "/chart",
    element: <PageChart />
  }, {
    path: "/options",
    element: <ConfigPage />
  }, {
    path: "/options/network",
    element: <NetworkSettingsWrapper />
  }, {
    path: "/options/warnings",
    element: <WarningSettings />
  }, {
    path: "/options/locale",
    element: <LocaleSettings />
  }, {
    path: "/options/versions",
    element: <VersionSettings />
  }, {
    path: "/options/timezone",
    element: <TimezoneSettings />
  }, {
    path: "/options/chart",
    element: <ChartSettings />
  }, {
    path: "/options/:pluginName",
    element: <></>
  }]
}]);

const AppWrapper = () => {
  const { selectedNeighbour } = useNeighbourContext();
  const [_selectedNeighbourId, setSelectedNeighbourId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedNeighbourId(selectedNeighbour?.address ?? null);
  }, [selectedNeighbour]);

  const AppRouter = () => {
    usePhaseColors();
    return <RouterProvider router={router} />
  }

  return (
    <div id='single-page' className='single-page noselect'>
      <NeighbourDataProvider neighbour={selectedNeighbour!}>
        <ConfigDataProvider>
          <AppRouter />
        </ConfigDataProvider>
      </NeighbourDataProvider>
    </div>
  );
};

const App = () => {
  useTheme()

  return (
    <NeighbourProvider>
      <AppWrapper />
    </NeighbourProvider>
  );
};

export default App;
