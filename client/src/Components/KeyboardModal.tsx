import { useState } from "react"
import RefreshIcon from '@mui/icons-material/Refresh';
import { ConfigVariable } from "../../../Types";

const MAX_INDEX = 16;

export const KeyboardModal = ({ setting, onClose, onSubmit, updated }: { setting: ConfigVariable<string>, onClose: () => void, onSubmit: (setting: ConfigVariable<string>) => void, updated?: boolean }) => {
    const deviceNameAsArray = setting.value?.padEnd(16, String.fromCharCode(160)).split('') || [''.padEnd(16, ' ')]
    const [deviceName, setDeviceName] = useState<string[]>(deviceNameAsArray)
    const [relativeValue, setRelativeValue] = useState<1 | 10 | 50>(1)
    const [index, setIndex] = useState<number>(0);

    const setLetterRelative = (index: number, value: number) => {
        deviceName[index] = String.fromCharCode(deviceName[index].charCodeAt(0) + value);
        if (deviceName[index].charCodeAt(0) > 'z'.charCodeAt(0)) deviceName[index] = 'A';
        if (deviceName[index].charCodeAt(0) < 'A'.charCodeAt(0)) deviceName[index] = 'z';
        setDeviceName([...deviceName])
    }

    const setLetter = (index: number, value: number) => {
        deviceName[index] = String.fromCharCode(value);
        if (deviceName[index].charCodeAt(0) > 'z'.charCodeAt(0)) deviceName[index] = 'A';
        if (deviceName[index].charCodeAt(0) < 'A'.charCodeAt(0)) deviceName[index] = 'z';
        setDeviceName([...deviceName])
    }

    const resetValue = () => setDeviceName(deviceNameAsArray);

    const isDisabled = () => {
        if (updated) {
            return false
        }
        return (JSON.stringify(deviceName) === JSON.stringify(deviceNameAsArray))
    }

    const replaceCharsAndTrim = (str: string): string => {
        const regex = new RegExp(String.fromCharCode(160), 'g');
        return str.replace(regex, ' ').trim();
    };

    return (
        <div className='gridModal'>
            <StringInput str={deviceName} index={index} />
            <ArrowUp onClick={() => setLetterRelative(index, relativeValue)} />
            <ArrowDown onClick={() => setLetterRelative(index, -relativeValue)} />
            <ArrowLeft onClick={() => setIndex(index > 0 ? index - 1 : index)} />
            <ArrowRight onClick={() => setIndex(index < MAX_INDEX - 1 ? index + 1 : index)} />
            <button className='span-one-modal modal-button-method modal-button-x' onClick={() => onClose()}>X</button>
            <button className='span-one-modal modal-button-method input-modified-reset' disabled={isDisabled()} onClick={resetValue}><RefreshIcon /></button>
            <button className='span-one-modal modal-button-method input-modified' disabled={isDisabled()} onClick={() => onSubmit({
                ...setting, ...{
                    value: (() => {
                        return replaceCharsAndTrim(deviceName.join(''))
                    })()
                }
            })}>OK</button>
        </div >
    )
}

const Value = ({ value, onChange }: { value: number | string, onChange?: React.ChangeEventHandler<HTMLInputElement> }) => {
    return (
        <div className='span-one-modal' >
            <input
                className='modal-input'
                value={value}
                onChange={onChange}
                min="0" max="254"
            />
        </div>
    )
}

const ArrowRight = ({ onClick }: { onClick?: React.MouseEventHandler }) => {
    return <Arrow onClick={onClick} text='▶' />
}

const ArrowLeft = ({ onClick }: { onClick?: React.MouseEventHandler }) => {
    return <Arrow onClick={onClick} text='◀' />
}

const ArrowUp = ({ onClick }: { onClick?: React.MouseEventHandler }) => {
    return <Arrow onClick={onClick} text='⬆' />
}

const ArrowDown = ({ onClick }: { onClick?: React.MouseEventHandler }) => {
    return <Arrow onClick={onClick} text='⬇' />
}


const Arrow = ({ onClick, text }: { onClick?: React.MouseEventHandler, text: string }) => {
    return <button className='span-one-modal modal-button-arrow' onClick={onClick}>{text}</button>
}

const StringInput = ({ str, index }: { str: string[], index: number }) => {
    return (
        <div className='span-ten-modal'>
            {str.map((letter, letterIndex) => {
                if (letterIndex == index) {
                    return <span style={{ fontSize: '1.4em' }} className={'modal-selected'}>{letter}</span>
                } else {
                    return <span>{letter}</span>
                }
            })}
        </div>
    )
}