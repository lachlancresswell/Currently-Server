import React, { useEffect, useRef, useState } from 'react';
import 'chartjs-adapter-moment';
import '../Styles/Page.css';
import TuneIcon from '@mui/icons-material/Tune';
import CommentIcon from '@mui/icons-material/Comment';
import * as Types from '../types'
import * as Influx from '../Plugins/influx';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import * as Dates from '../Dates'

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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Neighbour from '../Neighbour';
import { NavLink, Route } from 'react-router-dom';
import { Type } from 'typescript';

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

Chart.register(zoomPlugin);
Chart.register(annotationPlugin);

export const options: any = {
    // aspectRatio: 1.7,
    spanGaps: 1000 * 60,
    maintainAspectRatio: false,
    responsive: true,
    animation: false,
    // {
    // onComplete: (context: any) => {
    //     if (!context.initial) {
    //         const loader = document.getElementById('loader') as HTMLDivElement;
    //         if (loader) loader.style.display = 'none';
    //     }
    // }
    // },
    interaction: {
        intersect: false,
        axis: 'xy',
        mode: 'index',
    },
    plugins: {
        annotation: {
            annotations: {

            }
        },
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
        zoom: {
            mode: 'xy',
            limits: {
                x: { min: 'original', max: 'original' }
            },
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
    const loader = document.getElementById('loader') as HTMLDivElement;
    if (loader) loader.style.display = 'none';
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
                chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
                chart.update();
            };

            ul.appendChild(textContainer);
        });
    }
};


interface Phase {
    voltage: { y: number | string, x: Date }[]
    amperage: { y: number | string, x: Date }[]
}

type AvgPeriod = '1s' | '5s' | '30s' | '60s';

const loadValue = (name: string) => {
    const rtn = window.localStorage.getItem(name) || "";
    if (rtn === 'NaN') return "";
    return rtn;
}

const saveValue = (name: string, value: any) => localStorage.setItem(name, value)

export default function PageChart({ device }: { device: Neighbour }) {

    const { start, end } = Dates.GetDates();

    const [startDate, setStartDate] = useState<Date>(start);
    const [endDate, setEndDate] = useState<Date>(end);
    const [curPage, setCurPage] = useState(1);
    const [avgPeriod, setAvgPeriod] = useState<AvgPeriod>(loadValue('avgPeriod') as AvgPeriod || '30s');
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
        }} startDate={startDate} endDate={endDate} device={device} avgPeriod={avgPeriod} />
    }
}

interface hook<T> {
    value: T;
    set: (val: T) => void;
}

const ChartConfig = React.memo(function ChartConfig({ changePage, startDate, endDate, avgPeriod, scrollPeriod }: { changePage: () => void, startDate: hook<Date>, endDate: hook<Date>, avgPeriod: hook<AvgPeriod>, scrollPeriod: hook<string> }) {
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

    const setAvg = (period: AvgPeriod) => avgPeriod.set(period)
    const getAvg = (period: AvgPeriod) => avgPeriod.value === period
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
                <div className={`datePicker`}>
                    <input required type="date" id="endDate" name="endDate" onChange={(e) => {
                        const d = e.target.value + ' ' + startDate.value.toISOString().substring(11);
                        startDate.set(new Date(d))
                    }} value={startDate.value.toISOString().substring(0, 10)} />
                    <input required type="time" id="endTime" name="endTime" onChange={(e) => {
                        const d = startDate.value.toISOString().substring(0, 10) + 'T' + e.target.value + ':00.000Z'
                        startDate.set(new Date(d))
                    }} value={startDate.value.toString().substring(16, 21)} />
                </div>
                <label>End</label>
                <div className={`datePicker`}>
                    <input required type="date" id="endDate" name="endDate" onChange={(e) => {
                        const d = e.target.value + ' ' + endDate.value.toISOString().substring(11);
                        endDate.set(new Date(d))
                    }} value={endDate.value.toISOString().substring(0, 10)} />
                    <input required type="time" id="endTime" name="endTime" onChange={(e) => {
                        const d = endDate.value.toISOString().substring(0, 10) + 'T' + e.target.value + ':00.000Z'
                        endDate.set(new Date(d))
                    }} value={endDate.value.toString().substring(16, 21)} />
                    <span className={`roundedBox`} onClick={() => setDateToNow()}>Now</span>
                </div>
                <div>
                    <label>Avg Period</label>
                    <span className="pageChartMenu">
                        <span className={`roundedBox ${getAvg('1s') ? 'selected' : ''}`} onClick={() => setAvg('1s')}>1s</span>
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
        </div>
    </>
});

