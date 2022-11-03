import { Dispatch, SetStateAction, useState } from 'react';
import * as Types from './types'
import PageConfigMenu from './Routes/PageConfigMenu'
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
import './Styles/Button.css';
import { Route, NavLink } from "react-router-dom";
import Neighbour from './Neighbour';
import PageDisplay from './Routes/PageDisplay';
import { Logger } from './log';
import * as Influx from './Plugins/influx';
import { useLocation } from 'react-router-dom';

/**
 * An item displayed in a menu
 */
class MenuItem {
    title: string;
    paths: string[];
    icon?: JSX.Element;
    pages?: MenuItem[];
    replace?: boolean;
    component?: JSX.Element;
    // Should the element have subpaths/subpages, where should it start?
    startingPage?: string;
    // Called on subpath/subpage traversal
    onPageChange?: (page: string) => void;

    constructor(options: { title: string, replace?: boolean, state?: (val: string) => [string, Dispatch<SetStateAction<string>>], setPage?: (page: string) => void, component?: JSX.Element, paths?: string[], icon?: JSX.Element, pages?: MenuItem[] }) {
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

/**
 * 
 * @param device Currently selected device 
 * @param loggers
 * @param conf Configuration of the currently selected device
 * @param updateConf Callback to reload the configuration of the currently selected device
 * @returns MainMenu component
 */
export default function MainMenu({ device, loggers, conf, updateConf }: { device: Neighbour, loggers: { app: Logger, mdns: Logger }, conf?: { [key: string]: { [key: string]: Types.OneStageMinMax | Types.OneStageOptions | Types.OneStageValue } }, updateConf: () => void }) {

    const [state, setState] = useState<{ data: Types.DistroData | undefined, pause: Promise<boolean> }>({
        data: undefined,
        pause: new Promise((res) => setTimeout(() => { res(true) }, 1000)),
    })

    const [lastChannelPath, setLastChannelPath] = useState('basic');

    const location = useLocation();

    const curPath = location.pathname;

    if (device && !fetching) {
        fetching = true;

        const fetchCurData = () => {
            loggers.app.debug('Fetching...')
            Influx.plugin.pollServer(device.db).then((phaseData) => {
                loggers.app.debug('Returned.')
                fetching = false;
                // phaseData!.hz = v;
                // v += 1;
                setState((last) => ({
                    data: phaseData,
                    pause: new Promise((res) => setTimeout(() => res(true), 1000)),
                }));
            })
        }

        state.pause.then(fetchCurData);
    }

    const isSelected = (path: string) => curPath.includes(path) ? ' selected' : '';

    return (<>
        <div className={"menu "}>
            <NavLink to={`/home`} className={isSelected('home')}>
                <HomeIcon />
            </NavLink>
            <NavLink to={'/display'} className={isSelected('display')}>
                < LightModeIcon />
            </NavLink>
            <NavLink to={`/channel/${lastChannelPath}`} className={isSelected('channel')}>
                <FormatListNumberedIcon />
            </NavLink>
            <NavLink to={'/chart'} className={isSelected('chart')}>
                <ShowChartIcon />
            </NavLink>
            <NavLink to={'/cfg'} className={isSelected('cfg')}>
                <SettingsOutlinedIcon />
            </NavLink>
            <NavLink to={`/log`} className={isSelected('log')}>
                Log
            </NavLink>
        </div>
        <Route exact path={['/home', '/']}>
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
        </Route>
        <Route path={`/channel`}>
            <div className={'menu footer'}>
                <NavLink to={`basic`} className={isSelected('/basic')} onClick={() => setLastChannelPath('basic')} >Basic</NavLink>
                <NavLink to={`l1`} className={isSelected('/l1')} onClick={() => setLastChannelPath('l1')}>L1</NavLink>
                <NavLink to={`l2`} className={isSelected('/l2')} onClick={() => setLastChannelPath('l2')}>L2</NavLink>
                <NavLink to={`l3`} className={isSelected('/l3')} onClick={() => setLastChannelPath('l3')}>L3</NavLink>
                <NavLink to={`adv`} className={isSelected('/adv')} onClick={() => setLastChannelPath('adv')}>Adv</NavLink>
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