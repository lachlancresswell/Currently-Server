import { useNeighbourContext } from './neighbourContext';
import { useNeighbourDataContext } from './neighbourDataContext';
import LightModeIcon from '@mui/icons-material/LightMode';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import './Styles/PageDisplay.css'
import { ChangeEvent, useState } from 'react';
import useLocalStorage from 'use-local-storage';

interface PageDisplayProps {
}

export const PageDisplay = ({ }: PageDisplayProps) => {
    const { selectedNeighbour } = useNeighbourContext();
    const { neighbourData } = useNeighbourDataContext();
    const [sliderValue, setSliderValue] = useState(50);
    const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [theme, setTheme] = useLocalStorage('theme', defaultDark ? 'dark' : 'light');
    const isChecked = theme === 'light';

    if (!selectedNeighbour) {
        return null;
    }

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    };

    const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSliderValue(parseInt(event.target.value));
    };

    return (
        <div className="gridDisplay">
            <div className={`span-one-display`}>
                <LightModeIcon />
            </div>
            <div className={`span-four-display displaySwitch`}>
                <label className="switch">
                    <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
                    <span className="slider round">
                        <span className="switch-on">{isChecked ? 'ON' : ''}</span>
                        <span className="switch-off">{!isChecked ? 'OFF' : ''}</span>
                    </span>
                </label>
            </div>
            <div className={`span-one-display`}>
                <Brightness4Icon />
            </div>
            <div className={`span-four-display range-slider`}>
                <input type="range" min="0" max="100" value={sliderValue} id="slider" onChange={handleSliderChange} />
            </div>
            <div className={`span-one-display`}>
                <AccessTimeIcon />
            </div>
            <div className={`span-four-display period-buttons`}>
                <div className='period-button'>
                    5s
                </div>
                <div className='period-button'>
                    15s
                </div >
                <div className='period-button'>
                    30s
                </div>
                <div className='period-button'>
                    1m
                </div>
                <div className='period-button'>
                    5m
                </div>
                <div className='period-button'>
                    X
                </div>
            </div>
        </div>
    );
};