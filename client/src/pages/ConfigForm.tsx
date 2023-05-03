// src/components/ConfigForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ConfigVariableMetadata, ConfigArray } from '../../../Types';
import { useParams } from 'react-router-dom';
import '../Styles/Config.css';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 124,
    height: 68,
    padding: 14,
    '& .MuiSwitch-switchBase': {
        margin: 2,
        padding: 0,
        transform: 'translateX(6px)',
        '&.Mui-checked': {
            color: '#fff',
            transform: 'translateX(44px)',
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
        width: 64,
        height: 64,
        '&:before': {
            content: "''",
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
        },
    },
    '& .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
        borderRadius: 40 / 2,
    },
}));


/**
 * ConfigForm component fetches the configuration for a specific plugin and lists all variables with `display` set to `true`.
 * Allows the user to edit the values and send the updated configuration back to the server.
 */
const ConfigForm: React.FC = () => {
    const { pluginName } = useParams<{ pluginName: string }>();
    const [startPluginConfig, setStartPluginConfig] = useState<ConfigArray | null>(null);
    const [pluginConfig, setPluginConfig] = useState<ConfigArray | null>(null);
    const [refresh, setRefresh] = useState<boolean>(true);;

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

    if (!pluginConfig) {
        return <div>Loading...</div>;
    }

    const displayedConfigKeys = pluginConfig ? Object.keys(pluginConfig).filter(
        (key) => pluginConfig ? pluginConfig[key].display : false
    ) : [''];

    displayedConfigKeys.sort(
        (a, b) => pluginConfig![b].priority! - pluginConfig![a].priority!
    );

    const modified = JSON.stringify(startPluginConfig) !== JSON.stringify(pluginConfig);

    const renderInputField = (key: string, variableMetadata: ConfigVariableMetadata<any>) => {
        switch (variableMetadata.type) {
            case 'boolean':
                return (
                    <div><MaterialUISwitch
                        size="medium"
                        checked={variableMetadata.value}
                        onChange={(e) => handleInputChange(key, e.target.checked)} />
                    </div>
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
        <div className='pageParent pageCfgForm'>
            <div className='cfgFormCol cfgFormRowRight'>
                {displayedConfigKeys.map((key) => {
                    const variableMetadata = pluginConfig![key];
                    return (
                        <div className='configTitle'>
                            {variableMetadata.readableName}
                        </div>
                    );
                })}
                <button style={{
                    color: modified ? 'red' : 'grey'
                }}
                    disabled={!modified}
                    onClick={handleCancel}>X</button>
            </div>
            <div className='cfgFormCol cfgFormRowLeft'>
                {displayedConfigKeys.map((key) => {
                    const variableMetadata = pluginConfig![key];
                    return (<div>
                        {renderInputField(key, variableMetadata)}
                    </div>
                    );
                })}
                <button style={{
                    color: modified ? 'green' : 'grey'
                }}
                    disabled={!modified}
                    onClick={handleConfirm}>✔</button>
            </div>
        </div>
    );

};

export default ConfigForm;
