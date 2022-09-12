import Neighbour from '../Neighbour';
import * as Types from '../types'
import '../Styles/Page.css';
import { Logger } from '../log';

export default function PageBasic({ device, data, log, config }: { device?: Neighbour, data: Types.DistroData, log: Logger, config?: any | undefined }) {

  return (
    <div className='pageParent pageBasic'>
      <div className='pageCol val'>
        <div className='pageRow l1'>
          <span className='value'>
            {data?.phases[0].voltage}
          </span>
        </div>
        <div className='pageRow l2'>
          <span className='value'>
            {data?.phases[1].voltage}
          </span>
        </div>
        <div className='pageRow l3'>
          <span className='value'>
            {data?.phases[2].voltage}
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
            {data?.phases[0].amperage}
          </span>
        </div>
        <div className='pageRow l2'>
          <span className='value'>
            {data?.phases[1].amperage}
          </span>
        </div>
        <div className='pageRow l3'>
          <span className='value'>
            {data?.phases[2].amperage}
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
