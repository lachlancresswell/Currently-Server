import React, { Dispatch, SetStateAction, useState } from 'react';
import * as Types from './types'
import PageBasic from './Routes/PageBasic';
import PagePhase from './Routes/PagePhase';
import PageHome from './Routes/PageHome'
import PageAdv from './Routes/PageAdv';
import PageChart from './Routes/PageChart';
import PageLog from './Routes/PageLog';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LightModeIcon from '@mui/icons-material/LightMode';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import HomeIcon from '@mui/icons-material/Home';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import HelpIcon from '@mui/icons-material/Help';
import './Styles/Button.css';
import {
    Route,
    useRouteMatch,
    NavLink,
} from "react-router-dom";
import Neighbour from './Neighbour';
import PageDisplay from './Routes/PageDisplay';
import { Logger } from './log';
import * as Config from './Config';
import * as Influx from './Plugins/influx';

/**
 * An item displayed in a menu
 */
class MenuItem {
    title: string;
    paths: string[];
    icon?: JSX.Element;
    pages?: MenuItem[];
    replace?: boolean;
    component?: (...args: any[]) => JSX.Element;
    // Should the element have subpaths/subpages, where should it start?
    startingPage?: string;
    // Called on subpath/subpage traversal
    onPageChange?: (page: string) => void;

    constructor(options: { title: string, replace?: boolean, state?: (val: string) => [string, Dispatch<SetStateAction<string>>], setPage?: (page: string) => void, component?: (...args: any[]) => JSX.Element, paths?: string[], icon?: JSX.Element, pages?: MenuItem[] }) {
        this.title = options.title;
        this.component = options.component;
        this.paths = [`/${options.title}`];
        if (options.paths) this.paths = this.paths.concat(options.paths);
        this.icon = options.icon;
        this.pages = options.pages;
        this.replace = options.replace;

        // Maintain selected subpage in parent if subpages exist
        if (options.state && options.pages) {
            const [startingPage, onPageChange] = options.state(options.pages[0].title);
            this.startingPage = startingPage;
            this.onPageChange = onPageChange
        }
    }
}

let fetching = false;
let v = 0;

export default function MainMenu({ device, loggers, conf, updateConf }: { device: Neighbour, loggers: { app: Logger, mdns: Logger }, conf?: { [key: string]: Types.OneStageMinMax | Types.OneStageOptions | Types.OneStageValue }, updateConf: () => void }) {

    const [state, setState] = useState<{ data: Types.DistroData | undefined, pause: Promise<boolean> }>({
        data: undefined,
        pause: new Promise((res) => setTimeout(() => { res(true) }, 1000)),
    })

    const [lastChannelPath, setLastChannelPath] = useState('basic');

    if (device && !fetching) {
        fetching = true;

        const funccc = () => {
            loggers.app.debug('Fetching...')
            Influx.plugin.pollServer(device.db).then((phaseData) => {
                loggers.app.debug('Returned.')
                fetching = false;
                phaseData!.hz = v;
                v += 1;
                setState((last) => ({
                    data: phaseData,
                    pause: new Promise((res) => setTimeout(() => {
                        res(true)
                    }, 1000)),
                }));
            })
        }

        state.pause.then(funccc);
    }

    return (<>
        <div className={"menu "}>
            <NavLink to={`/home`}>
                <HomeIcon />
            </NavLink>
            <NavLink to={'/display'}>
                < LightModeIcon />
            </NavLink>
            <NavLink to={`/channel/${lastChannelPath}`}>
                <FormatListNumberedIcon />
            </NavLink>
            <NavLink to={'/chart'}>
                <ShowChartIcon />
            </NavLink>
            <NavLink to={'/cfg'}>
                <SettingsOutlinedIcon />
            </NavLink>
            <NavLink to={`/log`}>
                Log
            </NavLink>
        </div>
        <Route path={'/home'}>
            <PageHome device={device} data={state.data!} log={loggers.app} config={conf} />
        </Route>
        <Route path={'/display'}>
            <PageDisplay />
        </Route>
        <Route exact path={`/channel/basic`}>
            <PageBasic device={device} data={state.data!} log={loggers.app} config={conf} />
        </Route>
        <Route exact path={`/channel/l1`}>
            <PagePhase device={device} data={state.data!} log={loggers.app} phaseIndex={0} config={conf} />
        </Route>
        <Route exact path={`/channel/l2`}>
            <PagePhase device={device} data={state.data!} log={loggers.app} phaseIndex={1} config={conf} />
        </Route>
        <Route exact path={`/channel/l3`}>
            <PagePhase device={device} data={state.data!} log={loggers.app} phaseIndex={2} config={conf} />
        </Route>
        <Route exact path={`/channel/adv`}>
            <PageAdv device={device} data={state.data!} log={loggers.app} />
        </Route>
        <Route exact path={`/channel`}>
            <>
                {
                    // history.replace(`channel/${state.lastChannelPath}`)
                }
            </>
        </Route>
        <Route path={`/channel`}>
            <div className={"menu footer"}>
                <NavLink to={`basic`} onClick={() => setLastChannelPath('basic')} >Basic</NavLink>
                <NavLink to={`l1`} onClick={() => setLastChannelPath('l1')}>L1</NavLink>
                <NavLink to={`l2`} onClick={() => setLastChannelPath('l2')}>L2</NavLink>
                <NavLink to={`l3`} onClick={() => setLastChannelPath('l3')}>L3</NavLink>
                <NavLink to={`adv`} onClick={() => setLastChannelPath('adv')}>Adv</NavLink>
            </div>
        </Route>
        <Route path={'/chart'}>
            <PageChart device={device} />
        </Route>
        <Route path={`/cfg`}>
            <PageConfigMenu device={device} times={{
                dbTime: undefined,
                server: undefined
            }} updateConf={updateConf} />
        </Route>
        <Route path={`/log`}>
            <PageLog logs={loggers} attention={false} onLoad={undefined} />
        </Route>
    </>);
}

