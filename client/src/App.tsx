import { useEffect, useState } from 'react';
import { PageChannel } from './PageChannel'
import ConfigPage from './pages/ConfigPage';
import { PageBasic } from './PageBasic';
import {
  createBrowserRouter,
  RouterProvider,
  NavLink,
  Outlet,
  Link
} from "react-router-dom";
import { NeighbourProvider, useNeighbourContext } from './neighbourContext';
import { NeighbourDataProvider, useNeighbourDataContext } from './neighbourDataContext';
import ConfigForm from './pages/ConfigForm';


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
    <NeighbourSelector />
    <nav>
      <ul>
        <li>
          <Link to={"/"}>Home</Link>
        </li>
        <li>
          <Link to={"/channel"}>Channel</Link>
        </li>
        <li>
          <Link to={"/plot"}>Plot</Link>
        </li>
        <li>
          <Link to={"/options"}>Options</Link>
        </li>
      </ul>
    </nav>
    <Outlet /></>,
  children: [{
    path: "/channel",
    element: <>
      <nav>
        <ul>
          <li>
            <Link to={"/channel/basic"}>Basic</Link>
          </li>
          <li>
            <Link to={"/channel/phase/1"}>Phase 1</Link>
          </li>
          <li>
            <Link to={"/channel/phase/2"}>Phase 2</Link>
          </li>
          <li>
            <Link to={"/channel/phase/3"}>Phase 3</Link>
          </li>
          <li>
            <Link to={"/channel/Adv"}>Adv</Link>
          </li>
          <Outlet />
        </ul>
      </nav>
    </>,
    children: [{
      path: "/channel/basic",
      element: <PageBasic />
    }, {
      path: "/channel/phase/:phase",
      element: <PageChannel />
    }]
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
        <RouterProvider router={router} />
      </NeighbourDataProvider>
    </div>
  );
};

const App = () => {
  return (
    <NeighbourProvider>
      <AppWrapper />
    </NeighbourProvider>
  );
};

export default App;
