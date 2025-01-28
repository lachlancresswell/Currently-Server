import React, { createContext, useContext, useEffect, useState } from 'react';
import { DistroData, Neighbour, PhaseData } from '../../../Types';
import { ClientOptions, InfluxDB, QueryApi } from '@influxdata/influxdb-client-browser'
import { connect } from 'simpleiot-js';

interface Point {
    type: string;
    value: number | string;
    time: string;
    text: string;
    key: string;
    origin: string;
}

interface Manifest {
    type: string;
    key: string;
    event?: (i: Point[]) => unknown;
}

interface Node {
    id: string;
    type: string;
    hash: string;
    parent: string;
    origin?: string;
    pointsList: Point[];
}

interface Message {
    nodeID: string;
    parentID: string | undefined;
    points: Point[];
    subject: string;
}

const appendData = (point: Point, prevData: DistroData) => {
    const newData: DistroData = prevData ? { ...prevData } : {
        time: new Date(),
        hz: -1,
        pf: -1,
        kva: -1,
        phases: [{
            voltage: -1,
            amperage: -1,
            phase: 1,
        }, {
            voltage: -1,
            amperage: -1,
            phase: 2,
        }, {
            voltage: -1,
            amperage: -1,
            phase: 3,
        }]
    };

    let phase = 0;

    switch (point.type) {
        case 'L1':
            phase = 0;
            break;
        case 'L2':
            phase = 1;
            break;
        case 'L3':
            phase = 2;
            break;
    }

    switch (point.key) {
        case 'voltage':
            newData.phases[phase].voltage = point.value as number;
            break;
        case 'amperage':
            newData.phases[phase].amperage = point.value as number;
            break;
        case 'frequency':
            newData.hz = point.value as number;
            break;
        case 'power-factor':
            newData.pf = point.value as number;
            break
        case 'kva':
            newData.kva = point.value as number;
    }

    return newData;
}

const appendToHistory = (point: Point, prevHistory: Phase[]) => {
    const newHistory: Phase[] = [
        ...prevHistory
    ];

    let phase = 0;

    switch (point.type) {
        case 'L1':
            phase = 0;
            break;
        case 'L2':
            phase = 1;
            break;
        case 'L3':
            phase = 2;
            break;
    }
    const val = {
        y: point.value,
        x: new Date()
    }
    if (point.key === 'voltage') {
        newHistory[phase].voltage.push(val)
    }
    if (point.key === 'amperage') {
        newHistory[phase].amperage.push(val)
    }

    return newHistory;
}

const filterPointsByManifest = async (
    nc: any,
    manifest: Manifest[],
    parentType?: string
): Promise<Point[]> => {
    const allNodes: Node[] = (
        (await nc.getNodeChildren("root", { recursive: "flat" })) as Node[]
    ).filter((n) => n.type === parentType || true);

    return allNodes
        .map((n) =>
            n.pointsList.filter((p) =>
                manifest.find((item) => {
                    if (item.type === p.type) {
                        if (item.event && p.origin) {
                            (async () => {
                                for await (const point of nc.subscribePoints(p.origin)) {
                                    const m = point as Message;
                                    if (item.event) item.event(m.points);
                                }
                            })();
                        }
                        return true;
                    }
                    return false;
                })
            )
        )
        .filter((n) => n.length)
        .flat();
};

interface FluxQuery {
    result: string;
    _start: string;
    _stop: string,
    _time: string,
    _field: string,
    _measurement: string,
    _value: string | number,
    host: string,
    name: string,
    table: number,
    type: string,
}

export interface Phase {
    voltage: { y: number | string | null, x: Date }[]
    amperage: { y: number | string | null, x: Date }[]
}

/**
 * Interface for the neighbour data context object.
 */
export interface NeighbourDataContextType {
    neighbourData: DistroData | null;
    history: Phase[];
}

const BLANK_HISTORY = [{
    voltage: [],
    amperage: []
}, {
    voltage: [],
    amperage: []
},
{
    voltage: [],
    amperage: []
}]

/**
 * Context object that provides the data from the currently selected neighbour.
 */
export const NeighbourDataContext = createContext<NeighbourDataContextType>({
    neighbourData: null,
    history: [...BLANK_HISTORY],
});

interface props {
    neighbour: Neighbour
    children: React.ReactNode;
}

export const token = `EoENRkYCQuPJaPKtwM2D9sqle14ocDcPufGuncmfhEa4uK8PogPuC87dk8zJ9sPm6yzncZj2xToYxZ2dj37yAg==`
export const org = `onestage`;

