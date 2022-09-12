import { Logger } from '../log';
import Neighbour from '../Neighbour';
import * as Types from '../types'

export default function PageAdv({ device, data, log, config }: { device?: Neighbour, data: Types.DistroData, log: Logger, config?: any | undefined }) {

    return (
        <div className='pageParent pageBasic'>
            <div className='pageCol val'>
                <div className='pageRow l1'>
                    <span className='value'>
                        {(data?.phases[0]!.voltage! > -1 && data?.phases[0]!.voltage)}
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span className='value'>
                        {(data?.phases[1]!.voltage! > -1 && data?.phases[1]!.voltage)}
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span className='value'>
                        {(data?.phases[2]!.voltage! > -1 && data?.phases[2]!.voltage)}
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
                        {(data?.phases[0]!.amperage! > -1 ? data?.phases[0]!.amperage : '-')}
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span className='value'>
                        {(data?.phases[1]!.amperage! > -1 ? data?.phases[1]!.amperage : '-')}
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span className='value'>
                        {(data?.phases[2]!.amperage! > -1 ? data?.phases[2]!.amperage : '-')}
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
                        {data?.pf}
                    </span>
                </div>
                <div className='pageRow kva'>
                    <span className='value'>
                        {data?.kva}
                    </span>
                </div>
                <div className='pageRow hz'>
                    <span className='value'>
                        {data?.hz}
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
