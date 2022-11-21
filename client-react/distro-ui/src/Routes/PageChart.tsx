import React, { useEffect, useRef, useState, Component, memo } from 'react';
import 'chartjs-adapter-moment';
import '../Styles/Page.css';
import TuneIcon from '@mui/icons-material/Tune';
import CommentIcon from '@mui/icons-material/Comment';
import * as Types from '../types'
import * as Influx from '../Plugins/influx';
import * as Dates from '../Dates'
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import Neighbour from '../Neighbour';
import { NavLink, Route } from 'react-router-dom';

interface Phase {
    voltage: { y: number | string | null, x: Date }[]
    amperage: { y: number | string | null, x: Date }[]
}

type AvgPeriod = '1s' | '5s' | '30s' | '60s';

const loadValue = (name: string) => {
    const rtn = window.localStorage.getItem(name) || "";
    if (rtn === 'NaN') return "";
    return rtn;
}

const saveValue = (name: string, value: any) => localStorage.setItem(name, value)

type InfluxRtn = {
    phases: Phase[], annotations: {
        y: string;
        x: Date;
        color: string;
    }[]
}

const configData = (data: InfluxRtn | undefined | null) => {

    const loader = document.getElementById('loader') as HTMLDivElement;
    if (loader) loader.style.display = 'none';

    return [
        {
            name: "L1 Voltage",
            data: data ? data.phases[0].voltage : [],
            type: 'line',
        },
        {
            name: "L1 Current",
            data: data ? data.phases[0].amperage : [],
            type: 'line',
        },
        {
            name: "L2 Voltage",
            data: data ? data.phases[1].voltage : [],
            type: 'line',
        },
        {
            name: "L2 Current",
            data: data ? data.phases[1].amperage : [],
            type: 'line',
        },
        {
            name: "L3 Voltage",
            data: data ? data.phases[2].voltage : [],
            type: 'line',
        },
        {
            name: "L3 Current",
            data: data ? data.phases[2].amperage : [],
            type: 'line',
        },
    ]
};


