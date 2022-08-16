import React from 'react'
import * as Types from '../types'
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import RefreshIcon from '@mui/icons-material/Refresh';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PublicIcon from '@mui/icons-material/Public';
import '../Styles/Page.css';

export default function PageHome({ data }: { data?: Types.DistroData }) {
    return (
        <div className='pageParent pageHome'>
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
                <div className='pageRow hz'>
                    <span className='value'>
                        {50 || '-'}
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
                <div className='pageRow hz'>
                    <span>
                        hz
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
                <div className='pageRow l3'>
                    <span style={{ visibility: 'hidden' }} className='value'>
                        b
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
                <div className='pageRow l3'>
                    <span style={{ visibility: 'hidden' }}>
                        b
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
                <div className='pageRow'>
                    <span className='circle red'>
                    </span>
                </div>
                <div className='pageRow'>
                    <span className='circle green'>
                    </span>
                </div>
            </div>
            <div className='pageCol'>
                <div className='pageRow'>
                    <SettingsEthernetIcon />
                </div>
                <div className='pageRow'>
                    <RefreshIcon />
                </div>
                <div className='pageRow'>
                    <RemoveCircleOutlineIcon />
                </div>
                <div className='pageRow'>
                    <PublicIcon />
                </div>
            </div>
            <div className='pageCol'>
                <div className='pageRow'>
                    <span className=''>
                        ❌
                    </span>
                </div>
                <div className='pageRow'>
                    <span className='' style={{ color: 'green' }}>
                        ✔
                    </span>
                </div>
                <div className='pageRow'>
                    <span className='' style={{ color: 'green' }}>
                        ✔
                    </span>
                </div>
                <div className='pageRow'>
                    <span className='' style={{ color: 'green' }}>
                        ✔
                    </span>
                </div>
            </div>
        </div>
    );
}
