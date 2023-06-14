// src/components/ConfigForm.tsx
import { useState, useEffect } from 'react';
import { ConfigArray } from '../../../Types';
import '../Styles/Config.css';
import { useNeighbourContext } from './neighbourContext';
import { useConfigDataContext } from './configContext';
import axios from 'axios';


/**
 * Loads the configuration of the requested plugin.
 * @param pluginName Name of the plugin to load the config from.
 * @returns Object containing the plugin configuration
 */
export const loadConfig = async <T extends ConfigArray>(pluginName: string) => {
    try {
        const response = await axios.get<ConfigArray>(`/config/${pluginName}`);
        return response.data as T;
    } catch (error) {
        console.error(`Error fetching config for plugin ${pluginName}:`, error);
    }
}

/**
 * Saves the provided plugin config to the database.
 * @param pluginName Name of the plugin to save the config for.
 * @param pluginConfig Config to save.
 * @returns void
 */
export const saveConfig = async (pluginName: string, pluginConfig: ConfigArray) => {
    try {
        await axios.put(`/config/${pluginName}`, pluginConfig);
    } catch (error) {
        console.error(`Error updating config for plugin ${pluginName}:`, error);
    }
}

export function useConfig<T extends ConfigArray>(pluginName: string) {
    const { selectedNeighbour } = useNeighbourContext();
    const { configData } = useConfigDataContext();
    const [startPluginConfig, setStartPluginConfig] = useState<T>();
    const [pluginConfig, setPluginConfig] = useState<T>();
    const [refresh, setRefresh] = useState<boolean>(true);
    const [name, setName] = useState<string | undefined>(selectedNeighbour?.name);

    /**
     * Fetches the plugin config from the database on mount.
     * @returns void
     * @throws Error if pluginConfig is null.
     */
    useEffect(() => {
        async function fetchPluginConfig() {
            const serverConfig = await loadConfig<T>(pluginName)
            setPluginConfig(serverConfig);
            setStartPluginConfig(serverConfig);
        }
        fetchPluginConfig();
    }, [refresh]);

    /**
     * Saves the plugin config to the database.
     * @returns void
     */
    const handleConfirm = async () => {

        // TODO: Fix this
        if ((JSON.stringify(newNeighbour) !== JSON.stringify(selectedNeighbour))) {
            if (configData && configData.MDNSPlugin && configData.MDNSPlugin.config && name) {
                const deviceName = {
                    ...configData.MDNSPlugin.config.deviceName,
                    ...{ value: name }
                }
                const config = {
                    ...configData.MDNSPlugin.config,
                    ...{ deviceName }
                }
                saveConfig('MDNSPlugin', config)
                setRefresh(!refresh);
            }
        }

        if (pluginConfig) {
            saveConfig(pluginName, pluginConfig)
            setRefresh(!refresh);
        }
    };

    /**
     * Resets the plugin config to the initial state.
     * @returns void
     */
    const handleCancel = async () => setPluginConfig(startPluginConfig);

    function handleInputChange<T extends ConfigArray>(
        key: keyof T,
        value: T[keyof T]['value'],
        save?: boolean,
        selectedNeighbour?: boolean
    ) {
        if (selectedNeighbour) {
            setName(value as string);
        } else if (pluginConfig) {
            // Convert the value to the correct type if necessary.
            if (pluginConfig[key as string].type === 'number' && typeof (value) !== 'number') {
                value = parseInt(value as any);
            }

            // Update the config state with the new value.
            const newConfig = {
                [key]: {
                    ...pluginConfig[key as string],
                    value,
                }
            }

            setPluginConfig({
                ...pluginConfig,
                ...newConfig
            });

            // Save the config to the database immediately if save is true.
            if (save) {
                saveConfig(pluginName, { ...newConfig } as ConfigArray)
                setRefresh(!refresh);
            }
        }
    };

    // TODO Fix this
    if (name === undefined && selectedNeighbour?.name) {
        setName(selectedNeighbour.name)
    }

    const newNeighbour = {
        ...selectedNeighbour,
        ...{ name }
    };


    /**
     * Checks if the plugin config has been modified.
     * @param keys Optional array of keys to watch.
     * @returns boolean
     */
    const isModified = (keys?: string[]) => {
        let filteredStartPluginConfig = startPluginConfig;
        let filteredPluginConfig = pluginConfig;

        if (keys && startPluginConfig && pluginConfig) {
            filteredStartPluginConfig = Object.keys(startPluginConfig)
                .filter((key) => keys.includes(key))
                .reduce((obj: any, key) => {
                    obj[key] = startPluginConfig[key];
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
            JSON.stringify(filteredStartPluginConfig) !== JSON.stringify(filteredPluginConfig) ||
            JSON.stringify(newNeighbour) !== JSON.stringify(selectedNeighbour)
        );
    };


    return {
        pluginConfig, selectedNeighbour: newNeighbour, handleInputChange, handleConfirm, handleCancel, isModified
    }
}