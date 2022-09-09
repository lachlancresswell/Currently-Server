import React, { useState } from 'react'
import Neighbour from '../Neighbour';
import * as Types from '../types'
import '../Styles/Page.css';
import { Logger } from '../log';
import * as Influx from '../Plugins/influx';

let fetching = false;

export default function PageBasic({ device, log }: { device?: Neighbour, log: Logger }) {

  const [state, setState] = useState<{ data: Types.DistroData | undefined, pause: Promise<boolean> }>({
    data: undefined,
    pause: new Promise((res) => setTimeout(() => { res(true) }, 1000))
  });

  log.debug("RENDER - PageBasic");

  if (device && !fetching) {
    fetching = true;
    state.pause.then(() => {
      log.debug('Fetching...')
      Influx.plugin.pollServer(device.db).then((phaseData) => {
        log.debug('Returned.')
        fetching = false;
        setState({ data: phaseData, pause: new Promise((res) => setTimeout(() => { res(true) }, 1000)) })
      })
    });
  }

  return (
    <div className='pageParent pageBasic'>
      <div className='pageCol val'>
        <div className='pageRow l1'>
          <span className='value'>
            {state.data?.phases[0].voltage || '-'}
          </span>
        </div>
        <div className='pageRow l2'>
          <span className='value'>
            {state.data?.phases[1].voltage || '-'}
          </span>
        </div>
        <div className='pageRow l3'>
          <span className='value'>
            {state.data?.phases[2].voltage || '-'}
          </span>
        </div>
      </div>
      <div className='pageCol denomin'>
        <div className='pageRow l1'>
          <span>
            V
          </span>
        </div>
        <div className='pageRow l2'>
          <span>
            V
          </span>
        </div>
        <div className='pageRow l3'>
          <span>
            V
          </span>
        </div>
      </div>
      <div className='pageCol val'>
        <div className='pageRow l1'>
          <span className='value'>
            {state.data?.phases[0].amperage || '-'}
          </span>
        </div>
        <div className='pageRow l2'>
          <span className='value'>
            {state.data?.phases[1].amperage || '-'}
          </span>
        </div>
        <div className='pageRow l3'>
          <span className='value'>
            {state.data?.phases[2].amperage || '-'}
          </span>
        </div>
      </div>
      <div className='pageCol denomin'>
        <div className='pageRow l1'>
          <span>
            A
          </span>
        </div>
        <div className='pageRow l2'>
          <span>
            A
          </span>
        </div>
        <div className='pageRow l3'>
          <span>
            A
          </span>
        </div>
      </div>
      <div className='pageCol'>
        <div className='pageRow'>
          <span className='circle green'>
          </span>
        </div>
        <div className='pageRow'>
          <span className='circle orange'>
          </span>
        </div>
        <div className='pageRow'>
          <span className='circle red'>
          </span>
        </div>
      </div>
    </div>
  );
}
