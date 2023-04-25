import { useNeighbourContext } from './neighbourContext';
import { useNeighbourDataContext } from './neighbourDataContext';
import { useEffect, useState } from 'react';
import { PhaseData, Phase } from '../../Types';

interface PageAdvProps {
}

export const PageAdv = ({ }: PageAdvProps) => {
    const { selectedNeighbour } = useNeighbourContext();
    const { neighbourData } = useNeighbourDataContext();
    const [_selectedPhase, setSelectedPhase] = useState<PhaseData | null>(null);


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
            <div className='pageCol val'>
                <div className='pageRow l1'>
                    <span className='value'>
                        {(neighbourData?.phases[0]!.voltage! > -1 && neighbourData?.phases[0]!.voltage)}
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span className='value'>
                        {(neighbourData?.phases[1]!.voltage! > -1 && neighbourData?.phases[1]!.voltage)}
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span className='value'>
                        {(neighbourData?.phases[2]!.voltage! > -1 && neighbourData?.phases[2]!.voltage)}
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
            <div className='pageCol val'>
                <div className='pageRow l1'>
                    <span className='value'>
                        {(neighbourData?.phases[0]!.amperage! > -1 ? neighbourData?.phases[0]!.amperage : '-')}
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span className='value'>
                        {(neighbourData?.phases[1]!.amperage! > -1 ? neighbourData?.phases[1]!.amperage : '-')}
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span className='value'>
                        {(neighbourData?.phases[2]!.amperage! > -1 ? neighbourData?.phases[2]!.amperage : '-')}
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
            <div className='pageCol val  fontSmall'>
                <div className={`pageRow pf`}>
                    <span className='value'>
                        {neighbourData?.pf}
                    </span>
                </div>
                <div className='pageRow kva'>
                    <span className='value'>
                        {neighbourData?.kva}
                    </span>
                </div>
                <div className='pageRow hz'>
                    <span className='value'>
                        {neighbourData?.hz}
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
                <div className={`pageRow hz`}>
                    <span>
                        hz
                    </span>
                </div>
            </div>
        </div>
    );
}
