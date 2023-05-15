import { useNeighbourContext } from './neighbourContext';
import { useNeighbourDataContext } from './neighbourDataContext';
import { useEffect, useState } from 'react';
import { PhaseData, DistroData } from '../../Types';
import './Styles/PageAdv.css'

interface PageAdvProps {
}

export const PageAdv = ({ }: PageAdvProps) => {
    const { selectedNeighbour } = useNeighbourContext();
    const { neighbourData } = useNeighbourDataContext();

    if (!selectedNeighbour) {
        return null;
    }

    return (
        <div className="gridAdv">
            <PhaseRow phaseIndex={0} neighbourData={neighbourData} />
            <AdvRow className={'pf'} prefix={'pf'} neighbourData={neighbourData} />
            <PhaseRow phaseIndex={1} neighbourData={neighbourData} />
            <AdvRow className={'kva'} prefix={'kVA'} neighbourData={neighbourData} />
            <PhaseRow phaseIndex={2} neighbourData={neighbourData} />
            <AdvRow className={'hz'} prefix={'HZ'} neighbourData={neighbourData} />
        </div>
    );
};


const PhaseRow = ({ phaseIndex, neighbourData }: { phaseIndex: 0 | 1 | 2, neighbourData: DistroData | null }) => {
    return (
        <>
            <div className={`span-six-adv ${'l' + (phaseIndex + 1)}`}>
                <span className="valueBasic">
                    {(neighbourData?.phases[phaseIndex]!.voltage! > -1 && neighbourData?.phases[phaseIndex]!.voltage)}
                </span>
                <span className="unitBasic">
                    v
                </span>
            </div>
            <div className={`span-four-adv ${'l' + (phaseIndex + 1)}`}>
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

const AdvRow = ({ className, prefix, neighbourData }: { className: string, prefix: string, neighbourData: DistroData | null }) => {
    return (
        <>
            <div className={`span-ten-adv ${className}`}>
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