/**
 * React component that provides the neighbour data context object.
 */
export const NeighbourDataProvider: React.FC<props> = ({ neighbour, children }) => {
    const [neighbourData, setNeighbourData] = useState<DistroData | null>(null);
    const [history, setHistory] = useState<Phase[]>([...BLANK_HISTORY]);

    const distroValues: Manifest[] = [
        {
            type: "distro",
            key: "frequency",
            event: (points) => {
                setNeighbourData((prevData) => appendData(points[0], prevData!))
                setHistory((prevHistory) => appendToHistory(points[0], prevHistory))
            },
        },
        {
            type: "distro",
            key: "kva",
            event: (points) => {
                setNeighbourData((prevData) => appendData(points[0], prevData!))
                setHistory((prevHistory) => appendToHistory(points[0], prevHistory))
            },
        },
        {
            type: "distro",
            key: "power-factor",
            event: (points) => {
                setNeighbourData((prevData) => appendData(points[0], prevData!))
                setHistory((prevHistory) => appendToHistory(points[0], prevHistory))
            },
        },
        {
            type: "L1",
            key: "voltage",
            event: (points) => {
                setNeighbourData((prevData) => appendData(points[0], prevData!))
                setHistory((prevHistory) => appendToHistory(points[0], prevHistory))
            },
        },
        {
            type: "L1",
            key: "amperage",
            event: (points) => {
                setNeighbourData((prevData) => appendData(points[0], prevData!))
                setHistory((prevHistory) => appendToHistory(points[0], prevHistory))
            },
        },
        {
            type: "L2",
            key: "voltage",
            event: (points) => {
                setNeighbourData((prevData) => appendData(points[0], prevData!))
                setHistory((prevHistory) => appendToHistory(points[0], prevHistory))
            },
        },
        {
            type: "L2",
            key: "amperage",
            event: (points) => {
                setNeighbourData((prevData) => appendData(points[0], prevData!))
                setHistory((prevHistory) => appendToHistory(points[0], prevHistory))
            },
        },
        {
            type: "L3",
            key: "voltage",
            event: (points) => {
                setNeighbourData((prevData) => appendData(points[0], prevData!))
                setHistory((prevHistory) => appendToHistory(points[0], prevHistory))
            },
        },
        {
            type: "L3",
            key: "amperage",
            event: (points) => {
                setNeighbourData((prevData) => appendData(points[0], prevData!))
                setHistory((prevHistory) => appendToHistory(points[0], prevHistory))
            },
        },
    ];


    useEffect(() => { connect({ servers: [`ws://${window.location.host.split(":")[0]}:9222`] }).then((newNc: unknown) => filterPointsByManifest(newNc, distroValues)) }, [neighbour]);

    const value = {
        neighbourData,
        history
    };

    return <NeighbourDataContext.Provider value={value}>{children}</NeighbourDataContext.Provider>;
};

/**
 * Hook for accessing the neighbour data context object.
 */
export const useNeighbourDataContext = () => useContext(NeighbourDataContext);

export interface influxRtn {
    _field: string,
    _measurement: string,
    _start: string,
    _stop: string,
    _time: string,
    _value: number,
    host: string,
    name: string,
    result: string,
    table: number,
    type: string,
}

export const pollInflux = async (db: QueryApi, bucket: string) => {

    const query = `from(bucket: "mybucket")
    |> range(start: -60s)
    |> filter(fn: (r) => r["_measurement"] == "mock")
    |> filter(fn: (r) => r["_field"] == "Grid Frequency" 
                      or r["_field"] == "Power Factor"
                      or r["_field"] == "Total Active Energy"
                      or r["_field"] == "L1 Voltage"
                      or r["_field"] == "L2 Voltage"
                      or r["_field"] == "L3 Voltage"
                      or r["_field"] == "L1 Current"
                      or r["_field"] == "L2 Current"
                      or r["_field"] == "L3 Current"
                      )
    |> last()`;

    try {
        const data: influxRtn[] = await db.collectRows(query)
        console.log(data.find((d) => d._field === 'usage_user'))

        if (data && data.length) {
            const phaseData: DistroData = {
                time: new Date(data[0]._time),
                pf: parseInt(data.find((d) => d._field === 'Power Factor')!._value.toFixed(0)),
                kva: parseInt(data.find((d) => d._field === 'Total Active Energy')!._value.toFixed(0)),
                hz: parseInt(data.find((d) => d._field === 'Grid Frequency')!._value.toFixed(0)),
                phases: [{
                    voltage: parseInt(data.find((d) => d._field === 'L1 Voltage')!._value.toFixed(0)),
                    amperage: parseInt(data.find((d) => d._field === 'L1 Current')!._value.toFixed(0)),
                    phase: 1,
                }, {
                    voltage: parseInt(data.find((d) => d._field === 'L2 Voltage')!._value.toFixed(0)),
                    amperage: parseInt(data.find((d) => d._field === 'L2 Current')!._value.toFixed(0)),
                    phase: 2,
                }, {
                    voltage: parseInt(data.find((d) => d._field === 'L3 Voltage')!._value.toFixed(0)),
                    amperage: parseInt(data.find((d) => d._field === 'L3 Current')!._value.toFixed(0)),
                    phase: 3,
                }]
            }
            return phaseData
        }

    } catch (e) {
        console.error(e)
    }

    return undefined;

};

