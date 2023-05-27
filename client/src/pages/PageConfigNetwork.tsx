// src/components/ConfigForm.tsx
import { IPOptions } from '../../../Types';
import '../Styles/PageConfigNetwork.css';
import LanguageIcon from '@mui/icons-material/Language';
import SpokeIcon from '@mui/icons-material/Spoke';
import RouterIcon from '@mui/icons-material/Router';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import { useConfig } from './ConfigForm';

export const NetworkSettings = () => {
    const { pluginConfig, selectedNeighbour, handleInputChange, handleConfirm, isModified } = useConfig<IPOptions>('IPPlugin');

    const isChecked = pluginConfig?.dhcp.value;

    return (
        <div className="gridNetwork">
            <div className={`span-one-network`}>
                ID
            </div>
            <div className={`span-four-network`}>
                <input
                    type='text'
                    value={selectedNeighbour?.name}
                    onChange={(e) => handleInputChange('name', e.target.value, false, true)}
                />
            </div>
            <div className={`span-one-network`}>
                <LanguageIcon />
            </div>
            <div className={`span-four-network`}>
                <input
                    type='text'
                    value={pluginConfig?.ipaddress.value}
                    disabled={isChecked}
                    onChange={(e) => handleInputChange('ipaddress', e.target.value)}
                />
            </div>
            <div className={`span-one-network`}>
                <SpokeIcon />
            </div>
            <div className={`span-four-network`}>
                <input
                    type='text'
                    value={pluginConfig?.prefix.value}
                    disabled={isChecked}
                    onChange={(e) => handleInputChange('prefix', e.target.value)}
                />
            </div>
            <div className={`span-one-network`}>
                <RouterIcon />
            </div>
            <div className={`span-four-network`}>
                <input
                    type='text'
                    value={pluginConfig?.gateway.value}
                    disabled={isChecked}
                    onChange={(e) => handleInputChange('gateway', e.target.value)}
                />
            </div>
            <div className={`span-one-network`}>
                DHCP
            </div>
            <div className={`span-one-network`}>
                <div className={`displaySwitch`}>
                    <label className="switch">
                        <input type="checkbox" checked={isChecked} onChange={(e) => handleInputChange('dhcp', e.target.checked)} />
                        <span className="slider round">
                            <span className="switch-on">{isChecked ? 'ON' : ''}</span>
                            <span className="switch-off">{!isChecked ? 'OFF' : ''}</span>
                        </span>
                    </label>
                </div>
            </div>
            <div className={`span-two-network network-status`}>
                <SettingsEthernetIcon />
                <ValueStatusSymbol status={pluginConfig?.ipaddress.value} />
            </div>
            <div className={`span-one-network`}>
                <div className='network-accept' onClick={handleConfirm}>
                    {isModified ? 'ACCEPT' : ''}
                </div>
            </div>
        </div>
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