import { useNeighbourContext } from './neighbourContext';
import { useNeighbourDataContext } from './neighbourDataContext';
import { useEffect, useState } from 'react';
import { PhaseData, DistroData } from '../../Types';
import { Warning } from './Warnings';
import './Styles/PageBasic.css'

interface PageBasicProps {
}

export const PageBasic = ({ }: PageBasicProps) => {
    const { selectedNeighbour } = useNeighbourContext();
    const { neighbourData } = useNeighbourDataContext();
    const [selectedPhase, setSelectedPhase] = useState<PhaseData | null>(null);

    useEffect(() => {
        if (neighbourData) {
            const PHASE = 1;
            setSelectedPhase({
                voltage: neighbourData.phases[PHASE].voltage!,
                amperage: neighbourData.phases[PHASE].amperage,
                phase: PHASE,
            });
        }
    }, [neighbourData]);

    if (!selectedNeighbour) {
        return null;
    }

    return (
        <div className="gridBasic">
            <PhaseRow phaseIndex={0} neighbourData={neighbourData} />
            <PhaseRow phaseIndex={1} neighbourData={neighbourData} />
            <PhaseRow phaseIndex={2} neighbourData={neighbourData} />
        </div>
    );
};


const PhaseRow = ({ phaseIndex, neighbourData }: { phaseIndex: 0 | 1 | 2, neighbourData: DistroData | null }) => {
    return (
        <>
            <div className={`span-five-basic ${'l' + (phaseIndex + 1)}`}>
                <span className="valueBasic">
                    {/* {neighbourData?.phases[phaseIndex].voltage} */}
                    240
                </span>
                <span className="unitBasic">
                    v
                </span>
            </div>
            <div className={`span-three-basic ${'l' + (phaseIndex + 1)}`}>
                <div className='basicAmperage'>
                    <span className="valueBasicAmperage">
                        {/* {neighbourData?.phases[phaseIndex].amperage} */}
                        10
                    </span>
                    <span className="unitBasic">
                        a
                    </span>
                </div>
            </div>
            <div className='span-two-basic'>
                {neighbourData && <Warning data={neighbourData} type={'kva'} phaseIndex={phaseIndex} />}
            </div>
        </>
    )
}