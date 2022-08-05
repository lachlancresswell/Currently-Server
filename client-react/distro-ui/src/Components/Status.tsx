import React from 'react'
import LightModeIcon from '@mui/icons-material/LightMode';
import '../Styles/Status.css';
import useLocalStorage from 'use-local-storage'
import Neighbour from '../Neighbour'
import AnnouncementIcon from '@mui/icons-material/Announcement';
import { NavLink } from 'react-router-dom';

export default function Status({
    status,
    neighbours,
    selectedDeviceIndex,
    onDeviceSelected,
    attention,
}: {
    status: { server: boolean, influx: boolean },
    neighbours: Neighbour[],
    selectedDeviceIndex: number,
    onDeviceSelected: (e: number) => void,
    attention: boolean
}) {
    const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [theme, setTheme] = useLocalStorage('theme', defaultDark ? 'dark' : 'light');

    document.body.dataset.theme = theme;

    const switchTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    return (
        <div className={(status.server && status.influx) ? "status connected" : "status disconnected"} >
            <div className="status-left">
            </div>
            <div className="status-centre">
                <select value={selectedDeviceIndex} onChange={(e) => { onDeviceSelected(parseInt(e.target.value)) }}>
                    {neighbours.map((dev, i, array) => {
                        return <option key={dev.id} value={dev.id}>{dev.name}</option>
                    })}
                </select>
            </div>

            <div className="status-right">
                {attention && <NavLink to={'/log'} ><AnnouncementIcon className='icon' /></NavLink>}
                <LightModeIcon className='icon' onClick={switchTheme} />
            </div>
        </div>
    );
}
