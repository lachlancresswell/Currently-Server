import React from 'react';
import Status from './Components/Status'
import * as Types from './types'
import './Styles/App.css';
import MainMenu from './MainMenu';
import { BrowserRouter, useLocation } from "react-router-dom";
import * as MDNS from './Plugins/mdns';
import * as Influx from './Plugins/influx';
import Neighbour from './Neighbour';
import * as Config from './Config';
import { Logger } from './log';

let once = false;

let loggers: { app: Logger, mdns: Logger };
class App extends React.Component<{}, {
  neighbours: Neighbour[], phaseData: Types.DistroData,
  curDevice: number,
  discovery: boolean,
  curNeighbour?: Neighbour,
  status: {
    server: boolean,
    influx: boolean,
  },
  time: {
    server: Date
  },
  attention: boolean,
  conf: { [key: string]: { [key: string]: Types.OneStageValue | Types.OneStageMinMax | Types.OneStageOptions } } | undefined
}> {
  mdns: MDNS.plugin;
  influx: Influx.plugin;
  log: Logger;
  tId: NodeJS.Timeout | undefined;

  constructor(props: any) {
    super(props);

    // 1000ms buffer for logs
    this.log = new Logger('App', () => {
      if (!this.tId) {
        this.tId = setTimeout(() => {
          this.tId = undefined;
          loggers = { app: this.log, mdns: this.mdns.log };
        }, 1000)
      }
    });

    this.mdns = new MDNS.plugin();
    this.mdns.log.cb = this.log.cb;
    this.mdns.log.attachListener('WARN', () => {
      if (useLocation().pathname !== '/log') this.setState((prevState) => ({ ...prevState, attention: true }));
    })
    this.influx = new Influx.plugin();

    const curDevice = -1;
    const neighbours = [] as Neighbour[];

    const phaseData: Types.DistroData = {
      time: new Date(),
      pf: undefined,
      kva: undefined,
      hz: undefined,
      phases: [{
        voltage: undefined,
        amperage: undefined,
        phase: 1,
      }, {
        voltage: undefined,
        amperage: undefined,
        phase: 2,
      }, {
        voltage: undefined,
        amperage: undefined,
        phase: 3,
      }]
    };

    loggers = { app: this.log, mdns: this.mdns.log }

    this.state = {
      phaseData,
      curDevice,
      neighbours,
      curNeighbour: undefined,
      discovery: false,
      status: {
        server: false,
        influx: false
      },
      time: {
        server: new Date()
      },
      attention: false,
      conf: undefined,
    }
  }

  componentDidMount() {
    this.log.debug('Component did mount.')

    if (!once) {
      once = true;
      this.setState((prevState) => ({ ...prevState, discovery: true }))
      this.log.debug('Starting discovery loop')
      this.discoveryLoop();
    }

    this.getCurrentDeviceConfig();
  }

  /**
   * Queries server for neighbour list + updates client list
   */
  discoveryLoop = () => {
    try {
      this.mdns.discoveryLoop().then(({ newNeighbours, time }) => {
        if (newNeighbours) {
          this.setState(prevState => {
            let neighbours = prevState.neighbours;
            let curDevice = prevState.curDevice;
            const status = prevState.status;

            if (newNeighbours) {
              newNeighbours.forEach((n) => {
                neighbours = neighbours.concat(new Neighbour(n));
                if (curDevice < 0) curDevice = neighbours[0].id;
                status.server = true;
              })
            }

            return { ...prevState, ...{ neighbours, curDevice, status, time: { ...prevState.time, server: time } } }
          });
        }
      }, (rej) => {
      })
    } catch (e) {
      this.setState(prevState => ({ ...prevState, status: { ...prevState.status, server: false } }));
    } finally {
      setTimeout(() => this.discoveryLoop(), 5000);
    }
  }

  /**
   * Loop to check wether the currently selected device has changed and returns the new config if so
   */
  getCurrentDeviceConfig = () => {
    const curNeighbour = this.state.neighbours.find((n) => n.id === this.state.curDevice);
    if (curNeighbour && (!this.state.curNeighbour || this.state.curNeighbour && curNeighbour.id !== this.state.curNeighbour.id)) {
      Config.getConfig(curNeighbour.urlFromIp()).then((conf) => {
        this.setState(prevState => {
          return { ...prevState, curNeighbour, conf };
        });
      });
    }
    setTimeout(this.getCurrentDeviceConfig, 1000);
  }

  onDeviceSelected = (e: number) => this.setState(prevState => ({ ...prevState, ...{ curDevice: e } }));

  render() {
    return <div id='single-page' className='single-page'>
      <BrowserRouter>
        {/* <Status status={this.state.status} neighbours={this.state.neighbours} selectedDeviceIndex={this.state.curDevice} onDeviceSelected={this.onDeviceSelected} attention={this.state.attention} /> */}

        <MainMenu device={this.state.curNeighbour!} loggers={loggers} conf={this.state.conf} updateConf={() => {
          if (this.state.curNeighbour) {
            Config.getConfig(this.state.curNeighbour.urlFromIp()).then((conf) => {
              this.setState(prevState => {
                return { ...prevState, conf };
              });
            });
          }
        }} />
      </BrowserRouter>
    </div>
  }
}

export default App;