function ChartView({ device, chartConfig, startDate, endDate, avgPeriod }: { device: Neighbour, chartConfig: () => void, startDate: Date, endDate: Date, avgPeriod: AvgPeriod }) {
    const chartRef: any = useRef(null)
    const zoom = chartRef && chartRef!.current && chartRef!.current!.getZoomLevel() || 0

    const delta = endDate.valueOf() - startDate.valueOf();
    const [min, setMin] = useState(0);
    const [max, setMax] = useState((zoom * 2) * 10);


    const [data, setData] = useState<{
        phases: Phase[], annotations: {
            y: string;
            x: Date;
            color: string;
        }[]
    } | undefined | null>(null);
    const [scrubValue, setScrubValue] = useState(min + (delta / 2));

    if (device && !data) {
        Influx.plugin.pollRange(device.db, startDate.toISOString(), endDate.toISOString(), avgPeriod).then((json) => {
            setData({ phases: json.phases, annotations: json.annotations })
        })
    }

    let loader = true;
    if (data && data.phases.find(phase => phase.voltage.length === 0 && phase.amperage.length === 0)) loader = false;

    if (data && data.annotations && data.annotations.length) {
        data.annotations.forEach((a, i) => {
            const annotation = {
                type: 'line',
                borderColor: a.color,
                borderWidth: 5,
                scaleID: 'x',
                value: a.x,
                label: {
                    rotation: 'auto',
                    content: a.y,
                    display: true
                },
            };

            options.plugins.annotation.annotations[i] = annotation;
        });
    } else {
        // if (options.plugins.annotation.annotations) options.plugins.annotation.annotations = [];
        options.plugins.annotation.annotations = {};
    }

    const chartZoom = (val: { x: number, y: number }) => {
        const prevZoom = chartRef!.current!.getZoomLevel();
        chartRef!.current!.zoom(val)
        const newZoom = (val.x % 1) + prevZoom;
        const decimal = parseFloat((newZoom % 1).toFixed(2));

        setMax(decimal * 100);
    }

    const chartScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
        const prevVal = scrubValue;
        const val = parseFloat(e.target.value);
        const delta = (prevVal - val) * 11;
        chartRef!.current!.pan({ x: delta, y: 0 })

        setScrubValue(val);
    }

    const phases = data?.phases;

    return (<>
        <Route exact path={'/chart'}>

            {loader && <div id="loader"></div>}
            {data && data.phases.find(phase => phase.voltage.length === 0 && phase.amperage.length === 0) && <div id="chart-notify">No data in period {startDate.toLocaleString()} to {endDate.toLocaleString()}</div>}
            <div style={{ width: "90%", height: "65%" }} className="chart-container">
                <Line ref={chartRef} options={options} plugins={[htmlLegendPlugin]} data={configData(phases)} />
            </div>
            <input onChange={chartScrub} className=" PlotScroller" type="range" step="0.25" min={min} max={max} value={scrubValue} />
            <div className="pageRow2">
                <span className="pageChartMenu" id="legend-container">
                    <span className='roundedBox' onClick={() => chartZoom({ x: 1.1, y: 1 })}>+</span>
                    <span className='roundedBox' onClick={() => chartZoom({ x: -1.01, y: 1 })}>-</span>
                    <span className='roundedBox' onClick={chartConfig}><TuneIcon /></span>
                    <span className='roundedBox'>
                        <NavLink to={`/chart/annotation`}>
                            <CommentIcon />
                        </NavLink>
                    </span>
                </span>
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'center'
            }}>
            </div>
        </Route >
        <Route path={'/chart/annotation'}>
            <ChartAnnotation device={device} />
        </Route>
    </>);
}

