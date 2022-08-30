import React, { useEffect, useState } from 'react';
import 'chartjs-adapter-moment';
import '../Styles/Page.css';
import * as Types from '../types'
import TuneIcon from '@mui/icons-material/Tune';
import * as Influx from '../Plugins/influx';
import { convertTimeToNanos } from '@influxdata/influxdb-client-browser'
import annotationPlugin from "chartjs-plugin-annotation";

import {
    Chart,
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    BubbleController,
    DoughnutController,
    LineController,
    PieController,
    PolarAreaController,
    RadarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip,
    SubTitle,
    Plugin,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Neighbour from '../Neighbour';

Chart.register(
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    BubbleController,
    DoughnutController,
    LineController,
    PieController,
    PolarAreaController,
    RadarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip,
    SubTitle,
);

Chart.register(annotationPlugin);

export const options: any = {
    // aspectRatio: 1.7,
    maintainAspectRatio: false,
    responsive: true,
    animation: {
        onComplete: (context: any) => {
            if (!context.initial) {
                const loader = document.getElementById('loader') as HTMLDivElement;
                if (loader) loader.style.display = 'none';
            }
        }
    },
    interaction: {
        intersect: false,
        axis: 'xy',
        mode: 'index',
    },
    plugins: {
        htmlLegend: {
            containerID: 'legend-container',
        },
        legend: {
            display: false,
        },
        title: {
            display: false,
        },
        decimation: {
            algorithm: 'min-max',
            enabled: true
        },
        annotation: {
            annotations: {
                line1: {
                    type: 'line',
                    xMin: 'Sat Jun 11 2022 18:41:30 GMT+1000 (Australian Eastern Standard Time)',
                    xMax: 'Sat Jun 11 2022 18:41:30 GMT+1000 (Australian Eastern Standard Time)',
                    label: {
                        enabled: true,
                        content: 'end value'
                    }
                }
            }
        }
    },
    scales: {
        x: {
            type: 'time',
            title: {
                display: false,
            },
            time: {
                stepSize: 5,
                // minUnit: 'minute'
            }
        },
        y: {
            min: 210,
            max: 310,
            type: 'linear',
            display: true,
            position: 'left',
            afterBuildTicks: (scale: any) => scale.ticks = scale.ticks.filter((t: { value: number }) => (t.value <= 250))
        },
        y1: {
            min: -10,
            max: 10.0,
            type: 'linear',
            display: true,
            position: 'right',
            afterBuildTicks: (scale: any) => scale.ticks = scale.ticks.filter((t: { value: number }) => (t.value >= -1)),
            // grid line settings
            grid: {
                drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
        },
    }
}


const configData = (data: any) => {
    return {
        datasets: [
            {
                label: "L1 Voltage",
                data: data ? data[0].voltage : {},
                borderColor: 'rgba(255, 0, 0, 1.0)',
                backgroundColor: 'rgba(255, 0, 0, 1.0)',
                yAxisID: 'y',
                pointRadius: 0,
                pointStyle: 'rectRot',
                pointBorderColor: 'rgb(255, 0, 0)',
                spanGaps: true
            },
            {
                label: "L1 Current",
                data: data ? data[0].amperage : {},
                borderColor: 'rgba(255, 0, 0, 1.0)',
                backgroundColor: 'rgba(255, 0, 0, 1.0)',
                yAxisID: 'y1',
                pointRadius: 0,
                pointStyle: 'rectRot',
                pointBorderColor: 'rgb(0, 255, 0)',
                spanGaps: true
            },
            {
                label: "L2 Voltage",
                data: data ? data[1].voltage : {},
                borderColor: 'rgba(255, 255, 255, 1.0)',
                backgroundColor: 'rgba(255, 255, 255, 1.0)',
                yAxisID: 'y',
                pointRadius: 0,
                pointStyle: 'rectRot',
                pointBorderColor: 'rgb(255, 0, 0)'
            },
            {
                label: "L2 Current",
                data: data ? data[1].amperage : {},
                borderColor: 'rgba(255, 255, 255, 1.0)',
                backgroundColor: 'rgba(255, 255, 255, 1.0)',
                yAxisID: 'y1',
                pointRadius: 0,
                pointStyle: 'rectRot',
                pointBorderColor: 'rgb(0, 255, 0)'
            },
            {
                label: "L3 Voltage",
                data: data ? data[2].voltage : {},
                borderColor: 'rgba(0, 0, 255, 1.0)',
                backgroundColor: 'rgba(0, 0, 255, 1.0)',
                yAxisID: 'y',
                pointRadius: 0,
                pointStyle: 'rectRot',
                pointBorderColor: 'rgb(255, 0, 0)'
            },
            {
                label: "L3 Current",
                data: data ? data[2].amperage : {},
                borderColor: 'rgba(0, 0, 255, 1.0)',
                backgroundColor: 'rgba(0, 0, 255, 1.0)',
                yAxisID: 'y1',
                pointRadius: 0,
                pointStyle: 'rectRot',
                pointBorderColor: 'rgb(0, 255, 0)'
            },
        ]
    }
};

const getOrCreateLegendList = (chart: any, id: string) => {
    const legendContainer = document.getElementById(id)!;
    let listContainer = legendContainer.querySelector('ul');

    if (!listContainer) {
        listContainer = document.createElement('ul');
        listContainer.style.display = 'flex';
        listContainer.style.flexDirection = 'row';
        listContainer.style.margin = '0';
        listContainer.style.padding = '0';

        legendContainer.appendChild(listContainer);
    }

    return listContainer;
};

const htmlLegendPlugin = {
    id: 'htmlLegend',
    afterUpdate(chart: any, args: any, options: any) {
        const ul = getOrCreateLegendList(chart, options.containerID);

        // Remove old legend items
        while (ul.firstChild) {
            ul.firstChild.remove();
        }

        // Reuse the built-in legendItems generator
        const items = chart.options.plugins.legend.labels.generateLabels(chart);

        items.forEach((item: any) => {
            // Text
            const textContainer = document.createElement('span');
            textContainer.style.color = item.hidden ? 'black' : item.fillStyle;
            textContainer.className = "roundedBox"

            let text = '';
            if (item.text.includes('Voltage')) text = 'V';
            else if (item.text.includes('Current')) text = 'A';

            textContainer.innerText = text;
            textContainer.style.textDecoration = item.hidden ? 'line-through' : '';

            textContainer.onclick = () => {
                const { type } = chart.config;
                chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
                chart.update();
            };

            ul.appendChild(textContainer);
        });
    }
};

const annotationPlug = (startDate: Date, endDate: Date): Plugin => {
    return {
        id: 'annotation',
        afterUpdate(chart: any, args: any, options: any) {

            for (var d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                d.setUTCHours(0, 0, 0, 0);
                options.annotations[d.toLocaleString()] = {
                    type: 'line',
                    xMin: d,
                    xMax: d,
                    label: {
                        enabled: true,
                        content: 'end value'
                    }
                }
            }
        },
    }
}

interface Phase {
    voltage: { y: number | string, x: Date }[]
    amperage: { y: number | string, x: Date }[]
}

export default function PageChart({ device }: { device: Neighbour }) {
    const loadValue = (name: string) => {
        const rtn = window.localStorage.getItem(name) || "";
        if (rtn === 'NaN') return "";
        return rtn;
    }

    const saveValue = (name: string, value: any) => localStorage.setItem(name, value)

    const savedStart = loadValue('startDate') && parseInt(loadValue('startDate'));
    let savedEnd = savedStart && loadValue('endDate') && parseInt(loadValue('endDate'));

    // Fix loaded end date if it is before the start
    if (savedStart && savedEnd && savedEnd < savedStart) savedEnd = savedStart + (300 * 60 * 1000)

    const start = (savedStart && new Date(savedStart)) || new Date();
    const end = (savedEnd && new Date(savedEnd)) || new Date((new Date()).getTime() - (300 * 60 * 1000));

    const [startDate, setStartDate] = useState<Date>(start);
    const [endDate, setEndDate] = useState<Date>(end);
    const [curPage, setCurPage] = useState(1);
    const [avgPeriod, setAvgPeriod] = useState(loadValue('avgPeriod') || '30s');
    const [scrollPeriod, setScrollPeriod] = useState(loadValue('scrollPeriod') || '5m');


    useEffect(() => {
        saveValue('startDate', startDate.getTime())
    }, [startDate])
    useEffect(() => { saveValue('endDate', endDate.getTime()) }, [endDate])
    useEffect(() => { saveValue('avgPeriod', avgPeriod) }, [avgPeriod])
    useEffect(() => { saveValue('scrollPeriod', scrollPeriod) }, [scrollPeriod])

    useEffect(() => {
        console.log(device, '- Has changed')
    }, [device])

    useEffect(() => {
    }, [endDate, startDate, device]);

    if (curPage === 2) {
        return <ChartConfig changePage={() => setCurPage(1)} startDate={{ value: startDate, set: setStartDate }} endDate={{ value: endDate, set: setEndDate }} avgPeriod={{ value: avgPeriod, set: setAvgPeriod }} scrollPeriod={{ value: scrollPeriod, set: setScrollPeriod }} />
    } else {
        return <ChartView chartConfig={() => {
            if (curPage === 1) setCurPage(2);
            else setCurPage(1);
        }} startDate={startDate} endDate={endDate} device={device} />
    }
}

interface hook<T> {
    value: T;
    set: (val: T) => void;
}

const toNanoDate = (date: Date) => convertTimeToNanos(String(date.valueOf()) + '000000');

function ChartConfig({ changePage, startDate, endDate, avgPeriod, scrollPeriod }: { changePage: () => void, startDate: hook<Date>, endDate: hook<Date>, avgPeriod: hook<string>, scrollPeriod: hook<string> }) {
    const getRange = (period: number) => {
        const start = new Date(startDate.value).getTime();
        const end = new Date(endDate.value).getTime();
        return ((end - start) === (period * 60 * 1000))
    }

    const setRange = (period: number) => {
        const now = new Date();
        var milliseconds = now.getTime();
        const start = new Date(milliseconds - (period * 60 * 1000))
        endDate.set(now);
        startDate.set(start);
    }

    const setAvg = (period: string) => avgPeriod.set(period)
    const getAvg = (period: string) => avgPeriod.value === period
    const setScroll = (period: string) => scrollPeriod.set(period);
    const getScroll = (period: string) => scrollPeriod.value === period;

    const setDateToNow = () => {
        const now = new Date();
        endDate.set(now)

        if (startDate.value.getTime() - now.getTime() > 0) startDate.set(new Date(now.getTime() - (5 * 60000)))
    }

    return <>
        <div>
            <h1>CONFIG</h1>

            <button onClick={changePage}>Back</button>
            <div>
                <label>Start</label>
                <div>
                    <input type="date" id="endDate" name="endDate" onChange={(e) => {
                        const d = e.target.value + ' ' + startDate.value.toISOString().substring(11);
                        startDate.set(new Date(d))
                    }} value={startDate.value.toISOString().substring(0, 10)} />
                    <input type="time" id="endTime" name="endTime" onChange={(e) => {
                        const d = startDate.value.toISOString().substring(0, 10) + 'T' + e.target.value + ':00.000Z'
                        startDate.set(new Date(d))
                    }} value={startDate.value.toISOString().substring(11, 16)} />
                </div>
                <label>End</label>
                <div>
                    <input type="date" id="endDate" name="endDate" onChange={(e) => {
                        const d = e.target.value + ' ' + endDate.value.toISOString().substring(11);
                        endDate.set(new Date(d))
                    }} value={endDate.value.toISOString().substring(0, 10)} />
                    <input type="time" id="endTime" name="endTime" onChange={(e) => {
                        const d = endDate.value.toISOString().substring(0, 10) + 'T' + e.target.value + ':00.000Z'
                        endDate.set(new Date(d))
                    }} value={endDate.value.toISOString().substring(11, 16)} />
                    <span className={`roundedBox`} onClick={() => setDateToNow()}>Now</span>
                </div>
                <div>
                    <label>Avg Period</label>
                    <span className="pageChartMenu">
                        <span className={`roundedBox ${getAvg('5s') ? 'selected' : ''}`} onClick={() => setAvg('5s')}>5s</span>
                        <span className={`roundedBox ${getAvg('30s') ? 'selected' : ''}`} onClick={() => setAvg('30s')}>30s</span>
                        <span className={`roundedBox ${getAvg('60s') ? 'selected' : ''}`} onClick={() => setAvg('60s')}>60s</span>
                    </span>
                </div>
            </div>

            <div>
                <label>Go To</label>
                <span className="pageChartMenu">
                    <span className={`roundedBox ${getRange(5) ? 'selected' : ''}`} onClick={() => setRange(5)}>-5m</span>
                    <span className={`roundedBox ${getRange(10) ? 'selected' : ''}`} onClick={() => setRange(10)}>-10m</span>
                    <span className={`roundedBox ${getRange(30) ? 'selected' : ''}`} onClick={() => setRange(30)}>-30m</span>
                    <span className={`roundedBox ${getRange(60) ? 'selected' : ''}`} onClick={() => setRange(60)}>-60m</span>
                </span>
            </div>

            <div>
                <label>Scroll Period (mins)</label>
                <span className="pageChartMenu" >
                    <span className={`roundedBox ${getScroll('1m') ? 'selected' : ''}`} onClick={() => setScroll('1m')}>1m</span>
                    <span className={`roundedBox ${getScroll('5m') ? 'selected' : ''}`} onClick={() => setScroll('5m')}>5m</span>
                    <span className={`roundedBox ${getScroll('10m') ? 'selected' : ''}`} onClick={() => setScroll('10m')}>10m</span>
                    <span className={`roundedBox ${getScroll('30m') ? 'selected' : ''}`} onClick={() => setScroll('30m')}>30m</span>
                    <span className={`roundedBox ${getScroll('60m') ? 'selected' : ''}`} onClick={() => setScroll('60m')}>60m</span>
                    <span className={`roundedBox ${getScroll('120m') ? 'selected' : ''}`} onClick={() => setScroll('120m')}>120m</span>
                </span>
            </div>
        </div>
    </>
}

function ChartView({ device, chartConfig, startDate, endDate }: { device: Neighbour, chartConfig: () => void, startDate: Date, endDate: Date }) {

    const [data, setData] = useState<Phase[] | undefined | null>(null);

    if (device && !data) {
        Influx.plugin.pollRange(device.db, startDate.toISOString(), endDate.toISOString()).then((json) => {
            setData(json)
        })
    }


    return (<>
        <div id="loader"></div>
        <div style={{ width: "90%", height: "65%" }} className="chart-container">
            <Line options={options} plugins={[htmlLegendPlugin, annotationPlug(startDate, endDate)]} data={configData(data)} />
        </div>
        <div className="pageRow2">
            <span className="pageChartMenu" id="legend-container">
                <span className='roundedBox'>+</span>
                <span className='roundedBox'>-</span>
                <span className='roundedBox' onClick={chartConfig}><TuneIcon /></span>
            </span>
        </div>
    </>);
}