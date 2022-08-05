import React from 'react'
import * as Types from '../types'
import '../Styles/PhaseDetails.css';

export default function PhaseDetails({ data }: { data: Types.PhaseData }) {
    return (
        <div className={`phase-details l${data.phase}`}>
            <div className='voltage'>
                <span className='value'>
                    {data.voltage || '-'}
                </span>
                <span className='denominator'>
                    V
                </span>
            </div>
            <div className='amperage'>
                <span className='value'>
                    {data.amperage || '-'}
                </span>
                <span className='denominator'>
                    A
                </span>
            </div>
        </div>
    )
}
