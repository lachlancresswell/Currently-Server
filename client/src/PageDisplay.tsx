import { useNeighbourContext } from './neighbourContext';
import { useNeighbourDataContext } from './neighbourDataContext';
import { PhaseData, DistroData } from '../../Types';
import LightModeIcon from '@mui/icons-material/LightMode';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import './Styles/PageDisplay.css'

interface PageDisplayProps {
}

export const PageDisplay = ({ }: PageDisplayProps) => {
    const { selectedNeighbour } = useNeighbourContext();
    const { neighbourData } = useNeighbourDataContext();

    if (!selectedNeighbour) {
        return null;
    }

    return (
        <div className="gridDisplay">
            <div className={`span-one-display`}>
                <LightModeIcon />
            </div>
            <div className={`span-four-display displaySwitch`}>
                <label className="switch">
                    <input type="checkbox" />
                    <span className="slider round">
                        <span className="switch-on">ON</span>
                        <span className="switch-off">OFF</span>
                    </span>
                </label>
            </div>
            <div className={`span-one-display`}>
                <Brightness4Icon />
            </div>
            <div className={`span-four-display displaySlider`}>
                <input type="range" min="0" max="100" value="50" id="slider" />
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


const PhaseRow = ({ phaseIndex, neighbourData }: { phaseIndex: 0 | 1 | 2, neighbourData: DistroData | null }) => {
    return (
        <>
            <div className={`span-six-display ${'l' + (phaseIndex + 1)}`}>
                <span className="valueBasic">
                    {(neighbourData?.phases[phaseIndex]!.voltage! > -1 && neighbourData?.phases[phaseIndex]!.voltage)}
                </span>
                <span className="unitBasic">
                    v
                </span>
            </div>
            <div className={`span-four-display ${'l' + (phaseIndex + 1)}`}>
                <div className='basicAmperage'>
                    <span className="valueBasicAmperage">
                        {(neighbourData?.phases[phaseIndex]!.amperage! > -1 ? neighbourData?.phases[phaseIndex]!.amperage : '-')}
                    </span>
                    <span className="unitBasic">
                        a
                    </span>
                </div>
            </div>
        </>
    )
}

const DisplayRow = ({ className, prefix, neighbourData }: { className: string, prefix: string, neighbourData: DistroData | null }) => {
    return (
        <>
            <div className={`span-ten-display ${className}`}>
                <span className="valueBasic">
                    {prefix === 'pf' ? neighbourData?.pf
                        : neighbourData?.kva}
                </span>
                <span className="unitBasic">
                    {prefix}
                </span>
            </div>
        </>
    )
}