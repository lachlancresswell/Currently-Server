export interface PhaseData {
    voltage?: number,
    amperage?: number,
    phase: 1 | 2 | 3,
}


export interface DistroData {
    time: Date,
    pf?: number,
    kva?: number,
    hz?: number,
    phases: PhaseData[]
}

export interface NeighbourData {
    ip: string, local: boolean, name: string, secure: boolean, id?: number, influxIP: string
}

export interface ButtonItem {
    title: string,
    icon?: JSX.Element,
    paths?: string[],
    fn?: () => void;
}

export interface OneStageMinMax {
    title: string,
    readableName: string,
    value: number,
    min: number,
    max: number,
}

export interface OneStageOptions {
    title: string,
    readableName: string,
    value: number,
    options: any[],
}

export interface OneStageValue {
    title: string,
    readableName: string,
    value: any,
}

export interface Config {
    warnings: {
        [key: string]: OneStageMinMax | OneStageOptions | OneStageValue
    }
}