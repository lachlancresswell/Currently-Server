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
        component: (device: Neighbour) => <PageChart data={undefined} />,
        icon: <ShowChartIcon />
    });

    const cfg = new MenuItem({
        title: 'Cfg',
        icon: <SettingsOutlinedIcon />,
        component: () => <PageConfig times={{
            dbTime: undefined,
            server: undefined
        }} />
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

/**
 * Distro configuration menu
 * @param param0 props containing the device to configure and Date objects
 * @returns React Componenet
 */
function PageConfig({ device, times }: { device?: Neighbour, times: { dbTime?: Date, server?: Date } }) {
    let { url } = useRouteMatch();

    const pages = [new MenuItem({
        title: 'Warnings',
        component: (phaseData?: any) => <h1>Warnings</h1>,
        icon: <ReportProblemIcon />
    }), new MenuItem({
        title: 'Network',
        component: (phaseData?: any) => <h1>Network</h1>,
        icon: <SettingsEthernetIcon />
    }), new MenuItem({
        title: 'Time',
        component: (phaseData?: any) => <h1>asdasd</h1>,
        icon: <AccessTimeIcon />
    }), new MenuItem({
        title: 'Locale',
        component: (phaseData?: any) => <h1>Locale</h1>,
        icon: <LocationOnIcon />
    }), new MenuItem({
        title: 'Power',
        component: (phaseData?: any) => <h1>Power</h1>,
        icon: <PowerSettingsNewIcon />
    }), new MenuItem({
        title: 'System',
        component: (phaseData?: any) => <h1>System</h1>,
        icon: <HelpIcon />
    })];

    return (
        <>
            <Route exact path={`${url}/`} >
                <div className='pageParent pageConfig'>
                    <div className='pageCol'>
                        <div className={`pageRow}`}>
                            <NavLink style={{ color: 'white' }} to={`${url}/Warnings`}><ReportProblemIcon /></NavLink>
                        </div>
                        <div className={`pageRow}`}>
                            <NavLink style={{ color: 'white' }} to={`${url}/Locale`}><LocationOnIcon /></NavLink>
                        </div>
                    </div>
                    <div className='pageCol'>
                        <div className={`pageRow}`}>
                            <NavLink style={{ color: 'white' }} to={`${url}/Network`}><SettingsEthernetIcon /></NavLink>

                        </div>
                        <div className={`pageRow}`}>
                            <NavLink style={{ color: 'white' }} to={`${url}/Power`}><PowerSettingsNewIcon /></NavLink>

                        </div>
                    </div>
                    <div className='pageCol'>
                        <div className={`pageRow}`}>
                            <NavLink style={{ color: 'white' }} to={`${url}/Time`}><AccessTimeIcon /></NavLink>

                        </div>
                        <div className={`pageRow}`}>
                            <NavLink style={{ color: 'white' }} to={`${url}/System`}><HelpIcon /></NavLink>
                        </div>
                    </div>
                </div >
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

