import React, { useState, useEffect } from 'react';

interface Neighbour {
    name: string;
    addresses: string[];
}

interface NeighboursProviderProps {
    children: React.ReactNode;
}

/**
 * `NeighboursProvider` is a React component that fetches JSON data from a server
 * at `localhost:3000/neighbours` and stores it as an array of `Neighbour` objects.
 *
 * The `neighbours` state can be passed down as a prop to other components that need
 * access to the neighbour data.
 *
 * @param {NeighboursProviderProps} props - The props object containing the children.
 * @returns JSX.Element - The NeighboursProvider component.
 */
const NeighboursProvider: React.FC<NeighboursProviderProps> = ({ children }) => {
    const [_neighbours, setNeighbours] = useState<Neighbour[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('http://localhost:3000/neighbours');
            const data = await response.json();
            setNeighbours(data);
        };
        const intervalId = setInterval(() => {
            fetchData();
        }, 3000); // fetch data every 10 seconds
        return () => clearInterval(intervalId);
    }, []);

    return <>{children}</>;
};

export default NeighboursProvider;
