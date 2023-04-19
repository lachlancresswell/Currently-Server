import React from 'react';
import NeighboursProvider from './NeighboursProvider';
import App from './App';

const Root: React.FC = () => {
    return (
        <NeighboursProvider>
            <App />
        </NeighboursProvider>
    );
};

export default Root;