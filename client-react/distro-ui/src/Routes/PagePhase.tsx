import { Logger } from '../log';
import Neighbour from '../Neighbour';
import * as Types from '../types'
import * as Warnings from '../warnings'

export default function PagePhase({ phaseIndex, device, data, log, config }: { phaseIndex: 0 | 1 | 2, device?: Neighbour, data: Types.DistroData, log: Logger, config?: any | undefined }) {

    const phase = (data && data.phases[phaseIndex || 0]) || { voltage: '-', amperage: '-', power: '-' };
    return (
        <div className='pageParent pageBasic'>
            <div className='pageCol val fontLarge'>
                <div className={`pageRow l${(phaseIndex || 0) + 1}`}>
                    <span className='value'>
                        {phase.voltage}
                    </span>
                </div>
                <div className={`pageRow l${(phaseIndex || 0) + 1}`}>
                    <span className='value'>
                        {phase.amperage}
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
                    {data && config && <Warnings.Warning config={config} data={data} type={'voltage'} phaseIndex={phaseIndex} />}
                </div>
                <div className='pageRow'>
                    {data && config && <Warnings.Warning config={config} data={data} type={'amperage'} phaseIndex={phaseIndex} />}
                </div>
            </div>
            <div className='pageCol val  fontSmall'>
                <div className={`pageRow pf`}>
                    <span className='value'>
                        {data && data.pf}
                    </span>
                </div>
                <div className='pageRow kva'>
                    <span className='value'>
                        {data && data.kva}
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
