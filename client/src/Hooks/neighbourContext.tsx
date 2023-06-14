import React, { createContext, useContext, useEffect, useState } from 'react';
import { Neighbour } from '../../../Types';

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
        const response = await fetch(`/neighbours`)
        const newNeighbours = await response.json();
        if (!neighbours.length) {
          setNeighbours(newNeighbours)
          if (!selectedNeighbour) {
            setSelectedNeighbour(newNeighbours[0]);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }, 1000); // fetch every 5 seconds

    return () => clearInterval(interval);
  }, [neighbours]);

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
