import React, { useEffect, useState } from 'react'
import * as Types from '../types'
import '../Styles/Page.css';
import LightModeIcon from '@mui/icons-material/LightMode';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function PageDisplay({ }: {}) {
    let startPeriod = JSON.parse(window.localStorage.getItem('period') || '"30s"');
    let startBrightness = JSON.parse(window.localStorage.getItem('brightness') || '100');
    let startTheme = JSON.parse(window.localStorage.getItem('theme') || '"dark"');
    const [period, setPeriod] = useState(startPeriod);
    const [brightness, setBrightness] = useState(startBrightness);
    const [theme, setTheme] = useState(startTheme);
    const body = document.querySelector('body') as any;

    useEffect(() => {
        const storedPeriod = JSON.parse(window.localStorage.getItem('period') || '"30s"')
        setPeriod(storedPeriod);

        const storedBrightness = JSON.parse(window.localStorage.getItem('brightness') || '"100"')
        setBrightness(storedBrightness || '100');
    }, []);

    useEffect(() => {
        localStorage.setItem('period', JSON.stringify(period));
    }, [period]);

    useEffect(() => {
        localStorage.setItem('brightness', JSON.stringify(brightness));
    }, [brightness]);

    useEffect(() => {
        localStorage.setItem('theme', JSON.stringify(theme));
        body!.dataset['theme'] = theme;
    }, [theme]);

    const toggleTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setTheme('dark')
        else setTheme('light');
    }

    return (<div className='pageDisplay'>
        <div className="pageRow2">
            <Brightness4Icon className="pageCol1 displayIcon" />
            <span className="pageCol4">
                <label className="switch">
                    <input type="checkbox" defaultChecked={body!.dataset['theme'] === 'dark'} onChange={toggleTheme} />
                    <span className="slider round"></span>
                </label>
            </span>
        </div>

        <div className="pageRow2">
            <LightModeIcon className="pageCol1 displayIcon" />
            <input className="pageCol4" type="range" min="1" max="100" value={`${brightness}`} onChange={(e) => setBrightness(e.target.value)} />
        </div>
        <div className="pageRow2">
            <AccessTimeIcon className="pageCol1 displayIcon" />
            <span className="pageCol4">
                <button className={`roundedBox ${period === '5s' ? 'selected' : ''}`} onClick={() => setPeriod('5s')}>5s</button>
                <button className={`roundedBox ${period === '15s' ? 'selected' : ''}`} onClick={() => setPeriod('15s')}>15s</button>
                <button className={`roundedBox ${period === '30s' ? 'selected' : ''}`} onClick={() => setPeriod('30s')}>30s</button>
                <button className={`roundedBox ${period === '1m' ? 'selected' : ''}`} onClick={() => setPeriod('1m')}>1m</button>
                <button className={`roundedBox ${period === '5m' ? 'selected' : ''}`} onClick={() => setPeriod('5m')}>5m</button>
                <button className='roundedBox'>X</button>
            </span>
        </div>
    </div>);
}
