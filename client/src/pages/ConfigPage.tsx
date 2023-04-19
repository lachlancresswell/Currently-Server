// src/components/ConfigPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PluginJSON } from '../../../Types';
import ConfigForm from './ConfigForm';
import { useNavigate } from 'react-router-dom';

/**
 * ConfigPage component fetches the master configuration from the server and displays an icon for each plugin discovered.
 */
const ConfigPage: React.FC = () => {
    const [plugins, setPlugins] = useState<PluginJSON>({});
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchPlugins() {
            try {
                const response = await axios.get<PluginJSON>('/config');
                setPlugins(response.data);
            } catch (error) {
                console.error('Error fetching plugins:', error);
            }
        }
        fetchPlugins();
    }, []);

    const handlePluginIconClick = (pluginName: string) => {
        navigate(`/options/${pluginName}`);
    };

    return (
        <div>
            <>
                <h2>Select a plugin to configure:</h2>
                {Object.keys(plugins).map((pluginName) => (
                    <div key={pluginName} onClick={() => handlePluginIconClick(pluginName)}>
                        {/* Replace this div with an icon component of your choice. */}
                        <div>{pluginName}</div>
                    </div>
                ))}
            </>
        </div>
    );
};

export default ConfigPage;
