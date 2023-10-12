import React, { useState } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import '../Styles/ConfigModal.css'
import { ConfigVariable } from '../../../Types';
import { ArrowUp, ArrowDown } from "./CommonUI";

export const NumberModal = ({ setting, onClose, onSubmit, updated }: { setting: ConfigVariable, onClose: () => void, onSubmit: (setting: ConfigVariable) => void, updated?: boolean }) => {
    const [value, setValue] = useState<number>(parseInt(setting.value || '0'));
    const [startValue, _setStartValue] = useState<number>(value);

    const resetValue = () => {
        setValue(startValue);
    }

    const isDisabled = () => {
        return updated || (value === startValue)
    }

    const validateAndUpdateValue = (newValue: number) => {
        if (setting.min !== undefined && newValue < setting.min) {
            return setValue(setting.min);
        }

        if (setting.max !== undefined && newValue > setting.max) {
            return setValue(setting.max);
        }

        return setValue(newValue);
    }

    return (
        <div className='gridModal-flex'>
            <Value onChange={(e) => setValue(parseInt(e.target.value))} value={value} max={setting.max} />
            <div className='modal-flex-1'>
                <ArrowUp onClick={() => validateAndUpdateValue(value + 1)} />
                <ArrowDown onClick={() => validateAndUpdateValue(value - 1)} />
            </div>
            <div className='modal-flex-1'>
                <button className='modal-button-method-flex modal-button-x' onClick={() => onClose()}>X</button>
                <button className='modal-button-method-flex input-modified-reset' disabled={isDisabled()} onClick={resetValue}><RefreshIcon /></button>
                <button className="modal-button-method-flex input-modified" disabled={isDisabled()} onClick={() => onSubmit({ ...setting, ...{ value: value.toString() } })}>OK</button>
            </div>
        </div >
    )
};

const Value = ({ value, max, onChange }: { value: number | string, max?: number, onChange?: React.ChangeEventHandler<HTMLInputElement> }) => {
    if (!max) max = 254;
    return (
        <div className='modal-flex-1'>
            <input
                className='modal-input'
                type='number'
                value={value}
                onChange={onChange}
                min="0" max={max.toString()}
            />
        </div>
    )
}