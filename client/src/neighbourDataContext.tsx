import React, { createContext, useContext, useEffect, useState } from 'react';
import { DistroData, Neighbour } from './../../Types';
import { ClientOptions, InfluxDB, QueryApi } from '@influxdata/influxdb-client-browser'


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

const url = `http://localhost:3000/influx`
const token = `EoENRkYCQuPJaPKtwM2D9sqle14ocDcPufGuncmfhEa4uK8PogPuC87dk8zJ9sPm6yzncZj2xToYxZ2dj37yAg==`
const org = `onestage`;

/**
 * React component that provides the neighbour data context object.
 */
export const NeighbourDataProvider: React.FC<props> = ({ neighbour, children }) => {
    const [neighbourData, setNeighbourData] = useState<DistroData | null>(null);

    const pollServer = async () => {
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
        pollServer();
        const interval = setInterval(() => {
            pollServer();
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

const pollInflux = async (db: QueryApi, bucket: string) => {

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