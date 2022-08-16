import React from 'react'
import * as Types from '../types'
import '../Styles/Page.css';


export default function PageBasic({ data }: { data: Types.DistroData }) {
  return (
    <div className='pageParent pageBasic'>
      <div className='pageCol val'>
        <div className='pageRow l1'>
          <span className='value'>
            {231 || '-'}
          </span>
        </div>
        <div className='pageRow l2'>
          <span className='value'>
            {232 || '-'}
          </span>
        </div>
        <div className='pageRow l3'>
          <span className='value'>
            {233 || '-'}
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
            {8 || '-'}
          </span>
        </div>
        <div className='pageRow l2'>
          <span className='value'>
            {9 || '-'}
          </span>
        </div>
        <div className='pageRow l3'>
          <span className='value'>
            {10 || '-'}
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
