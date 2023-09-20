import React, { createContext, useContext, useEffect, useState } from 'react';
import { PluginJSON } from '../../../Types';

export const ConfigDataContext = createContext<ConfigContextType>({ refresh: () => false });

export interface ConfigContextType {
    configData?: PluginJSON;
    refresh: () => void;
}

interface props {
    children: React.ReactNode;
}

export const ConfigDataProvider: React.FC<props> = ({ children }) => {
    const [isRefreshing, setRefresh] = useState<boolean>(true);
    const [configData, setConfigData] = useState<PluginJSON>();
    const refresh = () => setRefresh(true);

    const getConfig = async () => {
        const response = await fetch(`/config`)
        const configData = await response.json() as PluginJSON;
        setConfigData(configData);
        setRefresh(false);
    }

    useEffect(() => { getConfig() }, [isRefreshing]);

    return <ConfigDataContext.Provider value={{ configData, refresh }}>{children}</ConfigDataContext.Provider>;
};

export const useConfigDataContext = () => useContext(ConfigDataContext);
