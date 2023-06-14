import React, { useState, useEffect } from 'react';
import { InfluxDB, FluxTableMetaData } from '@influxdata/influxdb-client-browser';
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { mockPollRange, org, token } from '../Hooks/neighbourDataContext';
import TuneIcon from '@mui/icons-material/Tune';
import '../Styles/PageChart.css'
import { useConfigDataContext } from '../Hooks/configContext';
import { usePhaseColors } from '../Hooks/usePhaseColors';

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
    const { configData } = useConfigDataContext();

    const { l1Color, l2Color, l3Color } = usePhaseColors(); //{ l1Color: '#ff0000', l2Color: '#00ff00', l3Color: '#00f0ff' }

    const url = window.location.protocol + '//' + window.location.host + '/influx'
    useEffect(() => {
        const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

        setData(mockPollRange());
        setIsLoading(false);

        return;

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
                colors: [l1Color, l1Color, l2Color, l2Color, l3Color, l3Color],
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

    let [legendView, setLegendView] = useState<{ [index: string]: boolean }[]>([
        { voltage: true, current: true },
        { voltage: true, current: true },
        { voltage: true, current: true }
    ]);
    const handleHideClick = (phaseIndex: 1 | 2 | 3, category: "Voltage" | "Current") => {
        ApexCharts.exec("mychart", "hideSeries", [`L${phaseIndex} ${category}`]);
        legendView[phaseIndex - 1][category.toLowerCase()] = false;
        legendView = [...legendView];
        setLegendView(legendView);
    };
    const handleShowClick = (phaseIndex: 1 | 2 | 3, category: "Voltage" | "Current") => {
        ApexCharts.exec("mychart", "showSeries", [`L${phaseIndex} ${category}`]);
        legendView[phaseIndex - 1][category.toLowerCase()] = true;
        legendView = [...legendView];
        setLegendView(legendView);
    };
    const toggleLegendElement = (phaseIndex: 1 | 2 | 3, category: "Voltage" | "Current") => {
        if (legendView[phaseIndex - 1][category.toLowerCase()]) {
            handleHideClick(phaseIndex, category);
        } else {
            handleShowClick(phaseIndex, category);
        }
    }

    return (
        <>
            :
            <>
                <div style={{ height: "80%", width: "100%" }}>
                    <ReactApexChart type="line" options={options} series={configureData(data)} height={"100%"} />
                </div>
                <div className={`chart-buttons`}>
                    <div className='chart-button'>
                        +
                    </div>
                    <div className={`chart-button l1 ${legendView[1 - 1].voltage ? '' : 'strikethrough'}`} onClick={() => toggleLegendElement(1, "Voltage")}>
                        V
                    </div >
                    <div className={`chart-button l1 ${legendView[1 - 1].current ? '' : 'strikethrough'}`} onClick={() => toggleLegendElement(1, "Current")}>
                        A
                    </div>
                    <div className={`chart-button l2 ${legendView[2 - 1].voltage ? '' : 'strikethrough'}`} onClick={() => toggleLegendElement(2, "Voltage")}>
                        V
                    </div>
                    <div className={`chart-button l2 ${legendView[2 - 1].current ? '' : 'strikethrough'}`} onClick={() => toggleLegendElement(2, "Current")}>
                        A
                    </div>
                    <div className={`chart-button l3 ${legendView[3 - 1].voltage ? '' : 'strikethrough'}`} onClick={() => toggleLegendElement(3, "Voltage")}>
                        V
                    </div>
                    <div className={`chart-button l3 ${legendView[3 - 1].current ? '' : 'strikethrough'}`} onClick={() => toggleLegendElement(3, "Current")}>
                        A
                    </div>
                    <div className='chart-button'>
                        -
                    </div>
                    <div className='chart-button'>
                        <TuneIcon />
                    </div>
                </div>
            </>
        </>
    );
};

export default MyComponent;


const configureData = (data: Phase[] | undefined | null) => {
    if (!data || !data.length) {
        data = [{
            voltage: [{}],
            amperage: [{}]
        }, {
            voltage: [{}],
            amperage: [{}]
        }, {
            voltage: [{}],
            amperage: [{}]
        }] as any
    }
    return [
        {
            name: "L1 Voltage",
            data: data![0].voltage,
            type: 'line',
        },
        {
            name: "L1 Current",
            data: data![0].amperage,
            type: 'line',
        },
        {
            name: "L2 Voltage",
            data: data![1].voltage,
            type: 'line',
        },
        {
            name: "L2 Current",
            data: data![1].amperage,
            type: 'line',
        },
        {
            name: "L3 Voltage",
            data: data![2].voltage,
            type: 'line',
        },
        {
            name: "L3 Current",
            data: data![2].amperage,
            type: 'line',
        },
    ]
};