/**
 * Distro configuration menu
 * @param param0 props containing the device to configure and Date objects
 * @returns React Componenet
 */
function PageConfigMenu({ device, times, updateConf }: { device: Neighbour, times: { dbTime?: Date, server?: Date }, updateConf: () => void }) {
    let { url } = useRouteMatch();

    const pages = [new MenuItem({
        title: 'Warnings',
        component: () => <PageConfig type="warnings" submit={true} device={device} updateConf={updateConf} />,
        icon: <ReportProblemIcon />
    }), new MenuItem({
        title: 'Network',
        component: () => <PageConfig type="ip-settings" submit={true} device={device} updateConf={updateConf} />,
        icon: <SettingsEthernetIcon />
    }), new MenuItem({
        title: 'Time',
        component: () => <PageConfig type="time" submit={true} device={device} updateConf={updateConf} />,
        icon: <AccessTimeIcon />
    }), new MenuItem({
        title: 'Locale',
        component: () => <PageConfig type="locale" submit={true} device={device} updateConf={updateConf} />,
        icon: <LocationOnIcon />
    }), new MenuItem({
        title: 'Power',
        component: () => <PageConfig type="power" device={device} updateConf={updateConf} />,
        icon: <PowerSettingsNewIcon />
    }), new MenuItem({
        title: 'System',
        component: () => <PageConfig type="system" device={device} updateConf={updateConf} />,
        icon: <HelpIcon />
    })];

    const title = {
        "Warnings": {},
        'Network': {},
        'Time': {},
        'Locale': {},
        'Power': {},
        'System': {},

    }

    const elements = Object.keys(title).map((pluginTitle) => {
        const page = pages.find((page) => page.title === pluginTitle);
        if (page) {
            return <NavLink style={{ color: 'white' }} to={`${url}/${page?.title}`}>{page.icon}</NavLink>
        } else {
            return <></>
        }
    })

    return (
        <>
            <Route exact path={`${url}/`} >
                <div className='pageParent pageConfig'>
                    {
                        elements.map((element, index) => {
                            let rtn;
                            if (index % 2 === 0) {
                                rtn = <div className='pageCol'>
                                    <div className={`pageRow}`}>
                                        {elements[index]}
                                    </div>
                                    {
                                        (index + 1 < elements.length) && <div className={`pageRow}`}>{elements[index + 1]}</div>
                                    }
                                </div>
                            }
                            return rtn;
                        })
                    }
                </div>
            </Route>

            {
                pages && pages.map((page) => {
                    return (
                        <Route path={`${url}/${page.title}`}>
                            {page.component && page.component()}
                        </Route>
                    )
                })
            }
        </>
    )
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

function PageConfig({ type, submit, device, updateConf }: { type: string, submit?: boolean, device: Neighbour, updateConf: () => void }) {

    const [conf, setConf] = useState<{ [key: string]: Types.OneStageValue | Types.OneStageMinMax | Types.OneStageOptions } | undefined>(undefined);

    if (type && !conf && device) {
        Config.getConfig(device.urlFromIp()).then((conf) => {
            if ((conf as any)[type]) setConf((conf as any)[type]);
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, setting: any) => {
        setConf((curConf) => {
            if (curConf) {

                const id = e.target.id;
                const conf = curConf[id];

                if (conf) {
                    if (typeof (conf.value) === 'number') {
                        if (e.target.value) conf.value = parseInt(e.target.value)
                        if ((conf as Types.OneStageMinMax).max && conf.value > (conf as Types.OneStageMinMax).max) conf.value = (conf as Types.OneStageMinMax).max;
                        else if ((conf as Types.OneStageMinMax).min && conf.value < (conf as Types.OneStageMinMax).min) conf.value = (conf as Types.OneStageMinMax).min;
                    }
                    else conf.value = e.target.value;
                    curConf[id] = conf;
                }

            }
            return { ...curConf }
        });
    }

    return <>{
        conf && Object.keys(conf).map((key) => {
            const setting = conf[key]
            return <div className='configRow'>
                <span className="configItem">
                    {setting.readableName}
                </span>
                {
                    handleVarType(setting, key, (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleChange(e, setting))
                }
            </div>;
        })}

        {submit ? <button onClick={() => Config.submitConfig(device.urlFromIp(), { [type]: conf }).then(updateConf)}>Submit</button> : null}
    </>
}
