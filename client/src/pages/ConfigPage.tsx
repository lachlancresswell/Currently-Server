// src/components/ConfigPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PluginJSON } from '../../../Types';
import ConfigForm from './ConfigForm';
import { Link, useNavigate } from 'react-router-dom';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import HelpIcon from '@mui/icons-material/Help';

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

    return (
        <div className='pageParent pageConfig'>
            <div className='pageCol'>
                <div className={`pageRow}`}>
                    <Link style={{ color: 'white' }} to={`/options/warnings`}>
                        <ReportProblemIcon />
                    </Link>
                </div>
                <div className={`pageRow}`}>
                    <Link style={{ color: 'white' }} to={`/options/IPPlugin`}>
                        <SettingsEthernetIcon />
                    </Link>
                </div>
            </div>
            <div className='pageCol'>
                <div className={`pageRow}`}>
                    <Link style={{ color: 'white' }} to={`/options/time`}>
                        <AccessTimeIcon />
                    </Link>
                </div>
                <div className={`pageRow}`}>
                    <Link style={{ color: 'white' }} to={`/options/locale`}>
                        <LocationOnIcon />
                    </Link>
                </div>
            </div>
            <div className='pageCol'>
                <div className={`pageRow}`}>
                    <Link style={{ color: 'white' }} to={`/options/power`}>
                        <PowerSettingsNewIcon />
                    </Link>
                </div>
                <div className={`pageRow}`}>
                    <Link style={{ color: 'white' }} to={`/options/system`}>
                        <HelpIcon />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ConfigPage;