export const pollRange = async (db: QueryApi, start: string, end: string = 'now()', avg = '30s') => {
    const query = `from(bucket: "modbus")
    |> range(start: -10s)
    |> filter(fn: (r) => r["_measurement"] == "cpu")
    |> filter(fn: (r) => r["_field"] == "usage_idle" or r["_field"] == "usage_nice" or r["_field"] == "usage_system" or r["_field"] == "usage_user")
  |> filter(fn: (r) => r["cpu"] == "cpu0" or r["cpu"] == "cpu1" or r["cpu"] == "cpu2" or r["cpu"] == "cpu-total" or r["cpu"] == "cpu3")
    |> yield(name: "mean")`;

    let data: FluxQuery[];
    try {
        data = await db.collectRows(query);

    } catch (e) {
        debugger
    }

    const annotationQuery = `
    from(bucket: "mybucket")
    |> range(start: ${start}, stop: ${end})
    |> filter(fn: (r) => r["_measurement"] == "annotation-orange" or r["_measurement"] == "annotation-yellow" or r["_measurement"] == "annotation-purple" or r["_measurement"] == "annotation-green")`;


    let phases: Phase[] = [{
        voltage: [],
        amperage: [],
    }, {
        voltage: [],
        amperage: [],
    }, {
        voltage: [],
        amperage: [],
    }];

    data!.forEach((row) => {
        switch (row._field) {
            case 'usage_user':
                phases[0].amperage.push({ y: row._value, x: new Date(row._time) })
                phases[1].amperage.push({ y: row._value, x: new Date(row._time) })
                phases[2].amperage.push({ y: row._value, x: new Date(row._time) })
                break;
            case 'usage_system':
                phases[0].voltage.push({ y: row._value, x: new Date(row._time) })
                phases[1].voltage.push({ y: row._value, x: new Date(row._time) })
                phases[2].voltage.push({ y: row._value, x: new Date(row._time) })
                break;
        }
    });

    let indexes: number[] = [];

    phases[0].amperage.forEach((item, i, arr) => {
        if (i) {
            const lastItem = arr[i - 1];
            const lel = item.x.getTime() / 1000
            const lol = lastItem.x.getTime() / 1000
            if (lel - lol > 120) {
                indexes.push(i)
            }
        }
    })

    phases.forEach((phase) => nullPadding(phase, new Date(start), new Date(end)))

    return { phases };
}


/**
 * Create null entries in array between measurements with more than 120seconds between them. Also creates null entries at the start and end dates to
 * ensure plot is not cropped to entered data
 * @param phase phase object
 * @param start start date of range
 * @param end end date of range
 */
export const nullPadding = (phase: Phase, start: Date, end: Date) => {

    let i = phase.amperage.length - 1;

    for (; i > 0; i -= 1) {
        const dateLate = phase.amperage[i].x.getTime() / 1000
        const dateEarly = phase.amperage[i - 1].x.getTime() / 1000
        const delta = dateLate - dateEarly;


        if (delta > 120) {
            const item = {
                x: new Date((dateEarly + 60) * 1000),
                y: null,
            }

            phase.amperage.splice(i, 0, item);
            phase.voltage.splice(i, 0, item);
        }
    }

    const startItem = {
        x: new Date((start.getTime() - 1000)),
        y: null,
    }

    const endItem = {
        x: new Date((end.getTime() + 1000)),
        y: null,
    }
    phase.amperage.splice(0, 0, startItem);
    phase.amperage.splice(phase.amperage.length - 1, 0, endItem);
    phase.voltage.splice(0, 0, startItem);
    phase.voltage.splice(phase.voltage.length - 1, 0, endItem);
}