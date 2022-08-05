import React from 'react'
import '../Styles/Button.css';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import * as Types from '../types'

export default function Button({ button }: { button: Types.ButtonItem }) {
    let history = useHistory();
    const location = useLocation();
    let className = '';
    if (button.paths) className += (button.paths.includes(location.pathname)) ? 'selected' : ''
    className += button.icon ? ' icon' : '';

    const fn = button.fn || (button.paths && button.paths[0] === '/rtn' && history.goBack) || undefined;
    const path = button.fn ? '' : button.paths && button.paths[0] === '/rtn' ? '' : `/${button.title}`

    let element = <NavLink to={path} activeClassName={className}>{button.icon || button.title}</NavLink>
    if (fn) {
        element = <button onClick={fn} className={className}>{button.icon || button.title}</button>
    }

    return element;
}
