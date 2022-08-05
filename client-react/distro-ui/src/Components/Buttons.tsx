import React from 'react'
import Button from './Button'
import * as Types from '../types'

export default function Buttons({ buttons }: { buttons: Types.ButtonItem[] }) {
    return (
        <div className="menu">
            {buttons.map((b) => <Button key={b.title} button={b} />)}
        </div>
    )
}
