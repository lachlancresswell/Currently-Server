import { DistroData, ConfigArray, ConfigVariableMetadata, WarningsOptions } from '../../../Types'
import { useConfigContext } from '../Hooks/useConfig';

export interface Config {
    warnings: ConfigArray
}

const PLUGIN_NAME = 'warnings';

export function Warning({ data, type, phaseIndex }: { data: DistroData, type: 'va' | 'hz' | 'voltage' | 'amperage' | 'pf' | 'kva', phaseIndex?: 0 | 1 | 2 }) {
    const { getPluginConfig } = useConfigContext();

    const pluginData = getPluginConfig<WarningsOptions>(PLUGIN_NAME);

    let colour = '';
    if (pluginData && data) {
        const enable = pluginData.enable as ConfigVariableMetadata<boolean>;
        const visible = enable.value;

        switch (type) {
            case 'hz':
                colour = toleranceToColour(pluginData, data, 'hz')
                break;
            case 'va':
                if (phaseIndex !== undefined && phaseIndex > -1) colour = toleranceToColourVA(pluginData, data, phaseIndex)
                break;
            case 'voltage':
                if (phaseIndex !== undefined && phaseIndex > -1) colour = toleranceToColour(pluginData, data, 'voltage', phaseIndex)
                break;
            case 'amperage':
                if (phaseIndex !== undefined && phaseIndex > -1) colour = toleranceToColour(pluginData, data, 'amperage', phaseIndex)
                break;
            case 'kva':
                if (phaseIndex !== undefined && phaseIndex > -1) colour = toleranceToColour(pluginData, data, 'kva', phaseIndex)
                break;
            case 'pf':
                if (phaseIndex !== undefined && phaseIndex > -1) colour = toleranceToColour(pluginData, data, 'pf', phaseIndex)
                break;
        }

        return (<span style={{ display: visible ? '' : 'none' }} className={`circle ${colour}`}></span>)
    } else {
        return <></>
    }
}

const checkToleranceMaxMin = (set: number, max: number, min: number, val: number): -1 | -0.5 | 0 | 0.5 | 1 => {
    const setMax = set + max
    const setMin = set - min;

    const orangeZoneMax = setMax - (max / 5);
    const orangeZoneMin = setMin + (max / 5);

    if (val < setMax && val > orangeZoneMax) return 0.5;
    if (val > setMin && val < orangeZoneMin) return -0.5;
    if (val >= setMax) return 1;
    if (val <= setMin) return -1;

    return 0;
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