const ChartAnnotation = ({ device }: { device: Neighbour }) => {

    const [period, setPeriod] = useState(0);
    const [annType, setAnnType] = useState<Types.AnnotationColor | undefined>();

    const [annotations, setAnnotaions] = useState<{
        y: string;
        x: Date;
        color: string;
    }[]>();

    if (!annotations) device.influx.getAnnotations().then(setAnnotaions);

    const annotationIsActive = (color: Types.AnnotationColor) => annotations?.find((a) => a.color === color)

    const nowLessMins = (period: number) => {
        const now = new Date();
        var milliseconds = now.getTime();
        return new Date(milliseconds - (period * 60 * 1000))
    }

    const addAnnotation = async () => {
        if (annType) await device.influx.createAnnotion(annType, nowLessMins(period));
    }

    const delAnn = async (color: Types.AnnotationColor) => await device.influx.deleteAnnotation(color);

    return (<>
        <div>
            <h1>CONFIG</h1>

            <NavLink to={`/chart`}>
                Back
            </NavLink>

            <div>
                <label>Go To</label>
                <span className="pageChartMenu">
                    <span className={`roundedBox ${period === 0 ? 'selected' : ''} `} onClick={() => setPeriod(0)}>NOW</span>
                    <span className={`roundedBox ${period === 1 ? 'selected' : ''} `} onClick={() => setPeriod(1)}>-1m</span>
                    <span className={`roundedBox ${period === 2 ? 'selected' : ''} `} onClick={() => setPeriod(2)}>-2m</span>
                    <span className={`roundedBox ${period === 5 ? 'selected' : ''} `} onClick={() => setPeriod(5)}>-5m</span>
                    <span className={`roundedBox ${period === 10 ? 'selected' : ''} `} onClick={() => setPeriod(10)}>-10m</span>
                    <span className={`roundedBox ${period === 30 ? 'selected' : ''} `} onClick={() => setPeriod(30)}>-30m</span>
                    <span className={`roundedBox ${period === 60 ? 'selected' : ''} `} onClick={() => setPeriod(60)}>-60m</span>
                </span>
                <span className="pageChartMenu">
                    <span className={`roundedBox yellow ${annType === 'yellow' ? 'active' : 'inactive'}`} onClick={() => setAnnType('yellow')}>.</span>
                    <span className={`roundedBox purple ${annType === 'purple' ? 'active' : 'inactive'}`} onClick={() => setAnnType('purple')}>.</span>
                    <span className={`roundedBox green ${annType === 'green' ? 'active' : 'inactive'}`} onClick={() => setAnnType('green')}>.</span>
                    <span className={`roundedBox orange ${annType === 'orange' ? 'active' : 'inactive'}`} onClick={() => setAnnType('orange')}>.</span>
                </span>
                <span className="pageChartMenu">
                    <span className={`roundedBox yellow ${annotationIsActive('yellow') ? 'active' : 'inactive'} `} onClick={() => delAnn('yellow')}>X</span>
                    <span className={`roundedBox purple ${annotationIsActive('purple') ? 'active' : 'inactive'}`} onClick={() => delAnn('purple')}>X</span>
                    <span className={`roundedBox green ${annotationIsActive('green') ? 'active' : 'inactive'}`} onClick={() => delAnn('green')}>X</span>
                    <span className={`roundedBox orange ${annotationIsActive('orange') ? 'active' : 'inactive'}`} onClick={() => delAnn('orange')}>X</span>
                </span>
                <div>
                    <button onClick={addAnnotation}>Submit</button>
                </div>
            </div>
        </div>
    </>)
}