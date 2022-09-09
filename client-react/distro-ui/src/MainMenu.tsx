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
    Link,
    useRouteMatch,
    useHistory,
    NavLink,
} from "react-router-dom";
import Neighbour from './Neighbour';
import PageDisplay from './Routes/PageDisplay';
import { Logger } from './log';
import * as Config from './Config';

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

export default function MainMenu({ device, data, loggers, conf }: { device: Neighbour, data: Types.DistroData, loggers: { app: Logger, mdns: Logger }, conf?: { [key: string]: Types.OneStageMinMax | Types.OneStageOptions | Types.OneStageValue } }) {

    const home = new MenuItem({
        title: 'Home',
        component: () => <PageHome device={device} log={loggers.app} config={conf} />,
        icon: <HomeIcon />
    });
    const display = new MenuItem({
        title: 'Display',
        component: () => <PageDisplay />,
        icon: < LightModeIcon />
    });


    const chart = new MenuItem({
        title: 'Chart',
        component: () => <PageChart device={device} />,
        icon: <ShowChartIcon />
    });

    const cfg = new MenuItem({
        title: 'Cfg',
        icon: <SettingsOutlinedIcon />,
        component: () => <PageConfigMenu device={device} times={{
            dbTime: undefined,
            server: undefined
        }} />
    })

    const addDevice = new MenuItem({
        title: 'Device',
        icon: <>+</>,
        component: () => <PageAddDevice />,
    })


    const channelPage = new MenuItem({
        title: 'Channel',
        state: useState,
        component: () => <OnesMenu menuItem={channelPage} subpath={channelPage.startingPage} lastPath={channelPage.onPageChange} footer={true} />,
        icon: <FormatListNumberedIcon />,
        pages: [new MenuItem({
            title: 'Basic',
            component: (phaseData?: any) => <PageBasic device={device} log={loggers.app} />
        }), new MenuItem({
            title: 'L1',
            component: (phaseData?: any) => <PagePhase device={device} log={loggers.app} phaseIndex={0} />,
        }), new MenuItem({
            title: 'L2',
            component: (phaseData?: any) => <PagePhase device={device} log={loggers.app} phaseIndex={1} />,
        }), new MenuItem({
            title: 'L3',
            component: (phaseData?: any) => <PagePhase device={device} log={loggers.app} phaseIndex={2} />,
        }), new MenuItem({
            title: 'Adv',
            component: (phaseData?: any) => <PageAdv device={device} log={loggers.app} />,
        })]
    });

    const log = new MenuItem({
        title: 'Log',
        component: (attention: any) => <PageLog logs={loggers} attention={attention} onLoad={undefined} />//onLoad={() => this.setState((prevState) => ({ ...prevState, attention: false }))} />,
    })

    const main = new MenuItem({ title: '/', pages: [home, display, channelPage, chart, cfg, log] })

    return < OnesMenu index={true} menuItem={main} />
}

/**
 * Default OneStage menu component
 * @param param0 Object containing options object, callback to receive most recent path and default subpath
 * @returns React Component
 */
const OnesMenu = ({ menuItem, lastPath, subpath, index, footer }: {
    menuItem: MenuItem, lastPath?: (path: string) => void, subpath?: string, index?: boolean, footer?: boolean
}) => {
    const history = useHistory();

    let { url } = useRouteMatch();
    if (index) url = '';

    let className = "menu ";
    if (footer) className += 'footer';

    // Set current url to supplied subpath
    if (subpath && history.location.pathname !== `${url}/${subpath}`) {
        history.replace(`${url}/${subpath}`);
    }

    const Menu = () => {
        let element;

        // Print title + submenu above child routes
        if (!menuItem.replace) {
            element = <div className={className}>
                {
                    menuItem.pages && menuItem.pages.map((page) => {
                        const path = `${url}/${page.title}`;
                        let className = '';
                        if (path) {
                            className += (history.location.pathname.includes(path)) ? 'selected' : '';
                        }
                        return (
                            <NavLink to={`${url}/${page.title}`} className={className} onClick={() => lastPath && lastPath(page.title)}>{page.icon || page.title}</NavLink>
                        )
                    })
                }
            </div>
        } else {
            element = <Route exact path={`${url}/`}>
                <h1>{menuItem.title}</h1>
                <ul>
                    {
                        // Print menu
                        menuItem.pages && menuItem.pages.map((page) => {
                            return (
                                <li>
                                    <Link to={`${url}/${page.title}`} onClick={() => lastPath && lastPath(page.title)}>{page.title}</Link>
                                </li>
                            )
                        })
                    }
                </ul>
            </Route>
        }

        return element;
    }

    const Content = () => {
        // Print child pages
        let element = [<></>];
        if (menuItem.pages) element = menuItem.pages.map((page) => {
            return (
                <Route path={`${url}/${page.title}`}>
                    {page.component && page.component()}
                </Route>
            )
        })

        return <>{
            element
        }</>
    }

    return (
        footer ? <>< Content /> <Menu /></> : <><Menu /><Content /></>
    );
}

