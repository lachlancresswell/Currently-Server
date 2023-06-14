import { DistroData, ConfigArray, VariableMetadata, ConfigVariableMetadata } from '../../../Types'
import { useConfigDataContext } from '../Hooks/configContext';

export interface Config {
    warnings: ConfigArray
}

export function Warning({ data, type, phaseIndex }: { data: DistroData, type: 'va' | 'hz' | 'voltage' | 'amperage' | 'pf' | 'kva', phaseIndex?: 0 | 1 | 2 }) {

    const { configData } = useConfigDataContext();

    let colour = '';
    if (configData && data) {

        const enable = configData!.warnings.config!.enable as ConfigVariableMetadata<boolean>;
        const visible = enable.value;

        switch (type) {
            case 'hz':
                colour = toleranceToColour(configData!.warnings.config!, data, 'hz')
                break;
            case 'va':
                if (phaseIndex !== undefined && phaseIndex > -1) colour = toleranceToColourVA(configData!.warnings.config!, data, phaseIndex)
                break;
            case 'voltage':
                if (phaseIndex !== undefined && phaseIndex > -1) colour = toleranceToColour(configData!.warnings.config!, data, 'voltage', phaseIndex)
                break;
            case 'amperage':
                if (phaseIndex !== undefined && phaseIndex > -1) colour = toleranceToColour(configData!.warnings.config!, data, 'amperage', phaseIndex)
                break;
            case 'kva':
                if (phaseIndex !== undefined && phaseIndex > -1) colour = toleranceToColour(configData!.warnings.config!, data, 'kva', phaseIndex)
                break;
            case 'pf':
                if (phaseIndex !== undefined && phaseIndex > -1) colour = toleranceToColour(configData!.warnings.config!, data, 'pf', phaseIndex)
                break;
        }

        return (<span style={{ display: visible ? '' : 'none' }} className={`circle ${colour}`}></span>)
    } else {
        return <></>
    }
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

export const toleranceToColour = (warnings: ConfigArray, data: DistroData, type: 'amperage' | 'voltage' | 'hz' | 'kva' | 'pf', phaseIndex: 0 | 1 | 2 = 0) => {
    let rtn = undefined;
    let colour = undefined;

    switch (type) {
        case 'amperage':
            rtn = checkToleranceMax(warnings.amax.value as number, data.phases[phaseIndex].amperage!);
            break;
        case 'voltage':
            rtn = checkToleranceMaxMin(warnings.vSet.value as number, warnings.vmax.value as number, warnings.vmin.value as number, data.phases[phaseIndex].voltage!);
            break;
        case 'hz':
            rtn = checkToleranceMaxMin(warnings.HZset.value as number, warnings.hzmax.value as number, warnings.hzmin.value as number, data.hz!);
            break;
        case 'kva':
            rtn = checkToleranceMaxMin(warnings.kvaSet.value as number, warnings.kvamax.value as number, warnings.kvamin.value as number, data.kva!);
            break;
        case 'pf':
            rtn = checkToleranceMaxMin(warnings.pfSet.value as number, warnings.pfmax.value as number, warnings.pfmin.value as number, data.pf!);
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

export const toleranceToColourVA = (warnings: ConfigArray, data: DistroData, phaseIndex: 0 | 1 | 2) => {
    let rtn = undefined;
    let colour = undefined;
    const phase = data.phases[phaseIndex];

    rtn = checkToleranceMax(warnings.amax.value as number, phase.amperage!);

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
        rtn = checkToleranceMaxMin(warnings.vSet.value as number, warnings.vmax.value as number, warnings.vmin.value as number, phase.voltage!);

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