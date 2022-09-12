import { Logger } from '../log';
import Neighbour from '../Neighbour';
import * as Types from '../types'

export default function PagePhase({ phaseIndex, device, data, log, config }: { phaseIndex: number, device?: Neighbour, data: Types.DistroData, log: Logger, config?: any | undefined }) {

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
                        {8}
                    </span>
                </div>
                <div className='pageRow kva'>
                    <span className='value'>
                        {9}
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
