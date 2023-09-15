import React, { useState, useEffect } from 'react';
import { InfluxDB } from '@influxdata/influxdb-client-browser';
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { mockPollRange, org, token } from '../Hooks/neighbourDataContext';
import TuneIcon from '@mui/icons-material/Tune';
import '../Styles/PageChart.css'
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

const legendStartState = [
    { voltage: true, current: true },
    { voltage: true, current: true },
    { voltage: true, current: true }
]

/**
 * Tests a URL to ensure it is accessible
 * @param host url to test
 * @returns resolves on success
 */
const testUrl = (host: string) => new Promise((res, rej) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {

            if (!(this.status >= 200 && this.status <= 299)) {
                return rej(`Cannot reach ${host}`);
            }

            return res('Success');
        }
    };
    xhttp.open("GET", host, true)
    xhttp.send();
});


export interface Phase {
    voltage: { y: number | string | null, x: any }[]
    amperage: { y: number | string | null, x: any }[]
}

interface Props { }

const collectData = async (hostUrl: string, databaseUrl: string) => {
    await testUrl(hostUrl);
    await testUrl(databaseUrl)


    const db = new InfluxDB({ url: databaseUrl, token, timeout: 5000 });
    const queryApi = db.getQueryApi(org);

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

    const query = `
        from(bucket: "modbus")
        |> range(start: -10s)
        |> filter(fn: (r) => r["_measurement"] == "cpu")
        |> filter(fn: (r) => r["_field"] == "usage_idle" or r["_field"] == "usage_nice" or r["_field"] == "usage_system" or r["_field"] == "usage_user")
      |> filter(fn: (r) => r["cpu"] == "cpu0" or r["cpu"] == "cpu1" or r["cpu"] == "cpu2" or r["cpu"] == "cpu-total" or r["cpu"] == "cpu3")
        |> yield(name: "mean")
    `;

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

    });

    return phases;
}

const initialOptions = (l1Color: string, l2Color: string, l3Color: string) => {
    const yaxisV = {
        showAlways: true,
        seriesName: 'Voltage',
        min: 180,
        max: 250,
        tickAmount: 4,
        labels: {
            style: {
                fontSize: '1em',
            },
            formatter: (value: any) => (value >= 200) ? value.toFixed(value % 1 != 0 ? 1 : 0) + 'V' : undefined
        },
    }

    const yaxisC = {
        showAlways: true,
        seriesName: 'Current',
        opposite: true,
        labels: {
            style: {
                fontSize: '1em',
            },
            formatter: (value: any) => (value <= 10) ? value.toFixed(value % 1 != 0 ? 1 : 0) + 'A' : undefined
        },
        min: 0,
        max: 20,
        tickAmount: 3,
        forceNiceScale: true
    }

    return ({
        chart: {
            id: "mychart",
            foreColor: 'white',
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
                formatter: function (value: any, timestamp: any) {
                    const d = new Date(value as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    return d
                },
                style: {
                    fontSize: '1em' // specify the font size here
                },
            },
            tickAmount: 4,
        },
        yaxis: [
            // Phase 1
            yaxisV, yaxisC,
            // Phase 2 - hide axis labels to prevent duplicates
            { ...yaxisV, ...{ show: false } }, { ...yaxisC, ...{ show: false } },
            // Phase 3 - hide axis labels to prevent duplicates
            { ...yaxisV, ...{ show: false } }, { ...yaxisC, ...{ show: false } }
        ]
    } as ApexOptions)
}

const MyComponent: React.FC<Props> = () => {
    const [plotData, setPlotData] = useState<Phase[]>([]);

    // Load phase colours
    const { l1Color, l2Color, l3Color } = usePhaseColors();

    // Plot configuration options
    const [options, setOptions] = useState<ApexOptions>(initialOptions(l1Color, l2Color, l3Color))

    useEffect(() => {
        const hostUrl = window.location.protocol + '//' + window.location.host;
        const databaseUrl = hostUrl + '/influx'
        collectData(hostUrl, databaseUrl).then((res) => {
            setPlotData(res)
        }, (text) => {
            setPlotData(mockPollRange())
            // setOptions({ ...options, noData: { text } })
        })
    }, []);

    let [legendView, setLegendView] = useState<{ [index: string]: boolean }[]>(legendStartState);

    const toggleLegendElement = (phaseIndex: 1 | 2 | 3, category: "Voltage" | "Current") => {
        const hide = !!legendView[phaseIndex - 1][category.toLowerCase()];

        ApexCharts.exec("mychart", hide ? "hideSeries" : "showSeries", [`L${phaseIndex} ${category}`]);
        legendView[phaseIndex - 1][category.toLowerCase()] = false;
        legendView = [...legendView];
        setLegendView(legendView);
    }

    const configuredData = configureData(plotData);
    return (
        <>
            <div style={{ height: "72%", width: "100%" }}>
                <ReactApexChart type="line" options={options} series={configuredData} height={"100%"} />
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