/**
 * Distro configuration menu
 * @param param0 props containing the device to configure and Date objects
 * @returns React Componenet
 */
function PageConfigMenu({ device, times }: { device: Neighbour, times: { dbTime?: Date, server?: Date } }) {
    let { url } = useRouteMatch();

    const pages = [new MenuItem({
        title: 'Warnings',
        component: () => <PageConfig type="warnings" submit={true} device={device} />,
        icon: <ReportProblemIcon />
    }), new MenuItem({
        title: 'Network',
        component: () => <PageConfig type="network" submit={true} device={device} />,
        icon: <SettingsEthernetIcon />
    }), new MenuItem({
        title: 'Time',
        component: () => <PageConfig type="time" submit={true} device={device} />,
        icon: <AccessTimeIcon />
    }), new MenuItem({
        title: 'Locale',
        component: () => <PageConfig type="locale" submit={true} device={device} />,
        icon: <LocationOnIcon />
    }), new MenuItem({
        title: 'Power',
        component: () => <PageConfig type="power" device={device} />,
        icon: <PowerSettingsNewIcon />
    }), new MenuItem({
        title: 'System',
        component: () => <PageConfig type="system" device={device} />,
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
                        {val.options.map((opt: any) => <option value={opt} selected={opt === val.value} >{opt}</option>)}
                    </select>
                </span>;
            }
            return <span className="configItem">
                <input id={id} type="text" value={val.value} onChange={onchange} />
            </span>;
    }
}

function PageConfig({ type, submit, device }: { type: string, submit?: boolean, device: Neighbour }) {

    const [conf, setConf] = useState<{ [key: string]: Types.OneStageValue | Types.OneStageMinMax | Types.OneStageOptions } | undefined>(undefined);


    if (type && !conf) {
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

        {submit ? <button onClick={() => Config.submitConfig(device.urlFromIp(), { [type]: conf })}>Submit</button> : null}
    </>
}

function PageAddDevice() {
    const ipKey = 'ipAddresses';

    const [storedPeriod, setStoredPeriod] = useState<string[]>(JSON.parse(window.localStorage.getItem(ipKey) || '[]'));

    const [ipAddress, setIpAddress] = useState('');

    const addDevice = (e: React.FormEvent<HTMLFormElement>) => {
        if (ipAddress) {
            const newArr = [...storedPeriod, ipAddress];
            setStoredPeriod(newArr);
            setIpAddress('');
            localStorage.setItem(ipKey, JSON.stringify(newArr));
        }
    }

    const removeDevice = (ip: string) => {
        const curStoredPeriod = storedPeriod.filter((item) => item !== ip);
        setStoredPeriod(curStoredPeriod);
        localStorage.setItem(ipKey, JSON.stringify(curStoredPeriod));
    }

    return <>
        <h3>Add Device</h3>
        <form onSubmit={addDevice}>
            <label htmlFor="ip">IP:Port</label>
            <input onChange={(e) => {
                e.preventDefault();
                setIpAddress(e.target.value)
            }} type="text" id="ip" name="ip" value={ipAddress} />
            <input type="submit" value="Submit" />
        </form>

        <h3>Current Devices</h3>
        {storedPeriod.map((ip) => <div>
            <button onClick={() => removeDevice(ip)}>X</button>
            <span>{ip}</span>
        </div>)}
    </>
}