import React from 'react'
import * as Types from '../types'

const DEFAULT_VALUE = '-'

export default function PagePhase({ data, phaseIndex }: { data?: Types.DistroData, phaseIndex?: number }): any {
    if (data && phaseIndex != undefined) {
        const phase = data.phases[phaseIndex];
        return (
            <div className='pageParent pageBasic'>
                <div className='pageCol val fontLarge'>
                    <div className={`pageRow l${phaseIndex + 1}`}>
                        <span className='value'>
                            {phase.voltage || '-'}
                        </span>
                    </div>
                    <div className={`pageRow l${phaseIndex + 1}`}>
                        <span className='value'>
                            {phase.amperage || '-'}
                        </span>
                    </div>
                </div>
                <div className='pageCol denomin fontLarge'>
                    <div className={`pageRow l${phaseIndex + 1}`}>
                        <span>
                            V
                        </span>
                    </div>
                    <div className={`pageRow l${phaseIndex + 1}`}>
                        <span>
                            A
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
                <div className='pageCol val  fontSmall'>
                    <div className={`pageRow pf`}>
                        <span className='value'>
                            {8 || '-'}
                        </span>
                    </div>
                    <div className='pageRow kva'>
                        <span className='value'>
                            {9 || '-'}
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

    } else {
        return <></>
    }
}
