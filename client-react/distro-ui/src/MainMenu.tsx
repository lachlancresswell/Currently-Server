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

export default function MainMenu({ device, data, loggers }: { device: Neighbour, data: Types.DistroData, loggers: any }) {

    const home = new MenuItem({
        title: 'Home',
        component: () => <PageHome data={data} />,
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
        component: () => <PageConfigMenu times={{
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
            component: (phaseData?: any) => <PageBasic data={data} />
        }), new MenuItem({
            title: 'L1',
            component: (phaseData?: any) => <PagePhase data={data} phaseIndex={0} />,
        }), new MenuItem({
            title: 'L2',
            component: (phaseData?: any) => <PagePhase data={data} phaseIndex={1} />,
        }), new MenuItem({
            title: 'L3',
            component: (phaseData?: any) => <PagePhase data={data} phaseIndex={2} />,
        }), new MenuItem({
            title: 'Adv',
            component: (phaseData?: any) => <PageAdv data={data} />,
        })]
    });

    const log = new MenuItem({
        title: 'Log',
        component: (attention: any) => <PageLog loggers={loggers} attention={attention} onLoad={undefined} />//onLoad={() => this.setState((prevState) => ({ ...prevState, attention: false }))} />,
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

interface OneStageMinMax {
    title: string,
    readableName: string,
    value: number,
    min: number,
    max: number,
}

interface OneStageOptions {
    title: string,
    readableName: string,
    index: number,
    options: any[],
}

interface OneStageValue {
    title: string,
    readableName: string,
    value: any,
}

/**
 * Distro configuration menu
 * @param param0 props containing the device to configure and Date objects
 * @returns React Componenet
 */
function PageConfigMenu({ device, times }: { device?: Neighbour, times: { dbTime?: Date, server?: Date } }) {
    let { url } = useRouteMatch();

    const startConfig: {
        "Warnings": (OneStageValue | OneStageMinMax | OneStageOptions)[],
        "Network": (OneStageValue | OneStageMinMax | OneStageOptions)[],
        "Time": (OneStageValue | OneStageMinMax | OneStageOptions)[],
        "Locale": (OneStageValue | OneStageMinMax | OneStageOptions)[],
        "Power": (OneStageValue | OneStageMinMax | OneStageOptions)[],
        "System": (OneStageValue | OneStageMinMax | OneStageOptions)[],
    } = {
        "Warnings": [{
            "title": "vSet",
            "readableName": "V Set",
            "value": 240,
            "min": 0,
            "max": 300
        }, {
            "title": "vmax",
            "readableName": "V Max",
            "value": 5,
            "min": 0,
            "max": 300
        }, {
            "title": "vmin",
            "readableName": "V Min",
            "value": 10,
            "min": 0,
            "max": 300
        }, {
            "title": "amax",
            "readableName": "A Max",
            "value": 32,
            "min": 0,
            "max": 300
        }, {
            "title": "HZset",
            "readableName": "HZ Set",
            "value": 50,
            "min": 0,
            "max": 100
        }, {
            "title": "hzmax",
            "readableName": "HZ Max",
            "value": 1,
            "min": 0,
            "max": 100
        }, {
            "title": "hzmin",
            "readableName": "HZ Min",
            "value": 1,
            "min": 0,
            "max": 100
        }],
        "Network": [{
            "title": "id",
            "readableName": "ID",
            "value": "Stage Left PA"
        }, {
            "title": "ip_address",
            "readableName": "IP Address",
            "value": "192.168.1.1"
        }, {
            "title": "subnet_mask",
            "readableName": "Subnet Mask",
            "value": "255.255.255.0"
        }, {
            "title": "gateway",
            "readableName": "Gateway",
            "value": "192.168.1.254"
        }, {
            "title": "dhcp",
            "readableName": "DHCP",
            "index": 0,
            "options": [
                "false",
                "true"
            ]
        }],
        "Time": [{
            "title": "timezone",
            "readableName": "Time Zone",
            "index": 0,
            "options": [
                "GMT+10",
                "GMT+9",
                "GMT+8"
            ]
        }, {
            "title": "timeformat",
            "readableName": "Time Format",
            "index": 0,
            "options": [
                "12H",
                "24H"
            ]
        }, {
            "title": "dateformat",
            "readableName": "Date Format",
            "index": 0,
            "options": [
                "DMY",
                "MDY"
            ]
        }],
        "Locale": [{
            "title": "countr",
            "readableName": "Country",
            "value": "Australia"
        }],
        "Power": [{
            "title": "restart",
            "readableName": "Restart",
            "value": "%button"
        }, {
            "title": "factoryreset",
            "readableName": "Factory Reset",
            "value": "%button"
        }, {
            "title": "memorywipe",
            "readableName": "Memory Wipe",
            "value": "%button"
        }],
        "System": [{
            "title": "firmwarever",
            "readableName": "Firmware",
            "value": "0.10.0"
        }, {
            "title": "memory",
            "readableName": "Available Memory",
            "value": "1.25gb"
        }]
    }

    const pages = [new MenuItem({
        title: 'Warnings',
        component: () => <PageConfig options={startConfig.Warnings} />,
        icon: <ReportProblemIcon />
    }), new MenuItem({
        title: 'Network',
        component: () => <PageConfig options={startConfig.Network} />,
        icon: <SettingsEthernetIcon />
    }), new MenuItem({
        title: 'Time',
        component: () => <PageConfig options={startConfig.Time} />,
        icon: <AccessTimeIcon />
    }), new MenuItem({
        title: 'Locale',
        component: () => <PageConfig options={startConfig.Locale} />,
        icon: <LocationOnIcon />
    }), new MenuItem({
        title: 'Power',
        component: () => <PageConfig options={startConfig.Power} />,
        icon: <PowerSettingsNewIcon />
    }), new MenuItem({
        title: 'System',
        component: () => <PageConfig options={startConfig.System} />,
        icon: <HelpIcon />
    })];

    const elements = Object.keys(startConfig).map((pluginTitle) => {
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


function handleVarType(val: any) {
    switch (val.value) {
        case '%button':
            return <button>OK</button>;
        case 'false':
            return <span className="configItem"><label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
            </label></span>
        case 'true':
            return <span className="configItem"><label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
            </label></span>
        default:
            if (val.options) {
                return <span className="configItem">
                    <select>
                        {val.options.map((opt: any) => <option value={opt}>{opt}</option>)}
                    </select>
                </span>;
            }
            return <span className="configItem">
                <input type="text" value={val.value} />
            </span>;
    }
}

function PageConfig({ options }: { options: (OneStageValue | OneStageMinMax | OneStageOptions)[] }) {
    return <>{
        options.map((setting) => {
            return <div className='configRow'>
                <span className="configItem">
                    {setting.readableName}
                </span>
                {
                    handleVarType(setting)
                }
            </div>;
        })}
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