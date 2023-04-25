import React, { createContext, useContext, useEffect, useState } from 'react';
import { Neighbour } from './../../Types';

/**
 * Interface for the neighbour context object.
 */
export interface NeighbourContextType {
  neighbours: Neighbour[];
  selectedNeighbour: Neighbour | null;
  setSelectedNeighbour: (neighbour: Neighbour) => void;
}

/**
 * Context object that provides the currently selected neighbour.
 */
export const NeighbourContext = createContext<NeighbourContextType>({
  neighbours: [],
  selectedNeighbour: null,
  setSelectedNeighbour: () => { },
});

interface props {
  children: React.ReactNode;
}

/**
 * React component that provides the neighbour context object.
 */
export const NeighbourProvider: React.FC<props> = ({ children }) => {
  const [neighbours, setNeighbours] = useState<Neighbour[]>([]);
  const [selectedNeighbour, setSelectedNeighbour] = useState<Neighbour | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        console.log(process.env.REACT_APP_SERVER_DOMAIN)
        const response = await fetch(`http://${process.env.REACT_APP_SERVER_DOMAIN}:${process.env.REACT_APP_SERVER_PORT}/neighbours`)
        const neighbours = await response.json();
        if (!selectedNeighbour) setSelectedNeighbour(neighbours[0]);
        setNeighbours(neighbours)
      } catch (error) {
        console.error(error);
      }
    }, 1000); // fetch every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const value = {
    neighbours,
    selectedNeighbour,
    setSelectedNeighbour,
  };

  return <NeighbourContext.Provider value={value}>{children}</NeighbourContext.Provider>;
};

/**
 * Hook for accessing the neighbour context object.
 */
export const useNeighbourContext = () => useContext(NeighbourContext);
