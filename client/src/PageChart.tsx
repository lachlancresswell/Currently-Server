import React, { useState, useEffect } from 'react';
import { InfluxDB, FluxTableMetaData } from '@influxdata/influxdb-client-browser';
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { org, token } from './neighbourDataContext';
import { config } from 'process';

export interface RowRtn {
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


export interface Phase {
    voltage: { y: number | string | null, x: any }[]
    amperage: { y: number | string | null, x: any }[]
}

interface Props { }

const MyComponent: React.FC<Props> = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<Phase[]>([]);
    const [options, setOptions] = useState<ApexOptions>({})

    const url = window.location.protocol + '//' + window.location.host + '/influx'
    useEffect(() => {
        const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

        const query = `
        from(bucket: "modbus")
        |> range(start: -10s)
        |> filter(fn: (r) => r["_measurement"] == "cpu")
        |> filter(fn: (r) => r["_field"] == "usage_idle" or r["_field"] == "usage_nice" or r["_field"] == "usage_system" or r["_field"] == "usage_user")
      |> filter(fn: (r) => r["cpu"] == "cpu0" or r["cpu"] == "cpu1" or r["cpu"] == "cpu2" or r["cpu"] == "cpu-total" or r["cpu"] == "cpu3")
        |> yield(name: "mean")
    `;

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

        queryApi.collectRows<RowRtn>(query).then((result) => {

            result!.forEach((row) => {
                switch (row._field) {
                    case 'usage_user':
                        phases[0].amperage.push({ y: row._value, x: new Date(row._time) })
                        phases[1].amperage.push({ y: row._value, x: new Date(row._time) })
                        phases[2].amperage.push({ y: row._value, x: new Date(row._time) })
                        break;
                    case 'usage_system':
                        phases[0].voltage.push({ y: row._value, x: row._time })
                        phases[1].voltage.push({ y: row._value, x: row._time })
                        phases[2].voltage.push({ y: row._value, x: row._time })
                        break;
                }
            });

            setData(phases);
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        if (!isLoading) {
            const options: ApexOptions = {
                chart: {
                    id: "mychart",
                    foreColor: 'white',
                    // group: 'social',
                    type: "area",
                    animations: {
                        enabled: false
                    },
                    toolbar: {
                        autoSelected: 'pan',
                        show: false
                    }
                }, noData: {
                    text: 'Loading...'
                },
                colors: ['#FF0000', '#FFFFFF', '#0000FF'],
                fill: {
                },
                legend: {
                    show: false
                },
                markers: {
                    size: 0,
                    colors: ['#7777ff'],
                    showNullDataPoints: false,
                },
                xaxis: {
                    labels: {
                        formatter: function (value, timestamp) {
                            const d = new Date(value as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            return d
                        },
                        style: {
                            fontSize: '1em' // specify the font size here
                        },
                    },
                    tickAmount: 3
                },
                yaxis: [
                    {
                        seriesName: 'Voltage',
                        min: 230,
                        max: 250,
                        tickAmount: 3,
                        decimalsInFloat: 0,
                        labels: {
                            style: {
                                fontSize: '1.5em' // specify the font size here
                            },
                            formatter: (value) => value.toFixed() + 'V'
                        },
                    }, {
                        seriesName: 'Current',
                        opposite: true,
                        labels: {
                            style: {
                                fontSize: '1.5em', // specify the font size here
                            },
                            formatter: (value) => value.toFixed() + 'A'
                        },
                        min: 0,
                        max: 10,
                        tickAmount: 3,
                        decimalsInFloat: 0,
                    }, {
                        seriesName: 'Voltage',
                        show: false
                    }, {
                        seriesName: 'Current',
                        show: false
                    }, {
                        seriesName: 'Voltage',
                        show: false
                    }, {
                        seriesName: 'Current',
                        show: false
                    }
                ]
            };
            setOptions(options)
        }
    }, [isLoading, data]);

    return (
        <>
            {isLoading ? <div>Loading...</div>
                : <div style={{ height: "100%", width: "100%" }}>
                    <ReactApexChart type="line" options={options} series={configData(data)} height={"90%"} />
                </div>}
        </>
    );
};

export default MyComponent;


const configData = (data: Phase[] | undefined | null) => {
    return [
        {
            name: "L1 Voltage",
            data: data ? data[0].voltage : [],
            type: 'line',
        },
        {
            name: "L1 Current",
            data: data ? data[0].amperage : [],
            type: 'line',
        },
        {
            name: "L2 Voltage",
            data: data ? data[1].voltage : [],
            type: 'line',
        },
        {
            name: "L2 Current",
            data: data ? data[1].amperage : [],
            type: 'line',
        },
        {
            name: "L3 Voltage",
            data: data ? data[2].voltage : [],
            type: 'line',
        },
        {
            name: "L3 Current",
            data: data ? data[2].amperage : [],
            type: 'line',
        },
    ]
};
