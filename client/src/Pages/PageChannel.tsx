import { useNeighbourContext } from '../Hooks/neighbourContext';
import { useNeighbourDataContext } from '../Hooks/neighbourDataContext';
import { Phase, DistroData } from '../../../Types';
import { useParams } from 'react-router-dom';
import { Warning } from '../Components/Warnings';
import '../Styles/PageChannel.css'

interface PageChannelProps {
}


export const PageChannel = ({ }: PageChannelProps) => {
    const { selectedNeighbour } = useNeighbourContext();
    const { neighbourData } = useNeighbourDataContext();

    let { phase } = useParams();
    const PHASE = parseInt(phase!) - 1 as Phase;


    if (!selectedNeighbour) {
        return null;
    }

    return (
        <div className="gridChannel">
            <PhaseRow phaseIndex={PHASE as 0 | 1 | 2} value={Math.round(neighbourData?.phases[PHASE]!.voltage || 0)} prefix={'V'} type={'voltage'} neighbourData={neighbourData} />
            <ChannelRow className={'pf'} prefix={'pf'} neighbourData={neighbourData} phaseIndex={PHASE as 0 | 1 | 2} />
            <PhaseRow phaseIndex={PHASE as 0 | 1 | 2} value={Math.round(neighbourData?.phases[PHASE]!.amperage || 0)} prefix={'A'} type={'amperage'} neighbourData={neighbourData} />
            <ChannelRow className={'kva'} prefix={'kVA'} neighbourData={neighbourData} phaseIndex={PHASE as 0 | 1 | 2} />
        </div>
    );
};


const PhaseRow = ({ phaseIndex, value, prefix, neighbourData, type }: { phaseIndex: 0 | 1 | 2, value?: number, prefix: string, type: 'voltage' | 'amperage', neighbourData: DistroData | null }) => {
    return (
        <>
            <div className={`span-eleven-channel ${'l' + (phaseIndex + 1)}`}>
                <span className="valueBasic">
                    {value}
                </span>
                <span className="unitChannel">
                    {prefix}
                </span>
                <Warning data={neighbourData!} type={type} phaseIndex={phaseIndex} />
            </div>
        </>
    )
}

const ChannelRow = ({ phaseIndex, className, prefix, neighbourData }: { phaseIndex: 0 | 1 | 2, className: "kva" | "pf", prefix: string, neighbourData: DistroData | null }) => {
    return (
        <>
            <div className={`span-nine-channel ${className}`}>
                <span className="valueChannel">
                    {className === 'pf'
                        ? neighbourData?.pf
                        : neighbourData?.kva}
                </span>
                <span className="unitChannel">
                    {prefix}
                </span>
                <Warning data={neighbourData!} type={className} phaseIndex={phaseIndex} />
            </div>
        </>
    )
}
