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
import { Logger, History } from './log';

const testData: Types.DistroData = {
  time: new Date(),
  pf: 3,
  kva: 600,
  hz: 60,
  phases: [{
    voltage: 238,
    amperage: 8.4,
    phase: 1,
  }, {
    voltage: 233,
    amperage: 4.1,
    phase: 2,
  }, {
    voltage: 232,
    amperage: 2.4,
    phase: 3,
  }]
}

let once = false;

let loggers: { app: Logger, mdns: Logger };
class App extends React.Component<{}, {
  neighbours: Neighbour[], phaseData: Types.DistroData,
  curDevice: number,
  config: any,
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
  conf: { [key: string]: Types.OneStageValue | Types.OneStageMinMax | Types.OneStageOptions } | undefined
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

    let config = {};

    const path = '127.0.0.1/8200';
    config = Config.getConfig(path).then((res) => {
      this.setState((prevState) => ({ ...prevState, config: res }))
    }, (rej) => {
      this.log.warn('Failed to GET - ' + path)
    })

    loggers = { app: this.log, mdns: this.mdns.log }

    this.state = {
      config,
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
    const myFunc2 = () => {

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

              const newState = { ...prevState, ...{ neighbours, curDevice, status, time: { ...prevState.time, server: time } } };
              return newState;
            });
          }
        }, (rej) => {
        })
      } catch (e) {
        this.setState(prevState => ({ ...prevState, status: { ...prevState.status, server: false } }));
      } finally {
        setTimeout(() => myFunc2(), 5000);
      }
    }
    if (!once) {
      once = true;
      this.setState((prevState) => ({ ...prevState, discovery: true }))
      this.log.debug('Starting discovery loop')
      myFunc2();
    }
    const myFunc = () => {
      const curNeighbour = this.state.neighbours.find((n) => n.id === this.state.curDevice);
      if (curNeighbour) {
        if (!this.state.curNeighbour || this.state.curNeighbour && curNeighbour.id !== this.state.curNeighbour.id) {
          Config.getConfig(curNeighbour.urlFromIp()).then((conf) => {
            this.setState(prevState => {
              return { ...prevState, curNeighbour, conf };
            });
          });
        }
      }
      setTimeout(myFunc, 1000);
    }
    myFunc();
  }

  onDeviceSelected = (e: number) => this.setState(prevState => ({ ...prevState, ...{ curDevice: e } })
  );

  render() {
    return <div id='single-page' className='single-page'>
      <BrowserRouter>
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
