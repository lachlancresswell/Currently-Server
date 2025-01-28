import { useState, useEffect, createContext, useContext } from 'react';
import { ConfigArray, PluginJSON } from '../../../Types';
import axios from 'axios';
import ClientConfig from '../plugin-config.client.dev.json';
import ResetConfig from '../plugin-config.client.reset.dev.json';

const LOCAL_STORAGE_KEY = 'configData';

interface ConfigContextType {
    savePluginConfig: <T extends ConfigArray[]>(
        pluginConfig: T,
        pluginName: string[],
        pluginState?: [ConfigArray | undefined, React.Dispatch<React.SetStateAction<ConfigArray | undefined>>]
    ) => void;
    isModified: <T extends ConfigArray>(
        pluginConfig: T,
        startPluginConfig: T,
        keys?: string[]
    ) => boolean;
    handleInputChange: <T extends ConfigArray>(
        pluginConfig: T,
        key: keyof T,
        value: T[keyof T]['value'],
        push: boolean,
        pluginName: string,
        pluginState: [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>],
        startPluginState: [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>]
    ) => void;
    getPluginConfig: <T extends ConfigArray>(pluginName: string) => T | undefined;
}

const ConfigContext = createContext<ConfigContextType>({
    savePluginConfig: <T extends ConfigArray[]>(
        pluginConfig: T,
        pluginName: string[],
    ) => { },
    isModified: <T extends ConfigArray>(
        pluginConfig: T,
        startPluginConfig: T,
        keys?: string[]
    ) => false,
    handleInputChange: <T extends ConfigArray>(
        pluginConfig: T,
        key: keyof T,
        value: any,
        push = false,
        pluginName: string,
        pluginState: [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>],
        startPluginState: [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>]
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
    /**
     * The default configuration used if nothing is found in local storage.
     */
    const defaultConfigData = ClientConfig as any as PluginJSON;

    /**
     * The default configuration ephemeral variables are reset to.
     */
    const resetConfigData = ResetConfig as any as PluginJSON;

    /**
     * Last cached configuration in local storage.
     */
    const localConfigData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}') as PluginJSON


    /**
     * Heirarchy:
     * 1. Default config
     * 2. Cached config
     * 3. Reset config
     */
    const startConfigData = {
        ...defaultConfigData,
        ...localConfigData,
        ...resetConfigData
    }

    const [serverConfig, setServerConfig] = useState<PluginJSON | undefined>(startConfigData);

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
        fetchServerConfig();
    }, []);

    /**
     * Retrieve configuration for a given plugin.
     * @param pluginName Name of plugin to retrieve configuration for.
     * @returns Configuration object containing the plugin configuration.
     */
    const getPluginConfig = <T extends ConfigArray>(pluginName: string): T | undefined => {
        // If config has been loaded
        if (!serverConfig) {
            throw (new Error('Server config not loaded'));
        };

        let pluginConfig: T | undefined;

        try {
            pluginConfig = { ...serverConfig[pluginName].config, enabled: serverConfig[pluginName].enabled } as unknown as T;
        } catch (e) {
            console.error(`Error getting config for plugin ${pluginName}:`, e);
        }

        if (!pluginConfig) {
            throw (new Error(`Plugin config not found for plugin ${pluginName}`));
        }

        return pluginConfig;
    }

    /**
     * Saves an array of plugin configurations to the server and optionally updates a state array with the latest data from the server
     * @param configs Array containing the plugin configuration objects to save.
     * @param pluginNames Names of each of the plugins contained in the configuration array.
     * @param pluginState Optional state array to update with the latest data from the server.
     */
    const savePluginConfig = async<T extends ConfigArray[]>(
        configs: T,
        pluginNames: string[],
        pluginState?: [ConfigArray | undefined, React.Dispatch<React.SetStateAction<ConfigArray | undefined>>]
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

            const newState = {
                ...serverConfig
            }
            newState[pluginName].config = newRemotePluginConfig;
            setServerConfig(newState);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
            if (pluginState) {
                (pluginState[index] as any)[1](newState[pluginName].config)
            }
        });
    };

    /**
     * Checks if the plugin config has been modified.
     * @param keys Optional array of keys to watch.
     * @returns boolean
     */
    const isModified = <T extends ConfigArray>(
        pluginConfig: T,
        startPluginConfig: T,
        keys?: string[]
    ) => {

        let filteredStartPluginConfig = startPluginConfig;
        let filteredPluginConfig = pluginConfig;

        if (keys && startPluginConfig && pluginConfig) {
            filteredStartPluginConfig = Object.keys(startPluginConfig)
                .filter((key) => keys.includes(key))
                .reduce((obj: any, key) => {
                    obj[key] = startPluginConfig![key];
                    return obj;
                }, {});

            filteredPluginConfig = Object.keys(pluginConfig)
                .filter((key) => keys.includes(key))
                .reduce((obj: any, key) => {
                    obj[key] = pluginConfig[key];
                    return obj;
                }, {});
        }

        return (
            JSON.stringify(filteredStartPluginConfig) !== JSON.stringify(filteredPluginConfig)
        );
    };

    /**
     * Updates the state of a plugin config object with the provided key/value pair.
     * @param pluginConfig Plugin config object to update.
     * @param key Key to update.
     * @param value New value to store.
     * @param push Whether or not to push the updated config to the server.
     * @param pluginName Name of the plugin to update.
     * @param pluginState State object to update.
     * @param startPluginState State object to compare against.
     * @returns void
     */
    const handleInputChange = <T extends ConfigArray>(
        pluginConfig: T,
        key: keyof T,
        value: T[keyof T]['value'],
        push = false,
        pluginName: string,
        pluginState: [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>],
        startPluginState: [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>]
    ): void => {
        // Deep copy
        const newState = (JSON.parse(JSON.stringify(pluginConfig)));
        newState[key as string].value = value;
        pluginState[1](newState as T);

        if (push) {
            savePluginConfig<[T]>([newState as T], [pluginName], [pluginState] as any);
            startPluginState[1](pluginConfig);
        }
    }

    return <ConfigContext.Provider value={{ getPluginConfig, savePluginConfig, handleInputChange, isModified }}> {children} </ConfigContext.Provider>;
};

export const useConfigContext = () => useContext(ConfigContext);