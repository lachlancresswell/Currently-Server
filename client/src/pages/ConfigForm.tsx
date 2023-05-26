// src/components/ConfigForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ConfigVariableMetadata, ConfigArray, Neighbour } from '../../../Types';
import '../Styles/Config.css';
import { useNeighbourContext } from '../neighbourContext';


interface props {
    ConfigElement: React.FC<{ pluginConfig: ConfigArray, handleInputChange: (key: string, value: any) => void, selectedNeighbour: Neighbour }>
}

/**
 * ConfigForm component fetches the configuration for a specific plugin and lists all variables with `display` set to `true`.
 * Allows the user to edit the values and send the updated configuration back to the server.
 */

const ConfigForm: React.FC<props> = ({ ConfigElement }) => {
    const { selectedNeighbour } = useNeighbourContext();
    const pluginName = 'IPPlugin';
    const [startPluginConfig, setStartPluginConfig] = useState<ConfigArray | null>(null);
    const [pluginConfig, setPluginConfig] = useState<ConfigArray | null>(null);
    const [refresh, setRefresh] = useState<boolean>(true);

    useEffect(() => {
        async function fetchPluginConfig() {
            try {
                const response = await axios.get<ConfigArray>(`/config/${pluginName}`);
                setStartPluginConfig(response.data);
                setPluginConfig(response.data);
            } catch (error) {
                console.error(`Error fetching config for plugin ${pluginName}:`, error);
            }
        }
        fetchPluginConfig();
    }, [refresh]);

    const handleInputChange = (
        key: string,
        value: ConfigVariableMetadata<string | number | boolean | 'ipaddress' | 'timezone'>['value']
    ) => {
        if (pluginConfig) {
            if (pluginConfig[key].type === 'number' && typeof (value) !== 'number') {
                value = parseInt(value as any);
            }


            const obj = {
                [key]: {
                    ...pluginConfig[key],
                    value,
                }
            }
            setPluginConfig({
                ...pluginConfig,
                ...obj
            });
        }
    };

    const handleConfirm = async () => {
        if (pluginConfig) {
            try {
                await axios.put(`/config/${pluginName}`, pluginConfig);
            } catch (error) {
                console.error(`Error updating config for plugin ${pluginName}:`, error);
            }

            setRefresh(!refresh);
        }
    };

    const handleCancel = async () => {
        setPluginConfig(startPluginConfig);
    }

    if (!pluginConfig || !selectedNeighbour) {
        return <div>Loading...</div>;
    }

    const displayedConfigKeys = pluginConfig ? Object.keys(pluginConfig).filter(
        (key) => pluginConfig ? pluginConfig[key].display : false
    ) : [''];

    displayedConfigKeys.sort(
        (a, b) => pluginConfig![b].priority! - pluginConfig![a].priority!
    );

    const modified = JSON.stringify(startPluginConfig) !== JSON.stringify(pluginConfig);

    return <ConfigElement pluginConfig={pluginConfig} handleInputChange={handleInputChange} selectedNeighbour={selectedNeighbour} />

};

export default ConfigForm;
