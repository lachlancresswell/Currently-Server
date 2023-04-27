import { useEffect, useState } from 'react';
import { PageChannel } from './PageChannel'
import ConfigPage from './pages/ConfigPage';
import { PageBasic } from './PageBasic';
import { PageAdv } from './PageAdv';
import { PageHome } from './PageHome';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  NavLink
} from "react-router-dom";
import { NeighbourProvider, useNeighbourContext } from './neighbourContext';
import { NeighbourDataProvider } from './neighbourDataContext';
import { ConfigDataProvider } from './configContext';
import ConfigForm from './pages/ConfigForm';
import './Styles/App.css';
import './Styles/Page.css';
import './Styles/Button.css';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import HomeIcon from '@mui/icons-material/Home';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import PageChart from './PageChart';


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

const router = createBrowserRouter([{
  path: '/',
  element: <>
    <div className={"menu "}>
      <NavLink to={"/"}>
        <HomeIcon />
      </NavLink>
      <Link to={"/channel/basic"}>
        <FormatListNumberedIcon />
      </Link>
      <Link to={"/chart"}>
        <ShowChartIcon />
      </Link>
      <Link to={"/options"}>
        <SettingsOutlinedIcon />
      </Link>
    </div>
    <Outlet /></>,
  children: [{
    path: "/channel",
    element: <>
      <Outlet />
      <div className={'menu footer'}>
        <Link to={"/channel/basic"}>Basic</Link>
        <Link to={"/channel/phase/1"}>L1</Link>
        <Link to={"/channel/phase/2"}>L2</Link>
        <Link to={"/channel/phase/3"}>L3</Link>
        <Link to={"/channel/adv"}>Adv</Link>
      </div>
    </>,
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
    path: "/chart",
    element: <PageChart />
  }, {
    path: "/options",
    element: <ConfigPage />
  }, {
    path: "/options/:pluginName",
    element: <ConfigForm />
  }]
}]);

const AppWrapper = () => {
  const { selectedNeighbour } = useNeighbourContext();
  const [_selectedNeighbourId, setSelectedNeighbourId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedNeighbourId(selectedNeighbour?.address ?? null);
  }, [selectedNeighbour]);

  return (
    <div id='single-page' className='single-page'>
      <NeighbourDataProvider neighbour={selectedNeighbour!}>
        <ConfigDataProvider>
          <RouterProvider router={router} />
        </ConfigDataProvider>
      </NeighbourDataProvider>
    </div>
  );
};

const App = () => {

  document.body.dataset.theme = 'dark';


  return (
    <NeighbourProvider>
      <AppWrapper />
    </NeighbourProvider>
  );
};

export default App;
