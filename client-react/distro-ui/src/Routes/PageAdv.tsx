import React from 'react'
import * as Types from '../types'

const DEFAULT_VALUE = '-';

export default function PageAdv({ data }: { data: Types.DistroData }): any {
    return (
        <div className='pageParent pageBasic'>
            <div className='pageCol val'>
                <div className='pageRow l1'>
                    <span className='value'>
                        {231 || '-'}
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span className='value'>
                        {232 || '-'}
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span className='value'>
                        {233 || '-'}
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
                        {8 || '-'}
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span className='value'>
                        {9 || '-'}
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span className='value'>
                        {10 || '-'}
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
                        {8 || '-'}
                    </span>
                </div>
                <div className='pageRow kva'>
                    <span className='value'>
                        {9 || '-'}
                    </span>
                </div>
                <div className='pageRow hz'>
                    <span className='value'>
                        {data.hz || '-'}
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
