import React from 'react'
import * as Types from '../types'
import '../Styles/PageAdv.css';

const DEFAULT_VALUE = '-';

export default function PageAdv({ data }: { data: Types.DistroData }): any {
    return (
        <div className="adv">
            <div className='column'>
                <div className="column1 value">
                    {data.phases.map((p) => <div key={'v-v-' + p.phase} className={`l${p.phase}`}>{p.voltage || DEFAULT_VALUE}</div>)}
                    <div className='pf'>{data.pf || DEFAULT_VALUE}</div>
                    <div className='kva'>{data.kva || DEFAULT_VALUE}</div>
                </div>

                <div className="column2 denominator">
                    {data.phases.map((p) => <div key={'v-d-' + p.phase} className={`l${p.phase || DEFAULT_VALUE}`}>V</div>)}
                    <div className='pf'>pf</div>
                    <div className='kva'>kVA</div>
                </div>
            </div>
            <div className='column'>
                <div className="column3 value">
                    {data.phases.map((p) => <div key={'a-v-' + p.phase} className={`l${p.phase}`}>{p.amperage || DEFAULT_VALUE}</div>)}
                    <div className='hz' style={{ visibility: 'hidden' }}>{data.hz || DEFAULT_VALUE}</div>
                    <div className='hz'>{data.hz || DEFAULT_VALUE}</div>
                </div>

                <div className="column4 denominator">
                    {data.phases.map((p) => <div key={'a-d-' + p.phase} className={`l${p.phase || DEFAULT_VALUE}`}>A</div>)}
                    <div>  </div>
                    <div className='hz'>Hz</div>
                </div>
            </div>
        </div >
    );
}
