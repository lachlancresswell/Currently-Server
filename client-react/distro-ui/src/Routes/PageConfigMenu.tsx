
import React, { useState } from 'react';
import * as Types from '../types'
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import HelpIcon from '@mui/icons-material/Help';
import '../Styles/Button.css';
import {
    Route,
    NavLink,
} from "react-router-dom";
import Neighbour from '../Neighbour';
import * as Config from '../Config';

/**
 * Distro configuration menu
 * @param param0 props containing the device to configure and Date objects
 * @returns React Componenet
 */
export default function PageConfigMenu({ device, times, updateConf }: { device: Neighbour, times: { dbTime?: Date, server?: Date }, updateConf: () => void }) {

    const [conf, setConf] = useState<{ [key: string]: { [key: string]: Types.OneStageValue | Types.OneStageMinMax | Types.OneStageOptions } } | undefined>(undefined);

    if (!conf && device) {
        const ip = device.urlFromIp();
        Config.getConfig(device.urlFromIp()).then((conf) => {
            if (conf) setConf(conf);
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, key: string) => {
        setConf((curConf) => {
            if (curConf) {

                const id = e.target.id;
                const conf = curConf[key][id];

                if (conf) {
                    if (e.target.type === 'checkbox') {
                        const val = (e.target as HTMLInputElement).checked === true ? 'true' : 'false';
                        let index = 0;
                        (conf as Types.OneStageOptions).options.find((opt, i) => {
                            if (opt === val) index = i;
                        })
                        conf.value = index;
                    } else if (e.target.type === 'text') {
                        conf.value = e.target.value;
                    } else if (e.target.type === 'number') {
                        if (e.target.value) conf.value = parseInt(e.target.value)
                        if ((conf as Types.OneStageMinMax).max && conf.value > (conf as Types.OneStageMinMax).max) conf.value = (conf as Types.OneStageMinMax).max;
                        else if ((conf as Types.OneStageMinMax).min && conf.value < (conf as Types.OneStageMinMax).min) conf.value = (conf as Types.OneStageMinMax).min;
                    } else if (e.target.type === 'select-one') {
                        conf.value = (e.target as HTMLSelectElement).selectedIndex;
                    }
                    curConf[key][id] = conf;
                }

            }
            return { ...curConf }
        });
    }

    return (
        <>
            <Route exact path={`/cfg`} >
                <div className='pageParent pageConfig'>
                    <div className='pageCol'>
                        <div className={`pageRow}`}>
                            <NavLink style={{ color: 'white' }} to={`/cfg/warnings`}><ReportProblemIcon /></NavLink>
                        </div>
                        <div className={`pageRow}`}>
                            <NavLink style={{ color: 'white' }} to={`/cfg/network`}><SettingsEthernetIcon /></NavLink>
                        </div>
                    </div>
                    <div className='pageCol'>
                        <div className={`pageRow}`}>
                            <NavLink style={{ color: 'white' }} to={`/cfg/time`}><AccessTimeIcon /></NavLink>
                        </div>
                        <div className={`pageRow}`}>
                            <NavLink style={{ color: 'white' }} to={`/cfg/locale`}><LocationOnIcon /></NavLink>
                        </div>
                    </div>
                    <div className='pageCol'>
                        <div className={`pageRow}`}>
                            <NavLink style={{ color: 'white' }} to={`/cfg/power`}><PowerSettingsNewIcon /></NavLink>
                        </div>
                        <div className={`pageRow}`}>
                            <NavLink style={{ color: 'white' }} to={`/cfg/system`}><HelpIcon /></NavLink>
                        </div>
                    </div>
                </div>
            </Route>
            <Route path={`/cfg/network`}>
                {conf && <PageNetwork device={device} conf={conf['ip-settings']} handleChange={(e) => handleChange(e, 'ip-settings')} submit={() => {
                    const { dhcp, ip, gateway } = {
                        dhcp: (conf['ip-settings'].dhcp as Types.OneStageOptions).options[conf['ip-settings'].dhcp.value],
                        ip: conf['ip-settings'].ip.value,
                        gateway: conf['ip-settings'].gateway.value
                    }
                    let prefix = '24'
                    switch (conf['ip-settings'].mask.value) {
                        case '255.255.255.0':
                            prefix = '24';
                            break;
                        case '255.255.0.0':
                            prefix = '16';
                            break;
                        case '255.0.0.0':
                            prefix = '8';
                            break;
                    }

                    return Config.submitIP(device.urlFromIp(), dhcp, ip, prefix, gateway).then(updateConf)
                }} />}
            </Route>
            <Route path={`/cfg/time`}>
                {conf && <PageTime device={device} conf={conf['time']} handleChange={(e) => handleChange(e, 'time')} submit={() => Config.submitConfig(device.urlFromIp(), { 'time': conf['time'] }).then(updateConf)} />}
            </Route>
            <Route path={`/cfg/warnings`}>
                {conf && <PageWarnings device={device} conf={conf['warnings']} handleChange={(e) => handleChange(e, 'warnings')} submit={() => Config.submitConfig(device.urlFromIp(), { 'warnings': conf['warnings'] }).then(updateConf)} />}
            </Route>
        </>
    )
}

function PageNetwork({ device, conf, handleChange, submit }: { device: Neighbour, conf: { [key: string]: Types.OneStageValue | Types.OneStageMinMax | Types.OneStageOptions }, handleChange: (e: any) => void, submit: (e: any) => void }) {
    const type = 'ip-settings';

    const dhcp = (conf.dhcp as Types.OneStageOptions).options[conf.dhcp.value] === 'true' ? true : false;

    return <>
        <TextInput setting={conf.ip as Types.OneStageValue} id={'ip'} handleChange={handleChange} disabled={dhcp} />
        <TextInput setting={conf.mask as Types.OneStageValue} id={'mask'} handleChange={handleChange} disabled={dhcp} />
        <TextInput setting={conf.gateway as Types.OneStageValue} id={'gateway'} handleChange={handleChange} disabled={dhcp} />
        <CheckboxInput setting={conf.dhcp as Types.OneStageOptions} id={'dhcp'} handleChange={handleChange} />
        <button onClick={submit}>Submit</button>
    </>
}

function PageTime({ device, conf, handleChange, submit }: { device: Neighbour, conf: { [key: string]: Types.OneStageValue | Types.OneStageMinMax | Types.OneStageOptions }, handleChange: (e: any) => void, submit: (e: any) => void }) {
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const date = now.toISOString().slice(0, -1);

    return <>
        <label>Time:</label>
        <input type="datetime-local" id="time" name="time" value={date} disabled={(conf.automatic as Types.OneStageOptions).options[conf.automatic.value]} />
        <DropdownInput setting={conf.timezone as Types.OneStageOptions} id={'timezone'} handleChange={handleChange} disabled={(conf.automatic as Types.OneStageOptions).options[conf.automatic.value]} />
        <DropdownInput setting={conf.dateformat as Types.OneStageOptions} id={'dateformat'} handleChange={handleChange} />
        <DropdownInput setting={conf.timeformat as Types.OneStageOptions} id={'timeformat'} handleChange={handleChange} />
        <CheckboxInput setting={conf.automatic as Types.OneStageOptions} id={'automatic'} handleChange={handleChange} />
        <button onClick={submit}>Submit</button>
    </>
}

function PageWarnings({ device, conf, handleChange, submit }: { device: Neighbour, conf: { [key: string]: Types.OneStageValue | Types.OneStageMinMax | Types.OneStageOptions }, handleChange: (e: any) => void, submit: (e: any) => void }) {

    const type = 'warnings';
    const enabled = (conf.enable as Types.OneStageOptions).options[conf.enable.value] === 'true' ? true : false;

    return <>
        <NumberInput setting={conf.vSet as Types.OneStageValue} id={'vSet'} handleChange={handleChange} disabled={!enabled} />
        <NumberInput setting={conf.amax as Types.OneStageValue} id={'amax'} handleChange={handleChange} disabled={!enabled} />
        <NumberInput setting={conf.HZset as Types.OneStageValue} id={'HZset'} handleChange={handleChange} disabled={!enabled} />
        <CheckboxInput setting={conf.enable as Types.OneStageOptions} id={'enable'} handleChange={handleChange} />

        <button onClick={submit}>Submit</button>
    </>
}

function TextInput({ setting, disabled = false, handleChange, id }: { setting: Types.OneStageValue, disabled?: boolean, handleChange: (e: any) => void, id: string }) {
    return <div className='configRow'>
        <span className="configItem">
            {setting.readableName}
        </span>
        <span className="configItem">
            <input id={id} disabled={disabled} type="text" value={setting.value} onChange={handleChange} />
        </span>
    </div>
}

function NumberInput({ setting, disabled = false, handleChange, id }: { setting: Types.OneStageValue, disabled?: boolean, handleChange: (e: any) => void, id: string }) {
    return <div className='configRow'>
        <span className="configItem">
            {setting.readableName}
        </span>
        <span className="configItem">
            <input id={id} disabled={disabled} type="number" value={setting.value} onChange={handleChange} />
        </span>
    </div>
}

function CheckboxInput({ setting, disabled = false, handleChange, id }: { setting: Types.OneStageOptions, disabled?: boolean, handleChange: (e: any) => void, id: string }) {

    const checked = setting.options[setting.value] === 'true' ? true : false;

    return <div className='configRow'>
        <span className="configItem">
            {setting.readableName}
        </span>
        <span className="configItem">
            <label className="switch">
                <input id={id} type="checkbox" checked={checked} onChange={handleChange} />
                <span className="slider round"></span>
            </label>
        </span>
    </div>
}

function DropdownInput({ setting, disabled = false, handleChange, id }: { setting: Types.OneStageOptions, disabled?: boolean, handleChange: (e: any) => void, id: string }) {

    return <div className='configRow'>
        <span className="configItem">
            {setting.readableName}
        </span>
        <span className="configItem">
            <label className="select">
                <select id={id} onChange={handleChange} disabled={disabled}>
                    {setting.options.map((opt, i) => {
                        return <option value={opt} selected={i === setting.value} >{opt}</option>
                    })}
                </select>
            </label>
        </span>
    </div>
}


function handleVarType(val: any, id: string, onchange?: (e: any) => void) {
    switch (val.value) {
        case '%button':
            return <button id={id}>OK</button>;
        case 'false':
            return <span className="configItem"><label className="switch">
                <input id={id} type="checkbox" onChange={onchange} />
                <span className="slider round"></span>
            </label></span>
        case 'true':
            return <span className="configItem"><label className="switch">
                <input id={id} type="checkbox" onChange={onchange} />
                <span className="slider round"></span>
            </label></span>
        default:
            if (val.options) {
                return <span className="configItem">
                    <select id={id} onChange={onchange}>
                        {val.options.map((opt: any, i: number) => <option value={i} selected={i === val.value} >{opt}</option>)}
                    </select>
                </span>;
            }
            return <span className="configItem">
                <input id={id} type="text" value={val.value} onChange={onchange} />
            </span>;
    }
}
