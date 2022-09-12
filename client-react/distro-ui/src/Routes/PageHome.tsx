import React, { useState } from 'react'
import * as Types from '../types'
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import RefreshIcon from '@mui/icons-material/Refresh';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PublicIcon from '@mui/icons-material/Public';
import Neighbour from '../Neighbour';
import '../Styles/Page.css';
import * as Influx from '../Plugins/influx';
import { Logger } from '../log';
import * as Warnings from '../warnings'

let fetching = false;


export default function PageHome({ device, data, log, config }: { device?: Neighbour, data: Types.DistroData, log: Logger, config: any | undefined }) {

    log.debug("RENDER - PageHome");

    return (
        <div className='pageParent pageHome'>
            <div className='pageCol val'>
                <div className='pageRow l1'>
                    <span className='value'>
                        {data?.phases[0].voltage || '-'}
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span className='value'>
                        {data?.phases[1].voltage || '-'}
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span className='value'>
                        {data?.phases[2].voltage || '-'}
                    </span>
                </div>
                <div className='pageRow hz'>
                    <span className='value'>
                        {data?.hz || '-'}
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
                        {data?.phases[0].amperage || '-'}
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span className='value'>
                        {data?.phases[1].amperage || '-'}
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span className='value'>
                        {data?.phases[2].amperage || '-'}
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
                    <span className={`circle ${data && Warnings.toleranceToColourVA(config, data, 0)}`}>
                    </span>
                </div>
                <div className='pageRow'>
                    <span className={`circle ${data && Warnings.toleranceToColourVA(config, data, 1)}`}>
                    </span>
                </div>
                <div className='pageRow'>
                    <span className={`circle ${data && Warnings.toleranceToColourVA(config, data, 2)}`}>
                    </span>
                </div>
                <div className='pageRow'>
                    <span className={`circle ${data && Warnings.toleranceToColour(config, data, 'hz')}`}>
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
