import { useState, useEffect, createContext, useContext } from 'react';
import { ConfigArray, PluginJSON } from '../../../Types';
import axios from 'axios';

const LOCAL_STORAGE_KEY = 'configData';

interface ConfigContextType {
    savePluginConfig: <T extends ConfigArray[]>(
        pluginConfig: T,
        pluginName: string[],
    ) => void;
    savePluginVariable: <T extends ConfigArray>(
        key: keyof T,
        value: T[keyof T]['value'],
        pluginName: string,
    ) => void;
    getPluginConfig: <T extends ConfigArray>(pluginName: string) => T | undefined;
}

const ConfigContext = createContext<ConfigContextType>({
    savePluginConfig: <T extends ConfigArray[]>(
        pluginConfig: T,
        pluginName: string[],
    ) => { },
    savePluginVariable: <T extends ConfigArray>(
        key: keyof T,
        value: T[keyof T]['value'],
        pluginName: string,
    ) => { },
    getPluginConfig: <T extends ConfigArray>(pluginName: string) => undefined
});

/**
 * Loads the configuration of all plugins.
 * @returns Object containing the configuration
 */
const loadConfig = async () => {
    try {
        const response = await axios.get<PluginJSON>(`/config`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching config:`, error);
    }
}

/**
 * Saves the provided plugin config to the database.
 * @param pluginName Name of the plugin to save the config for.
 * @param pluginConfig Config to save.
 * @returns void
 */
const pushPluginConfigToRemote = async <T extends ConfigArray>(pluginName: string, pluginConfig: ConfigArray) => {
    try {
        const response = await axios.put(`/config/${pluginName}`, pluginConfig);
        return response.data as T;
    } catch (error) {
        console.error(`Error updating config for plugin ${pluginName}:`, error);
    }
}

interface props {
    children: React.ReactNode;
}

export const ConfigContextProvider: React.FC<props> = ({ children }) => {

    const localConfigData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '') as PluginJSON

    // The latest server config.
    const [serverConfig, setServerConfig] = useState<PluginJSON | undefined>(localConfigData);

    /**
     * Fetches the plugin config from the server and set the state and cache.
     * @returns void
     */
    const fetchServerConfig = async () => {
        const newServerConfig = await loadConfig();
        setServerConfig(newServerConfig);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newServerConfig));
    }

    // On first render, load config
    useEffect(() => {
        // Fetch remote config asynchronously
        fetchServerConfig();
    }, []);

    const getPluginConfig = <T extends ConfigArray>(pluginName: string): T | undefined => {
        // If config has been loaded
        if (!serverConfig) {
            throw (new Error('Server config not loaded'));
        };

        const pluginConfig = serverConfig[pluginName].config as T;

        if (!pluginConfig) {
            throw (new Error(`Plugin config not found for plugin ${pluginName}`));
        }

        return pluginConfig;
    }

    const savePluginConfig = async<T extends ConfigArray[]>(
        configs: T,
        pluginNames: string[],
    ) => {
        // If config has been loaded
        if (!serverConfig) {
            throw (new Error('Server config not loaded'));
        };

        // Convert the value to the correct type if necessary.
        configs.forEach((pluginConfig) => {
            Object.keys(pluginConfig).forEach((key) => {
                if (pluginConfig[key].type === 'number' && typeof (pluginConfig[key].value) !== 'number') {
                    pluginConfig[key].value = parseInt(pluginConfig[key].value as any);
                }
            });
        });

        const newServerConfig = {
            ...serverConfig
        };
        configs.forEach((pluginConfig, index) => {
            const pluginName = pluginNames[index];
            newServerConfig[pluginName].config = pluginConfig;
        });
        setServerConfig(newServerConfig);

        // Update remote config
        configs.forEach(async (pluginConfig, index) => {
            const pluginName = pluginNames[index];

            const newRemotePluginConfig = await pushPluginConfigToRemote<ConfigArray>(pluginName, { ...pluginConfig })

            if (!newRemotePluginConfig) {
                throw (new Error(`Error updating config for plugin ${pluginName}`));
            };

            setServerConfig((prevState) => {
                if (prevState) {
                    prevState[pluginName].config = newRemotePluginConfig;
                }

                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prevState));

                return prevState;
            });

        });
    };


    const savePluginVariable = async<T extends ConfigArray>(
        key: keyof T,
        value: T[keyof T]['value'],
        pluginName: string,
    ) => {
        // If config has been loaded
        if (!serverConfig) {
            throw (new Error('Server config not loaded'));
        };

        const pluginConfig = serverConfig[pluginName].config as T;

        if (!pluginConfig) {
            throw (new Error(`Plugin config not found for plugin ${pluginName}`));
        }

        // Convert the value to the correct type if necessary.
        if (pluginConfig[key].type === 'number' && typeof (value) !== 'number') {
            value = parseInt(value as any);
        }

        // Update the config state with the new value.
        const newPluginConfig = {
            ...pluginConfig,
        }
        pluginConfig[key].value = value;

        const newServerConfig = {
            ...serverConfig
        };
        newServerConfig[pluginName].config = newPluginConfig;
        setServerConfig(newServerConfig);

        // Update remote config
        const newRemotePluginConfig = await pushPluginConfigToRemote<T>(pluginName, { ...newPluginConfig } as T)

        if (!newRemotePluginConfig) {
            throw (new Error(`Error updating config for plugin ${pluginName}`));
        };

        setServerConfig((prevState) => {
            if (prevState) {
                prevState[pluginName].config = newRemotePluginConfig;
            }
            return prevState;
        });
    };

    return <ConfigContext.Provider value={{ getPluginConfig, savePluginConfig, savePluginVariable }}> {children} </ConfigContext.Provider>;
};

export const useConfigContext = () => useContext(ConfigContext);