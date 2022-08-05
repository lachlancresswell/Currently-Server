import React from 'react'
import * as Types from '../types'
import PhaseDetails from '../Components/PhaseDetails'

export default function PageBasic({ data }: { data: Types.DistroData }): any {
  return (
    data.phases.map((phase, i, array) => {
      return <PhaseDetails key={Object.keys(array)[i]} data={phase} />
    })
  );
}
