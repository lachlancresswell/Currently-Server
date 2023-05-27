// src/components/ConfigForm.tsx
import { Neighbour, WarningsOptions } from '../../../Types';
import '../Styles/PageConfigWarnings.css';
import { useConfig } from './ConfigForm';

export const WarningSettings = () => {
    const { pluginConfig, selectedNeighbour, handleInputChange } = useConfig<WarningsOptions>('warnings');

    const isChecked = pluginConfig?.enable.value as boolean;

    return (
        <div className="gridWarnings">
            <div className={`span-two-warnings`}>
                <div className='warnings-traffic-lights'>
                    <div className='warnings-traffic-lights-red' />
                    <div className='warnings-traffic-lights-orange' />
                    <div className='warnings-traffic-lights-green' />
                </div>
            </div>
            <div className={`span-four-warnings displaySwitch`}>
                <label className="switch">
                    <input type="checkbox" checked={isChecked} onChange={(e) => handleInputChange('enable', e.target.checked, true)} />
                    <span className="slider round">
                        <span className="switch-on">{isChecked ? 'ON' : ''}</span>
                        <span className="switch-off">{!isChecked ? 'OFF' : ''}</span>
                    </span>
                </label>
            </div>
            <div className={`span-four-warnings`}>
                <div className={`warnings-reset-button`}>
                    RESET
                </div>
            </div>
            <div className={`span-four-warnings warnings-width-100`}>
                <SetMax str1='V' str2='SET' />
            </div>
            <div className={`span-four-warnings warnings-width-100`}>
                <Value value={pluginConfig?.vSet.value} modifierValues={[5, -10]} />
            </div>
            <div className={`span-four-warnings warnings-width-100`}>
                <SetMax str1='A' str2='MAX' />
            </div>
            <div className={`span-four-warnings warnings-width-100`}>
                <Value value={pluginConfig?.amax.value} />
            </div>
            <div className={`span-four-warnings warnings-width-100`}>
                <SetMax str1='HZ' str2='SET' />
            </div>
            <div className={`span-four-warnings warnings-width-100`}>
                <Value value={pluginConfig?.HZset.value} modifierValues={[1, -1]} />
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

const SetMax = ({ str1, str2 }: { str1: string, str2: string }) => {
    return (
        <div className={`warnings-settings-name`}>
            <span className='warnings-v-a-hz'>{str1}</span>
            <span className='warnings-set-max'>{str2}</span>
        </div>);
}

const Value = ({ value, modifierValues }: { value?: number | string, modifierValues?: number[] }) => {
    return (
        <>
            <div className='warnings-value'>
                {value}
            </div>
            {modifierValues?.map((mod) => {
                return (<div className='warnings-modifier'>
                    {mod >= 0 ? '+' + mod : mod}
                </div>)
            })}
        </>
    )
}