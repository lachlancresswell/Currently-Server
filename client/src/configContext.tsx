import React, { createContext, useContext, useEffect, useState } from 'react';
import { DistroData, Neighbour, PluginJSON } from './../../Types';


export interface ConfigContextType {
    configData: PluginJSON | null;
}


export const ConfigDataContext = createContext<ConfigContextType>({
    configData: null,
});

interface props {
    children: React.ReactNode;
}

export const ConfigDataProvider: React.FC<props> = ({ children }) => {
    const [configData, setConfigData] = useState<PluginJSON | null>(null);

    const pollServer = async () => {
        const response = await fetch(`/config`)

        const data = await response.json() as PluginJSON;

        if (data.locale?.config?.locale.value) {
            document.body.dataset.locale = data.locale.config.locale.value as string;
        }

        setConfigData(data)
    }

    useEffect(() => {
        pollServer();
        const interval = setInterval(() => {
            pollServer();
        }, 3000); // poll every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const value = {
        configData,
    };

    return <ConfigDataContext.Provider value={value}>{children}</ConfigDataContext.Provider>;
};

export const useConfigDataContext = () => useContext(ConfigDataContext);
