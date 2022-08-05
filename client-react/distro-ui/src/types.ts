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