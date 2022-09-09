import React, { useState } from 'react'
import { Logger } from '../log';
import Neighbour from '../Neighbour';
import * as Types from '../types'
import * as Influx from '../Plugins/influx';

let fetching = false;

export default function PageAdv({ device, log }: { device?: Neighbour, log: Logger }): any {

    const [state, setState] = useState<{ data: Types.DistroData | undefined, pause: Promise<boolean> }>({
        data: undefined,
        pause: new Promise((res) => setTimeout(() => { res(true) }, 1000))
    });

    log.debug("RENDER - PageAdv");

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

    return (
        <div className='pageParent pageBasic'>
            <div className='pageCol val'>
                <div className='pageRow l1'>
                    <span className='value'>
                        {state.data?.phases[0].voltage || '-'}
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span className='value'>
                        {state.data?.phases[1].voltage || '-'}
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span className='value'>
                        {state.data?.phases[2].voltage || '-'}
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
                        {state.data?.phases[0].amperage || '-'}
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span className='value'>
                        {state.data?.phases[1].amperage || '-'}
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span className='value'>
                        {state.data?.phases[2].amperage || '-'}
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
                        {state.data?.pf || '-'}
                    </span>
                </div>
                <div className='pageRow kva'>
                    <span className='value'>
                        {state.data?.kva || '-'}
                    </span>
                </div>
                <div className='pageRow hz'>
                    <span className='value'>
                        {state.data?.hz || '-'}
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
