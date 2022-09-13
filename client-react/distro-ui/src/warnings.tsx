import * as Types from './types'

export function Warning({ config, data, type, phaseIndex }: { config: Types.Config, data: Types.DistroData, type: 'va' | 'hz' | 'voltage' | 'amperage', phaseIndex?: 0 | 1 | 2 }) {
    let colour = '';
    const enable = config.warnings.enable as Types.OneStageOptions;
    const visible = enable.options[enable.value];
    switch (type) {
        case 'hz':
            colour = toleranceToColour(config, data, 'hz')
            break;
        case 'va':
            if (phaseIndex !== undefined && phaseIndex > -1) colour = toleranceToColourVA(config, data, phaseIndex)
            break;
        case 'voltage':
            if (phaseIndex !== undefined && phaseIndex > -1) colour = toleranceToColour(config, data, 'voltage', phaseIndex)
            break;
        case 'amperage':
            if (phaseIndex !== undefined && phaseIndex > -1) colour = toleranceToColour(config, data, 'amperage', phaseIndex)
            break;
    }

    return (<span style={{ display: visible === 'true' ? '' : 'none' }} className={`circle ${colour}`}></span>)
}

const checkToleranceMaxMin = (set: number, max: number, min: number, val: number): -1 | -0.5 | 0 | 0.5 | 1 => {
    let rtn: -1 | -0.5 | 0 | 0.5 | 1 = -1;
    const setMax = set + max
    const setMin = set - min;

    if (val < setMax && val > set + ((max / 10))) rtn = 0.5;
    else if (val > setMin && val < set + ((min / 10))) rtn = -0.5;
    else if (val >= setMax) rtn = 1;
    else if (val <= setMin) rtn = -1;

    return rtn
}

const checkToleranceMax = (max: number, val: number) => {
    let rtn: 0 | 0.5 | 1 = 0;

    if (val < max && val > val + ((max / 10))) rtn = 0.5;
    else if (val >= max) rtn = 1;

    return rtn
}

export const toleranceToColour = (config: Types.Config, data: Types.DistroData, type: 'amperage' | 'voltage' | 'hz', phaseIndex: 0 | 1 | 2 = 0) => {
    let rtn = undefined;
    let colour = undefined;

    switch (type) {
        case 'amperage':
            rtn = checkToleranceMax(config.warnings.amax.value, data.phases[phaseIndex].amperage!);
            break;
        case 'voltage':
            rtn = checkToleranceMaxMin(config.warnings.vSet.value, config.warnings.vmax.value, config.warnings.vmin.value, data.phases[phaseIndex].voltage!);
            break;
        case 'hz':
            rtn = checkToleranceMaxMin(config.warnings.HZset.value, config.warnings.hzmax.value, config.warnings.hzmin.value, data.hz!);
            break;
    }

    switch (rtn) {
        case -1:
            colour = 'red';
            break;
        case -0.5:
            colour = 'orange';
            break;
        case 0:
            colour = 'green';
            break;
        case 0.5:
            colour = 'orange';
            break;
        case 1:
            colour = 'red';
            break;
    }

    return colour;
}

export const toleranceToColourVA = (config: Types.Config, data: Types.DistroData, phaseIndex: 0 | 1 | 2) => {
    let rtn = undefined;
    let colour = undefined;
    const phase = data.phases[phaseIndex];

    rtn = checkToleranceMax(config.warnings.amax.value, phase.amperage!);

    switch (rtn) {
        case 0:
            colour = 'green';
            break;
        case 0.5:
            colour = 'orange';
            break;
        case 1:
            colour = 'red';
            break;
    }

    if (colour !== 'red') {
        rtn = checkToleranceMaxMin(config.warnings.vSet.value, config.warnings.vmax.value, config.warnings.vmin.value, phase.voltage!);

        switch (rtn) {
            case -1:
                colour = 'red';
                break;
            case 1:
                colour = 'red';
                break;
        }
    }
    return colour;
}