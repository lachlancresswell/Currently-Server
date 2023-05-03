import { useNeighbourContext } from './neighbourContext';
import { useNeighbourDataContext } from './neighbourDataContext';
import { useEffect, useState } from 'react';
import { PhaseData, Phase } from '../../Types';
import { Warning } from './Warnings';

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
        <div className='pageParent pageBasic'>
            <div className='pageCol val-voltage'>
                <div className='pageRow l1'>
                    <span className='value'>
                        {neighbourData?.phases[0].voltage}
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span className='value'>
                        {neighbourData?.phases[1].voltage}
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span className='value'>
                        {neighbourData?.phases[2].voltage}
                    </span>
                </div>
            </div>
            <div className='pageCol denomin'>
                <div className='pageRow l1'>
                    <span>
                        V
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span>
                        V
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span>
                        V
                    </span>
                </div>
            </div>
            <div className='pageCol val-amperage'>
                <div className='pageRow l1'>
                    <span className='value'>
                        {neighbourData?.phases[0].amperage}
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span className='value'>
                        {neighbourData?.phases[1].amperage}
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span className='value'>
                        {neighbourData?.phases[2].amperage}
                    </span>
                </div>
            </div>
            <div className='pageCol denomin'>
                <div className='pageRow l1'>
                    <span>
                        A
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span>
                        A
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span>
                        A
                    </span>
                </div>
            </div>
            <div className='pageCol'>
                <div className='pageRow'>
                    {neighbourData && <Warning data={neighbourData} type={'va'} phaseIndex={0} />}
                </div>
                <div className='pageRow'>
                    {neighbourData && <Warning data={neighbourData} type={'va'} phaseIndex={1} />}
                </div>
                <div className='pageRow'>
                    {neighbourData && <Warning data={neighbourData} type={'va'} phaseIndex={2} />}
                </div>
            </div>
        </div>
    );
};
