// src/components/ConfigForm.tsx
import { ConfigArray, Neighbour } from '../../../Types';
import '../Styles/PageConfigNetwork.css';
import LanguageIcon from '@mui/icons-material/Language';
import SpokeIcon from '@mui/icons-material/Spoke';
import RouterIcon from '@mui/icons-material/Router';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';

export const NetworkSettings = ({ pluginConfig, handleInputChange, selectedNeighbour }: { pluginConfig: ConfigArray, handleInputChange: (key: string, value: any) => void, selectedNeighbour: Neighbour }) => {
    const isChecked = pluginConfig.dhcp.value as boolean;

    return (
        <div className="gridNetwork">
            <div className={`span-one-network`}>
                ID
            </div>
            <div className={`span-four-network`}>
                <input
                    type='text'
                    value={selectedNeighbour.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                />
            </div>
            <div className={`span-one-network`}>
                <LanguageIcon />
            </div>
            <div className={`span-four-network`}>
                <input
                    type='text'
                    value={pluginConfig.ipaddress.value as string}
                    onChange={(e) => handleInputChange('ipaddress', e.target.value)}
                />
            </div>
            <div className={`span-one-network`}>
                <SpokeIcon />
            </div>
            <div className={`span-four-network`}>
                <input
                    type='text'
                    value={pluginConfig.prefix.value as number}
                    onChange={(e) => handleInputChange('prefix', e.target.value)}
                />
            </div>
            <div className={`span-one-network`}>
                <RouterIcon />
            </div>
            <div className={`span-four-network`}>
                <input
                    type='text'
                    value={pluginConfig.gateway.value as string}
                    onChange={(e) => handleInputChange('gateway', e.target.value)}
                />
            </div>
            <div className={`span-one-network`}>
                DHCP
            </div>
            <div className={`span-two-network`}>
                <div className={`span-four-display displaySwitch`}>
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