// src/components/ConfigForm.tsx
import { useState, useEffect } from 'react';
import { ConfigArray } from '../../../Types';
import '../Styles/Config.css';
import { useNeighbourContext } from '../neighbourContext';
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
    const [startPluginConfig, setStartPluginConfig] = useState<T>();
    const [pluginConfig, setPluginConfig] = useState<T>();
    const [refresh, setRefresh] = useState<boolean>(true);

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
        if (pluginConfig) {
            saveConfig(pluginName, pluginConfig)
            setRefresh(!refresh);
        }
    };

    /**
     * Resets the plugin config to the initial state.
     * @returns void
     */
    const handleCancel = async () => {
        setPluginConfig(startPluginConfig);
    }

    function handleInputChange<T extends ConfigArray>(
        key: keyof T,
        value: T[keyof T]['value'],
        save?: boolean
    ) {
        if (pluginConfig) {
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
            }
        }
    };

    const modified = JSON.stringify(startPluginConfig) !== JSON.stringify(pluginConfig);

    return {
        pluginConfig, selectedNeighbour, handleInputChange, handleConfirm, handleCancel
    }
}