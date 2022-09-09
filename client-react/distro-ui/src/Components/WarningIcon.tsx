import * as Types from '../types'
import * as Warnings from '../warnings'

export const WarningIcon = (data: Types.DistroData | undefined, config: Types.Config | undefined, type: 'voltage' | 'amperage' | 'hz' | 'VA', phaseIndex: 0 | 1 | 2) => {
    return (<div className='pageRow'>
        {type === 'voltage' || type === 'amperage' || type === 'hz' ?
            <span className={`circle ${data && config && Warnings.toleranceToColourVA(config, data, phaseIndex)}`} />
            :
            <span className={`circle ${data && config && Warnings.toleranceToColourVA(config, data, phaseIndex)}`} />
        }
    </div>);
}
