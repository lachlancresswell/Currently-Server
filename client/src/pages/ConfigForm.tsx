// src/components/ConfigForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ConfigVariableMetadata, ConfigArray } from '../../../Types';
import { useParams } from 'react-router-dom';

/**
 * ConfigForm component fetches the configuration for a specific plugin and lists all variables with `display` set to `true`.
 * Allows the user to edit the values and send the updated configuration back to the server.
 */
const ConfigForm: React.FC = () => {
    const { pluginName } = useParams<{ pluginName: string }>();
    const [pluginConfig, setPluginConfig] = useState<ConfigArray | null>(null);

    useEffect(() => {
        async function fetchPluginConfig() {
            try {
                const response = await axios.get<ConfigArray>(`/config/${pluginName}`);
                setPluginConfig(response.data);
            } catch (error) {
                console.error(`Error fetching config for plugin ${pluginName}:`, error);
            }
        }
        fetchPluginConfig();
    }, [pluginName]);

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
        }
    };

    if (!pluginConfig) {
        return <div>Loading...</div>;
    }

    const displayedConfigKeys = pluginConfig ? Object.keys(pluginConfig).filter(
        (key) => pluginConfig ? pluginConfig[key].display : false
    ) : [''];

    displayedConfigKeys.sort(
        (a, b) => pluginConfig![b].priority! - pluginConfig![a].priority!
    );

    const renderInputField = (key: string, variableMetadata: ConfigVariableMetadata<any>) => {
        switch (variableMetadata.type) {
            case 'boolean':
                return (
                    <input
                        type="checkbox"
                        checked={variableMetadata.value}
                        onChange={(e) => handleInputChange(key, e.target.checked)}
                    />
                );
            default:
                return (
                    <input
                        type={variableMetadata.type === 'number' ? 'number' : 'text'}
                        value={variableMetadata.value}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                );
        }
    };

    return (
        <div>
            <h2>{pluginName} Configuration</h2>
            {displayedConfigKeys.map((key) => {
                const variableMetadata = pluginConfig![key];
                return (
                    <div key={key}>
                        <label>
                            {variableMetadata.readableName}
                            {renderInputField(key, variableMetadata)}
                        </label>
                    </div>
                );
            })}
            <button onClick={handleConfirm}>Confirm</button>
        </div>
    );

};

export default ConfigForm;
