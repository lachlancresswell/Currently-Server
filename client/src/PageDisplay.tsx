import { useNeighbourContext } from './neighbourContext';
import LightModeIcon from '@mui/icons-material/LightMode';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import './Styles/PageDisplay.css'
import { ChangeEvent, useState } from 'react';
import { useTheme } from './hooks';

export const PageDisplay = ({ }: {}) => {
    const [sliderValue, setSliderValue] = useState(50);
    const { theme, switchTheme } = useTheme();
    const isChecked = theme === 'light';

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => switchTheme()

    const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => setSliderValue(parseInt(event.target.value));

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
                <PeriodButton text={'5s'} />
                <PeriodButton text={'15s'} />
                <PeriodButton text={'30s'} />
                <PeriodButton text={'1m'} />
                <PeriodButton text={'5m'} />
                <PeriodButton text={'X'} />
            </div>
        </div>
    );
};

/**
 * Buttons to control the screen-on period
 */
const PeriodButton = ({ text }: { text: string }) => {
    return (
        <div className='period-button'>
            {text}
        </div>
    )
}