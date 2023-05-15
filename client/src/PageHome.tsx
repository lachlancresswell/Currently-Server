import { useNeighbourContext } from './neighbourContext';
import { useNeighbourDataContext } from './neighbourDataContext';
import { DistroData } from '../../Types';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import RefreshIcon from '@mui/icons-material/Refresh';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PublicIcon from '@mui/icons-material/Public';
import { Warning } from './Warnings';
import { useConfigDataContext } from './configContext';

interface PageAdvProps {
}

export const PageHome = ({ }: PageAdvProps) => {
    const { selectedNeighbour } = useNeighbourContext();
    const { neighbourData } = useNeighbourDataContext();
    const { configData } = useConfigDataContext();

    if (!selectedNeighbour) {
        return null;
    }

    return (

        <div className="grid">
            <PhaseReadout phaseIndex={1} neighbourData={neighbourData} />
            <div className="homeCircle">
                <Warning data={neighbourData!} type={'va'} phaseIndex={1} />
            </div>
            <div className='homeIcon'>
                <SettingsEthernetIcon />
            </div>
            <div>
                <ValueStatusSymbol status={configData?.IPPlugin?.config?.ipaddress.value} />
            </div>
            <PhaseReadout phaseIndex={2} neighbourData={neighbourData} />
            <div className="homeCircle">
                <Warning data={neighbourData!} type={'va'} phaseIndex={1} />
            </div>
            <div className='homeIcon'>
                <RefreshIcon />
            </div>
            <div>✓</div>
            <PhaseReadout phaseIndex={3} neighbourData={neighbourData} />
            <div className="homeCircle">
                <Warning data={neighbourData!} type={'va'} phaseIndex={2} />
            </div>
            <div className='homeIcon'>
                <RemoveCircleOutlineIcon />
            </div>
            <div>✓</div>
            <div className="span-two hz">50 HZ</div>
            <div className="homeCircle">
                <Warning data={neighbourData!} type={'hz'} />
            </div>
            <div className='homeIcon'>
                <PublicIcon />
            </div>
            <div>
                <ValueStatusSymbol status={configData?.IPPlugin?.config?.internetStatus.value} />
            </div>
        </div>
    );
}

const ValueStatusSymbol = ({ status }: { status: any }) => {
    return <>{
        status ? (
            <span className='statusIcon' style={{ color: 'green' }}>✓</span>
        ) : (
            <span className='statusIcon' style={{ color: 'red' }}>X</span>
        )
    }</>
}

const PhaseReadout = ({ phaseIndex, neighbourData }: { phaseIndex: number, neighbourData: DistroData | null }) => {
    return (
        <>
            <div className={`${'l' + phaseIndex}`}>
                <span className="value">
                    {neighbourData?.phases[phaseIndex - 1].voltage}
                </span>
                <span className="unit">V</span>
            </div>
            <div className={`cellAmperage ${'l' + phaseIndex}`}>
                <span className="valueAmperage">
                    {neighbourData?.phases[phaseIndex - 1].amperage}
                </span>
                <span className="unit">A</span>
            </div>
        </>
    )
}