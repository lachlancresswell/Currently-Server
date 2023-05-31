// src/components/ConfigForm.tsx
import { IPOptions } from '../../../Types';
import '../Styles/PageConfigNetwork.css';
import LanguageIcon from '@mui/icons-material/Language';
import SpokeIcon from '@mui/icons-material/Spoke';
import RouterIcon from '@mui/icons-material/Router';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import { useConfig } from './ConfigForm';
import React from 'react';

export const NetworkSettings = () => {
    const { pluginConfig, selectedNeighbour, handleInputChange, handleConfirm, isModified } = useConfig<IPOptions>('IPPlugin');

    const isChecked = pluginConfig?.dhcp.value;

    return (
        <div className="gridNetwork">
            <NetworkInput type={'text'} title={'ID'} value={selectedNeighbour?.name} onChange={(e) => handleInputChange('name', e.target.value, false, true)} />
            <NetworkInput type={'text'} title={<LanguageIcon />} disabled={isChecked} value={pluginConfig?.ipaddress.value} onChange={(e) => handleInputChange('ipaddress', e.target.value)} />
            <NetworkInput type={'text'} title={<SpokeIcon />} disabled={isChecked} value={pluginConfig?.prefix.value?.toString()} onChange={(e) => handleInputChange('prefix', e.target.value)} />
            <NetworkInput type={'text'} title={<RouterIcon />} disabled={isChecked} value={pluginConfig?.gateway.value} onChange={(e) => handleInputChange('gateway', e.target.value)} />
            <CheckBoxInput title={'DHCP'} checked={isChecked} onChange={(e) => handleInputChange('dhcp', e.target.checked)} />
            <div className={`span-two-network network-status`}>
                <SettingsEthernetIcon />
                <ValueStatusSymbol status={pluginConfig?.ipaddress.value} />
            </div>
            <ConfirmButton isModified={isModified()} onClick={handleConfirm} />
        </div >
    )
}

const ValueStatusSymbol = ({ status }: { status: any }) => {
    return <>{
        status ? (
            <span className='statusIcon' style={{ color: 'green' }}>✓</span>
        ) : (
            <span className='statusIcon' style={{ color: 'red' }}>X</span>
        )
    }</>
}

const CheckBoxInput = ({ title, disabled, checked, onChange }: {
    title?: string | JSX.Element, type?: string, disabled?: boolean, checked?: boolean, onChange?: React.ChangeEventHandler<HTMLInputElement>
}) => {
    return (
        <>
            <div className={`span-one-network`} >
                {title}
            </div >
            <div className={`span-one-network`}>
                <div className={`displaySwitch`}>
                    <label className="switch">
                        <input type="checkbox" checked={checked} onChange={onChange} />
                        <span className="slider round">
                            <span className="switch-on">{checked ? 'ON' : ''}</span>
                            <span className="switch-off">{!checked ? 'OFF' : ''}</span>
                        </span>
                    </label>
                </div>
            </div>
        </>
    )
}

const NetworkInput = ({ title, type, disabled, value, onChange }: {
    title?: string | JSX.Element, type?: string, disabled?: boolean, value?: string, onChange?: React.ChangeEventHandler<HTMLInputElement>
}) => {
    return (
        <>
            <div className={`span-one-network`}>
                {title}
            </div>
            <div className={`span-four-network`}>
                <input
                    type={type}
                    value={value}
                    disabled={disabled}
                    onChange={onChange}
                />
            </div>
        </>
    )
}

const ConfirmButton = ({ isModified, onClick }: { isModified?: boolean, onClick?: React.MouseEventHandler<HTMLInputElement> }) => {
    return (
        <div className={`span-one-network`}>
            <div className='network-accept' onClick={onClick}>
                {isModified ? 'ACCEPT' : ''}
            </div>
        </div>
    )
}