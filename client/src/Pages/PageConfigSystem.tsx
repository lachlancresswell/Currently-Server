import '../Styles/PageConfigSystem.css';
import { SystemOptions } from '../../../Types';
import { useConfigContext } from '../Hooks/useConfig';
import { useState } from 'react';

export const PLUGIN_NAME = 'SystemPlugin';

export const SystemSettings = ({ }: {}) => {
    const { getPluginConfig, handleInputChange } = useConfigContext();

    const [pluginConfig, setPluginConfig] = useState<SystemOptions | undefined>(getPluginConfig<SystemOptions>(PLUGIN_NAME));
    const [startPluginConfig, setStartPluginConfig] = useState<SystemOptions | undefined>(getPluginConfig<SystemOptions>(PLUGIN_NAME));

    const onClick = () => {
        handleInputChange(pluginConfig!, 'reboot', true, true, PLUGIN_NAME, [pluginConfig, setPluginConfig], [startPluginConfig, setStartPluginConfig]);
    }

    return (
        <div className="gridSystem">
            <button onClick={onClick}>Restart</button>
        </div >
    )
}
