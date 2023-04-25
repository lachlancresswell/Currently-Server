import { NeighbourProvider, useNeighbourContext } from './neighbourContext';
import { NeighbourDataProvider, useNeighbourDataContext } from './neighbourDataContext';
import { useEffect, useState } from 'react';
import { PhaseData, Phase } from '../../Types';
import { useParams } from 'react-router-dom';
import { Warning } from './Warnings';

interface PageBasicProps {
}

export const PageChannel = ({ }: PageBasicProps) => {
    const { selectedNeighbour } = useNeighbourContext();
    const { neighbourData } = useNeighbourDataContext();
    const [selectedPhase, setSelectedPhase] = useState<PhaseData | null>(null);

    let { phase } = useParams();

    const phaseNumber = parseInt(phase!) - 1;

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
        <div className='pageParent pageBasic'>
            <div className='pageCol val fontLarge'>
                <div className={`pageRow l${(phaseNumber || 0) + 1}`}>
                    <span className='value'>
                        {neighbourData?.phases[phaseNumber].voltage}
                    </span>
                </div>
                <div className={`pageRow l${(phaseNumber || 0) + 1}`}>
                    <span className='value'>
                        {neighbourData?.phases[phaseNumber].amperage}
                    </span>
                </div>
            </div>
            <div className='pageCol denomin fontLarge'>
                <div className={`pageRow l${(phaseNumber || 0) + 1}`}>
                    <span>
                        V
                    </span>
                </div>
                <div className={`pageRow l${(phaseNumber || 0) + 1}`}>
                    <span>
                        A
                    </span>
                </div>
            </div>
            <div className='pageCol'>
                <div className='pageRow'>
                    {neighbourData && <Warning data={neighbourData} type={'voltage'} phaseIndex={phaseNumber as 0 | 1 | 2} />}
                </div>
                <div className='pageRow'>
                    {neighbourData && <Warning data={neighbourData} type={'amperage'} phaseIndex={phaseNumber as 0 | 1 | 2} />}
                </div>
            </div>
            <div className='pageCol val  fontSmall'>
                <div className={`pageRow pf`}>
                    <span className='value'>
                        {neighbourData && neighbourData.pf}
                    </span>
                </div>
                <div className='pageRow kva'>
                    <span className='value'>
                        {neighbourData && neighbourData.kva}
                    </span>
                </div>
            </div>
            <div className='pageCol denomin fontSmall'>
                <div className={`pageRow pf`}>
                    <span>
                        pF
                    </span>
                </div>
                <div className={`pageRow kva`}>
                    <span>
                        kVA
                    </span>
                </div>
            </div>
            <div className='pageCol'>
                <div className='pageRow'>
                    <span className='circle green'>
                    </span>
                </div>
                <div className='pageRow'>
                    <span className='circle orange'>
                    </span>
                </div>
            </div>
        </div>
    );
};
