import { useState } from "react"
import RefreshIcon from '@mui/icons-material/Refresh';
import { ConfigVariable, ipaddress } from "../../../Types";

export const IPv4Modal = ({ setting, onClose, onSubmit, updated }: { setting: ConfigVariable<ipaddress>, onClose: () => void, onSubmit: (setting: ConfigVariable<ipaddress>) => void, updated?: boolean }) => {

    const ipAddressAsArray = setting.value?.split('.').map((i) => parseInt(i)) || []
    const [address, setAddress] = useState<number[]>(ipAddressAsArray)
    const [relativeValue, setRelativeValue] = useState<1 | 10 | 50>(1)

    const setAddressOctetRelative = (octet: number, value: number) => {
        address[octet] += value;
        if (address[octet] > 254) address[octet] = 254;
        if (address[octet] < 0) address[octet] = 0;
        setAddress([...address])
    }

    const setAddressOctetAbsolute = (octet: number, value: number) => {
        address[octet] = value;
        if (address[octet] > 254) address[octet] = 254;
        if (address[octet] < 0) address[octet] = 0;
        setAddress([...address])
    }

    const cycleRelativeValue = () => {
        if (relativeValue === 1) {
            setRelativeValue(10)
        } else if (relativeValue === 10) {
            setRelativeValue(1)
        }
    }

    const resetValue = () => setAddress(ipAddressAsArray);

    const isDisabled = () => {
        if (updated) {
            return false
        }
        return (JSON.stringify(address) === JSON.stringify(ipAddressAsArray))
    }

    return (
        <div className='gridModal'>
            <Value onChange={(e) => setAddressOctetAbsolute(0, parseInt(e.target.value))} value={address[0]} />
            <Value onChange={(e) => setAddressOctetAbsolute(1, parseInt(e.target.value))} value={address[1]} />
            <Value onChange={(e) => setAddressOctetAbsolute(2, parseInt(e.target.value))} value={address[2]} />
            <Value onChange={(e) => setAddressOctetAbsolute(3, parseInt(e.target.value))} value={address[3]} />
            <ArrowUp onClick={() => setAddressOctetRelative(0, relativeValue)} />
            <ArrowUp onClick={() => setAddressOctetRelative(1, relativeValue)} />
            <ArrowUp onClick={() => setAddressOctetRelative(2, relativeValue)} />
            <ArrowUp onClick={() => setAddressOctetRelative(3, relativeValue)} />
            <ArrowDown onClick={() => setAddressOctetRelative(0, -relativeValue)} />
            <ArrowDown onClick={() => setAddressOctetRelative(1, -relativeValue)} />
            <ArrowDown onClick={() => setAddressOctetRelative(2, -relativeValue)} />
            <ArrowDown onClick={() => setAddressOctetRelative(3, -relativeValue)} />
            <button className='span-one-modal modal-button-method modal-button-x' onClick={() => onClose()}>X</button>
            <button className='span-one-modal modal-button-method input-modified-reset' disabled={isDisabled()} onClick={resetValue}><RefreshIcon /></button>
            <button className='span-one-modal modal-button-method input-modified' disabled={isDisabled()} onClick={() => onSubmit({ ...setting, ...{ value: address.join('.') } })}>OK</button>
            <button className='span-one-modal modal-button-method' onClick={cycleRelativeValue}>{relativeValue}</button>
        </div >
    )
}

const Value = ({ value, onChange }: { value: number | string, onChange?: React.ChangeEventHandler<HTMLInputElement> }) => {
    return (
        <div className='span-one-modal' >
            <input
                className='modal-input'
                type='number'
                value={value}
                onChange={onChange}
                min="0" max="254"
            />
        </div>
    )
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