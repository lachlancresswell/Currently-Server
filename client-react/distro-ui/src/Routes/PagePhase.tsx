import React, { useState } from 'react'
import { Logger } from '../log';
import Neighbour from '../Neighbour';
import * as Types from '../types'
import * as Influx from '../Plugins/influx';

let fetching = false;

export default function PagePhase({ phaseIndex, device, log }: { phaseIndex?: number, device?: Neighbour, log: Logger }): any {

    const [state, setState] = useState<{ data: Types.DistroData | undefined, pause: Promise<boolean> }>({
        data: undefined,
        pause: new Promise((res) => setTimeout(() => { res(true) }, 1000))
    });

    log.debug("RENDER - PagePhase");

    if (device && !fetching) {
        fetching = true;
        state.pause.then(() => {
            log.debug('Fetching...')
            Influx.plugin.pollServer(device.db).then((phaseData) => {
                log.debug('Returned.')
                fetching = false;
                setState({ data: phaseData, pause: new Promise((res) => setTimeout(() => { res(true) }, 1000)) })
            })
        });
    }

    const phase = state.data && state.data.phases[phaseIndex || 0] || { voltage: '-', amperage: '-', power: '-' };
    return (
        <div className='pageParent pageBasic'>
            <div className='pageCol val fontLarge'>
                <div className={`pageRow l${(phaseIndex || 0) + 1}`}>
                    <span className='value'>
                        {phase.voltage || '-'}
                    </span>
                </div>
                <div className={`pageRow l${(phaseIndex || 0) + 1}`}>
                    <span className='value'>
                        {phase.amperage || '-'}
                    </span>
                </div>
            </div>
            <div className='pageCol denomin fontLarge'>
                <div className={`pageRow l${(phaseIndex || 0) + 1}`}>
                    <span>
                        V
                    </span>
                </div>
                <div className={`pageRow l${(phaseIndex || 0) + 1}`}>
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

}
