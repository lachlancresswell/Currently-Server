import { useNeighbourContext } from './neighbourContext';
import { useNeighbourDataContext } from './neighbourDataContext';
import { useEffect, useState } from 'react';
import { PhaseData, Phase } from '../../Types';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import RefreshIcon from '@mui/icons-material/Refresh';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PublicIcon from '@mui/icons-material/Public';
import { Warning } from './Warnings';
import { useConfigDataContext } from './configContext';

interface PageAdvProps {
}

export const PageHome = ({ }: PageAdvProps) => {
    const { selectedNeighbour } = useNeighbourContext();
    const { neighbourData } = useNeighbourDataContext();
    const { configData } = useConfigDataContext();

    if (!selectedNeighbour) {
        return null;
    }

    return (
        <div className='pageParent pageHome'>
            <div className='pageCol val-voltage'>
                <div className='pageRow l1'>
                    <span className='value'>
                        {neighbourData?.phases[0].voltage}
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span className='value'>
                        {neighbourData?.phases[1].voltage}
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span className='value'>
                        {neighbourData?.phases[2].voltage}
                    </span>
                </div>
                <div className='pageRow hz'>
                    <span className='value'>
                        {neighbourData?.hz}
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
            <div className='pageCol val-amperage'>
                <div className='pageRow l1'>
                    <span className='value'>
                        {neighbourData?.phases[0].amperage}
                    </span>
                </div>
                <div className='pageRow l2'>
                    <span className='value'>
                        {neighbourData?.phases[1].amperage}
                    </span>
                </div>
                <div className='pageRow l3'>
                    <span className='value'>
                        {neighbourData?.phases[2].amperage}
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
                    <Warning data={neighbourData!} type={'va'} phaseIndex={1} />
                </div>
                <div className='pageRow'>
                    {neighbourData && <Warning data={neighbourData} type={'va'} phaseIndex={1} />}
                </div>
                <div className='pageRow'>
                    {neighbourData && <Warning data={neighbourData} type={'va'} phaseIndex={2} />}
                </div>
                <div className='pageRow'>
                    {neighbourData && <Warning data={neighbourData} type={'hz'} />}
                </div>
            </div>
            <div className='pageCol'>
                <div className={`pageRow`}>
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
                        <ValueStatusSymbol status={configData?.IPPlugin?.config?.ipaddress.value} />
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
                    <ValueStatusSymbol status={configData?.IPPlugin?.config?.internetStatus.value} />
                </div>
            </div>
        </div>
    );
}

const ValueStatusSymbol = ({ status }: { status: any }) => {
    return <>{
        status ? (
            <span style={{ color: 'green' }}>✔</span>
        ) : (
            <span style={{ color: 'red' }}>❌</span>
        )
    }</>
}