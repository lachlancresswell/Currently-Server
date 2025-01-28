// src/components/ConfigPage.tsx
import React from 'react';
import { ConfigArray } from '../../../Types';
import { Link } from 'react-router-dom';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import HelpIcon from '@mui/icons-material/Help';
import { useConfigContext, } from '../Hooks/useConfig';
import { PLUGIN_NAME as TZ } from './PageConfigTimezone';
import { PLUGIN_NAME as Warnings } from './PageConfigWarnings';
import { PLUGIN_NAME as Locale } from './PageConfigLocale';
import { PLUGIN_NAME as Network } from './PageConfigNetwork';
import { PLUGIN_NAME as System } from './PageConfigSystem';
import { PLUGIN_NAME as Versions } from './PageConfigVersions';

const plugins = [{
    name: Warnings,
    icon: <ReportProblemIcon />,
    path: `/options/warnings`
}, {
    name: Network,
    icon: <SettingsEthernetIcon />,
    path: `/options/network`
}, {
    name: TZ,
    icon: <AccessTimeIcon />,
    path: `/options/timezone`
}, {
    name: Locale,
    icon: <LocationOnIcon />,
    path: `/options/locale`
}, {
    name: System,
    icon: <PowerSettingsNewIcon />,
    path: `/options/system`
}, {
    name: Versions,
    icon: <HelpIcon />,
    path: `/options/versions`
}]

/**
 * ConfigPage component fetches the master configuration from the server and displays an icon for each plugin discovered.
 */
const ConfigPage: React.FC = () => {

    const { getPluginConfig } = useConfigContext();

    const loadedPlugins = plugins.filter((plugin) => {
        const config = getPluginConfig<ConfigArray>(plugin.name);
        console.log(config)
        return config?.enabled;
    })

    return (
        <div className='pageParent pageConfig' >
            {loadedPlugins.reduce((pairs, plugin, index) => {
                if (index % 2 === 0) {
                    pairs.push(
                        <div className='pageCol'>
                            <div className='pageRow'>
                                <Link style={{ color: 'white' }} to={plugin.path}>
                                    {plugin.icon}
                                </Link>
                            </div>
                            <div className='pageRow'>
                                {loadedPlugins[index + 1] && (
                                    <Link style={{ color: 'white' }} to={loadedPlugins[index + 1].path}>
                                        {loadedPlugins[index + 1].icon}
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                }
                return pairs;
            }, [] as JSX.Element[])}
        </div >);
};

export default ConfigPage;
