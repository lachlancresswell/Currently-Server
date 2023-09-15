import React, { createContext, useContext, useEffect, useState } from 'react';
import { DistroData, Neighbour, PhaseData } from '../../../Types';
import { ClientOptions, InfluxDB, QueryApi } from '@influxdata/influxdb-client-browser'

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
}

/**
 * Context object that provides the data from the currently selected neighbour.
 */
export const NeighbourDataContext = createContext<NeighbourDataContextType>({
    neighbourData: null,
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

    const pollServer = async () => {
        const url = window.location.protocol + '//' + window.location.host + '/influx'
        const hostConfig: ClientOptions = {
            url,
            token,
        };

        const influxClient = new InfluxDB(hostConfig);
        const queryApi = influxClient.getQueryApi(org);

        const data = await pollInflux(queryApi, 'mybucket')
        setNeighbourData(data!);
    };

    useEffect(() => {
        let func: () => void;
        if (false) {
            func = pollServer;
        } else {
            func = () => {
                const data = mockPollServer
                setNeighbourData(data);
            }
        }
        const interval = setInterval(() => {
            func();
        }, 1000); // poll every 5 seconds
        return () => clearInterval(interval);
    }, [neighbour]);

    const value = {
        neighbourData,
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

    const query = `from(bucket: "modbus")
    |> range(start: -10s)
    |> filter(fn: (r) => r["_measurement"] == "cpu")
  |> filter(fn: (r) => r["_field"] == "usage_idle" or r["_field"] == "usage_nice" or r["_field"] == "usage_system" or r["_field"] == "usage_user")
  |> filter(fn: (r) => r["cpu"] == "cpu0" or r["cpu"] == "cpu1" or r["cpu"] == "cpu2" or r["cpu"] == "cpu-total" or r["cpu"] == "cpu3")
    |> yield(name: "mean")`;

    try {
        const data: influxRtn[] = await db.collectRows(query)
        console.log(data.find((d) => d._field === 'usage_user'))

        if (data && data.length) {
            const phaseData: DistroData = {
                time: new Date(data[0]._time),
                pf: parseInt(data.find((d) => d._field === 'usage_system')!._value.toFixed(0)),
                kva: parseInt(data.find((d) => d._field === 'usage_system')!._value.toFixed(0)),
                hz: parseInt(data.find((d) => d._field === 'usage_system')!._value.toFixed(0)),
                phases: [{
                    voltage: parseInt(data.find((d) => d._field === 'usage_user')!._value.toFixed(0)),
                    amperage: parseInt(data.find((d) => d._field === 'usage_idle')!._value.toFixed(0)),
                    phase: 1,
                }, {
                    voltage: parseInt(data.find((d) => d._field === 'usage_user')!._value.toFixed(0)),
                    amperage: parseInt(data.find((d) => d._field === 'usage_idle')!._value.toFixed(0)),
                    phase: 2,
                }, {
                    voltage: parseInt(data.find((d) => d._field === 'usage_user')!._value.toFixed(0)),
                    amperage: parseInt(data.find((d) => d._field === 'usage_idle')!._value.toFixed(0)),
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

const mockPollServer = (): DistroData => {
    const time = new Date()
    const pf = parseInt((Math.random() * (0.99 - 0.9) + 0.9).toFixed(0));
    const kva = parseInt((Math.random() * (100 - 50) + 50).toFixed(0));
    const hz = parseInt((Math.random() * (50.1 - 49.9) + 49.9).toFixed(0));
    const phases: PhaseData[] = [{
        voltage: parseInt((Math.random() * (230 - 220) + 220).toFixed(0)),
        amperage: parseInt((Math.random() * (100 - 50) + 50).toFixed(0)),
        phase: 1
    }, {
        voltage: parseInt((Math.random() * (230 - 220) + 220).toFixed(0)),
        amperage: parseInt((Math.random() * (100 - 50) + 50).toFixed(0)),
        phase: 2
    }, {
        voltage: parseInt((Math.random() * (230 - 220) + 220).toFixed(0)),
        amperage: parseInt((Math.random() * (100 - 50) + 50).toFixed(0)),
        phase: 3
    }]

    return {
        time,
        pf,
        kva,
        hz,
        phases
    };
}

export const mockPollRange = (): Phase[] => {
    let phases: Phase[] = [{ voltage: [], amperage: [] }, { voltage: [], amperage: [] }, { voltage: [], amperage: [] }];

    for (let i = 0; i < 50; i++) {
        const timeSecondsAgo = new Date(Date.now() - i * 1000);

        phases.forEach(phase => {
            phase.voltage.push({
                y: 220 + (Math.random() * 30),
                x: timeSecondsAgo
            })
            phase.amperage.push({
                y: 0 + (Math.random() * 5),
                x: timeSecondsAgo
            })
        })
    }

    return phases;
}
