import { useState } from "react"
import RefreshIcon from '@mui/icons-material/Refresh';
import { ConfigVariable } from "../../../Types";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "./CommonUI";

const MAX_INDEX = 16;

/**
 * A modal component for editing a string using a virtual keyboard.
 * @param setting - The configuration variable for the string.
 * @param onClose - A function to close the modal.
 * @param onSubmit - A function to submit the updated string.
 * @param updated - A boolean indicating whether the string has been updated.
 * @returns A React component.
 * @todo Add keyboard support.
 */
export const KeyboardModal = ({
    setting,
    onClose,
    onSubmit,
    updated
}: {
    setting: ConfigVariable<string>,
    onClose: () => void,
    onSubmit: (setting: ConfigVariable<string>) => void,
    updated?: boolean
}) => {
    const deviceNameAsArray = setting.value?.replaceAll(' ', String.fromCharCode(160)).padEnd(16, String.fromCharCode(160)).split('') || [''.padEnd(16, ' ')]
    const [deviceName, setDeviceName] = useState<string[]>(deviceNameAsArray)
    const [relativeValue, setRelativeValue] = useState<1 | 10 | 50>(1)
    const [index, setIndex] = useState<number>(0);

    const setLetterRelative = (index: number, value: number) => {
        deviceName[index] = String.fromCharCode(deviceName[index].charCodeAt(0) + value);
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

const StringInput = ({ str, index }: { str: string[], index: number }) => {
    return (
        <div className='span-ten-modal'>
            {str.map((letter, letterIndex) => {
                if (letterIndex == index) {
                    return <span className={'modal-selected'}>{letter}</span>
                } else {
                    return <span>{letter}</span>
                }
            })}
        </div>
    )
}