import React from 'react'
import * as Types from '../types'
import '../Styles/PagePhase.css';

const DEFAULT_VALUE = '-'

export default function PagePhase({ data, phaseIndex }: { data: Types.DistroData, phaseIndex: number }): any {
    const phase = data.phases[phaseIndex];
    return (
        <>
            <div className={`phase-VA l${phase.phase}`}>
                <div className='voltage'>
                    <span className='value'>
                        {phase.voltage || DEFAULT_VALUE}
                    </span>
                    <span className='denominator'>
                        V
                    </span>
                </div>
                <div className='amperage'>
                    <span className='value'>
                        {phase.amperage || DEFAULT_VALUE}
                    </span>
                    <span className='denominator'>
                        A
                    </span>
                </div>
            </div>
            <div className={`phase-PFkVA`}>
                <div className='pf'>
                    <span className='value'>
                        {data.pf || DEFAULT_VALUE}
                    </span>
                    <span className='denominator'>
                        PF
                    </span>
                </div>
                <div className='kva'>
                    <span className='value'>
                        {data.kva || DEFAULT_VALUE}
                    </span>
                    <span className='denominator'>
                        kVA
                    </span>
                </div>
            </div>
        </>
    )
}