const TravelDetailsView = ({ data }: { data: InfluxRtn | undefined | null }) => {

    const series = configData(data)
    let lowestVal = 250;
    series[0].data.forEach((val) => {
        if (typeof (val.y) === 'number' && val.y > 0 && val.y < lowestVal) lowestVal = val.y;
    })

    const chartVoltage: ApexOptions = {
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
            type: 'datetime',
        },
        yaxis: [
            {
                seriesName: 'Voltage',
                min: 230,
                max: 250,
                tickAmount: 3,
                decimalsInFloat: 0,
                title: {
                    text: "Voltage"
                },
            }, {
                seriesName: 'Current',
                opposite: true,
                title: {
                    text: "Current"
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

    const brushChartOptions: ApexOptions = {
        chart: {
            brush: {
                target: 'mychart',
                enabled: true
            },
            selection: {
                enabled: true,
                xaxis: {
                    min: new Date('15 Sep 2022').getTime(),
                    max: new Date('1 Oct 2022').getTime()
                }
            },
        },
        legend: {
            show: false
        },
        xaxis: {
            labels: {
                show: false
            },
            axisTicks: {
                show: false,
            },
            type: 'datetime',
            tooltip: {
                enabled: false
            }
        },
        yaxis: [
            {
                seriesName: 'Voltage',
                min: 230,
                tickAmount: 3,
                decimalsInFloat: 0,
                labels: {
                    show: false
                },
            }, {
                seriesName: 'Current',
                opposite: true,
                labels: {
                    show: false
                },
                min: 0,
                max: 10,
                tickAmount: 3,
                decimalsInFloat: 0,
            }, {
                seriesName: 'Voltage',
                show: false,
                labels: {
                    show: false
                },
            }, {
                seriesName: 'Current',
                show: false,
            }, {
                seriesName: 'Voltage',
                show: false,
            }, {
                seriesName: 'Current',
                show: false,
            }
        ],
    }


    return <div style={{ height: "70%" }}>
        <ReactApexChart type="line" options={chartVoltage} series={series} height={"90%"} />
        <ReactApexChart type="line" options={brushChartOptions} series={series} height={'12%'} width={'100%'} />
    </div>;
};

function PageChart({ device }: { device: Neighbour }) {

    const { start, end } = Dates.GetDates();

    const [startDate, setStartDate] = useState<Date>(start);
    const [endDate, setEndDate] = useState<Date>(end);
    const [curPage, setCurPage] = useState(1);
    const [avgPeriod, setAvgPeriod] = useState<AvgPeriod>(loadValue('avgPeriod') as AvgPeriod || '30s');
    const [scrollPeriod, setScrollPeriod] = useState(loadValue('scrollPeriod') || '5m');


    useEffect(() => saveValue('startDate', startDate.getTime()), [startDate])
    useEffect(() => saveValue('endDate', endDate.getTime()), [endDate])
    useEffect(() => saveValue('avgPeriod', avgPeriod), [avgPeriod])
    useEffect(() => saveValue('scrollPeriod', scrollPeriod), [scrollPeriod])

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
                    <input required type="date" id="startDate" name="startDate" onChange={(e) => {
                        if (e.target.value) {
                            const d = e.target.value + ' ' + startDate.value.toISOString().substring(11);
                            startDate.set(new Date(d))
                        }
                    }} value={startDate.value.toISOString().substring(0, 10)} />
                    <input required type="time" id="endTime" name="endTime" onChange={(e) => {
                        const d = startDate.value.toISOString().substring(0, 10) + 'T' + e.target.value + ':00.000Z'
                        startDate.set(new Date(d))
                    }} value={startDate.value.toString().substring(16, 21)} />
                </div>
                <label>End</label>
                <div className={`datePicker`}>
                    <input required type="date" id="endDate" name="endDate" onChange={(e) => {
                        if (e.target.value) {
                            const d = e.target.value + ' ' + endDate.value.toISOString().substring(11);
                            endDate.set(new Date(d))
                        }
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

    const [data, setData] = useState<InfluxRtn | undefined | null>(null);
    let [legendView, setLegendView] = useState<{ [index: string]: boolean }[]>([
        { voltage: true, current: true },
        { voltage: true, current: true },
        { voltage: true, current: true }
    ]);

    if (device && !data) {
        Influx.plugin.pollRange(device.db, startDate.toISOString(), endDate.toISOString(), avgPeriod).then((json) => {
            setData({ phases: json.phases, annotations: json.annotations })
        })
    }

    let loader = true;
    if (data && data.phases.find(phase => phase.voltage.length === 0 && phase.amperage.length === 0)) loader = false;

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

    return (<>
        <Route exact path={'/chart'}>
            {loader && <div id="loader"></div>}
            {data && data.phases.find(phase => phase.voltage.length === 2 && phase.amperage.length === 2) && <div id="chart-notify">No data in period {startDate.toLocaleString()} to {endDate.toLocaleString()}</div>}
            <TravelDetailsView data={data} />
            <div className="pageRow2">
                <span className="pageChartMenu" id="legend-container">
                    <span className='roundedBox icon' onClick={chartConfig}><TuneIcon /></span>
                    <span className='roundedBox'>
                        <NavLink to={`/chart/annotation`}>
                            <CommentIcon />
                        </NavLink>
                    </span>
                    <span className={`roundedBox l1 ${legendView[1 - 1].voltage ? '' : 'strikethrough'}`} onClick={() => toggleLegendElement(1, "Voltage")}>V</span>
                    <span className={`roundedBox l2 ${legendView[2 - 1].voltage ? '' : 'strikethrough'}`} onClick={() => toggleLegendElement(2, "Voltage")}>V</span>
                    <span className={`roundedBox l3 ${legendView[3 - 1].voltage ? '' : 'strikethrough'}`} onClick={() => toggleLegendElement(3, "Voltage")}>V</span>
                    <span className={`roundedBox l1 ${legendView[1 - 1].current ? '' : 'strikethrough'}`} onClick={() => toggleLegendElement(1, "Current")}>A</span>
                    <span className={`roundedBox l2 ${legendView[2 - 1].current ? '' : 'strikethrough'}`} onClick={() => toggleLegendElement(2, "Current")}>A</span>
                    <span className={`roundedBox l3 ${legendView[3 - 1].current ? '' : 'strikethrough'}`} onClick={() => toggleLegendElement(3, "Current")}>A</span>
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

export default memo(PageChart)