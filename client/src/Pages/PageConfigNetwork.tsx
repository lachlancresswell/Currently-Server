// src/components/ConfigForm.tsx
import '../Styles/PageConfigNetwork.css';
import LanguageIcon from '@mui/icons-material/Language';
import SpokeIcon from '@mui/icons-material/Spoke';
import RouterIcon from '@mui/icons-material/Router';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import React from 'react';
import { ConfigVariableMetadata, EphemeralVariableMetaData, IPOptions, ipaddress, prefix } from '../../../Types';

export const PageConfigNetwork = ({ onSettingClick, configObj }: { onSettingClick: <T>(setting: ConfigVariableMetadata<T> | EphemeralVariableMetaData<T>, updated?: boolean) => void, configObj: { pluginConfig?: IPOptions, selectedNeighbour: any, handleInputChange: any, handleConfirm: any, isModified: any } }) => {

    const { pluginConfig, selectedNeighbour, handleInputChange, handleConfirm, isModified } = configObj;

    const isChecked = pluginConfig?.dhcp.value;

    return (
        <div className="gridNetwork">
            <NetworkInput type={'text'} title={'ID'} value={selectedNeighbour?.name} onChange={(e: { target: { value: string | number | boolean | string[] | Date | undefined; }; }) => handleInputChange('name', e.target.value, false, true)} />
            <NetworkInput type={'text'} title={<LanguageIcon />} disabled={isChecked} value={pluginConfig?.ipaddress.value} onChange={() => {
                onSettingClick<ipaddress>(pluginConfig?.ipaddress!)
            }} />
            <NetworkInput type={'text'} title={<SpokeIcon />} disabled={isChecked} value={pluginConfig?.prefix.value?.toString()} onChange={() => {
                onSettingClick<prefix>(pluginConfig?.prefix!)
            }} />
            <NetworkInput type={'text'} title={<RouterIcon />} disabled={isChecked} value={pluginConfig?.gateway.value} onChange={() => {
                let gatewayValue = pluginConfig?.gateway.value;
                let hasBeenUpdated = false;
                if (!gatewayValue) {
                    gatewayValue = guessGatewayFromIpAndPrefix(pluginConfig?.ipaddress.value, pluginConfig?.prefix.value);
                    hasBeenUpdated = true;
                }
                onSettingClick<ipaddress>({ ...pluginConfig!.gateway, ...{ value: gatewayValue } }, hasBeenUpdated)
            }} />
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
    title?: string | JSX.Element, type?: string, disabled?: boolean, value?: string, onChange?: any
}) => {
    return (
        <>
            <div className={`span-one-network`}>
                {title}
            </div>
            <div className={`span-four-network network-center`}>
                <div
                    className={`network-center ${disabled ? 'network-disabled' : ''}`}
                    onClick={(e) => {
                        if (!disabled) onChange(e)
                    }}
                >{value}</div>
            </div >
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

const guessGatewayFromIpAndPrefix = (ip: string | undefined, prefix: prefix | undefined) => {
    if (!ip) return '0.0.0.0';
    // Convert IP address to binary format
    const ipBinary = ip.split('.').map((octet) => parseInt(octet).toString(2).padStart(8, '0')).join('');

    // Calculate network address by setting all host bits to 0
    const networkBinary = ipBinary.substr(0, prefix).padEnd(32, '0');

    // Calculate broadcast address by setting all host bits to 1
    const _broadcastBinary = ipBinary.substr(0, prefix).padEnd(32, '1');

    // Calculate default gateway address by incrementing network address by 1
    const gatewayBinary = networkBinary.substr(0, networkBinary.length - 1) + '1';

    // Convert binary format back to IP address
    const gateway = gatewayBinary.match(/.{8}/g)?.map((byte) => parseInt(byte, 2)).join('.');

    return gateway;
}