import React from 'react';
import 'chartjs-adapter-moment';
import '../Styles/App.css';
import Button from '../Components/Button'
import * as Types from '../types'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';

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
    SubTitle
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Neighbour from '../Neighbour';
import * as influx from '../Plugins/influx';

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
        legend: {
            display: false,
        },
        title: {
            display: false,
        },
        decimation: {
            algorithm: 'min-max',
            enabled: true
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
                data: data ? data['l1-voltage'] : {},
                borderColor: 'rgba(255, 0, 0, 1.0)',
                backgroundColor: 'rgba(255, 0, 0, 1.0)',
                yAxisID: 'y',
                pointRadius: 0,
                pointStyle: 'rectRot',
                pointBorderColor: 'rgb(255, 0, 0)',
                spanGaps: 150000
            },
            {
                label: "L1 Current",
                data: data ? data['l1-amperage'] : {},
                borderColor: 'rgba(255, 0, 0, 1.0)',
                backgroundColor: 'rgba(255, 0, 0, 1.0)',
                yAxisID: 'y1',
                pointRadius: 0,
                pointStyle: 'rectRot',
                pointBorderColor: 'rgb(0, 255, 0)',
                spanGaps: 150000
            },
            {
                label: "L2 Voltage",
                data: data ? data['l2-voltage'] : {},
                borderColor: 'rgba(255, 255, 255, 1.0)',
                backgroundColor: 'rgba(255, 255, 255, 1.0)',
                yAxisID: 'y',
                pointRadius: 0,
                pointStyle: 'rectRot',
                pointBorderColor: 'rgb(255, 0, 0)'
            },
            {
                label: "L2 Current",
                data: data ? data['l2-amperage'] : {},
                borderColor: 'rgba(255, 255, 255, 1.0)',
                backgroundColor: 'rgba(255, 255, 255, 1.0)',
                yAxisID: 'y1',
                pointRadius: 0,
                pointStyle: 'rectRot',
                pointBorderColor: 'rgb(0, 255, 0)'
            },
            {
                label: "L3 Voltage",
                data: data ? data['l3-voltage'] : {},
                borderColor: 'rgba(0, 0, 255, 1.0)',
                backgroundColor: 'rgba(0, 0, 255, 1.0)',
                yAxisID: 'y',
                pointRadius: 0,
                pointStyle: 'rectRot',
                pointBorderColor: 'rgb(255, 0, 0)'
            },
            {
                label: "L3 Current",
                data: data ? data['l3-amperage'] : {},
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

export default class PageChart extends React.Component<{ device?: Neighbour }, { device?: Neighbour, data: any, start: string, end: string, buttons: Types.ButtonItem[] }> {
    constructor(props: { device: Neighbour }) {
        super(props);

        const buttons: Types.ButtonItem[] = [{
            title: '<',
            paths: ['/rtn'],
            icon: <ArrowBackIcon />,
        }, {
            title: '-',
            fn: this.updateTime,
            icon: <RemoveIcon />,
        }, {
            title: '+',
            fn: () => this.updateTime('+'),
            icon: <AddIcon />,
        }, {
            title: 'Start',
        }, {
            title: 'End',
        }, {
            title: 'End',
            icon: <MenuIcon />
        }]


        this.state = {
            device: props.device,
            data: null,
            start: '40m',
            end: 'now',
            buttons,
        }
    }

    updateTime = (direction: '+' | '-' = '-') => {
        const loader = document.getElementById('loader') as HTMLDivElement;
        if (loader) loader.style.display = 'initial';

        this.setState((prevState) => {
            let diff = 0;
            const denominator = prevState.start.substring(prevState.start.length - 1)
            let start = parseInt(prevState.start.substring(0, prevState.start.length - 1));
            let end = 0;
            if (prevState.end.includes('now')) {
                end = 0;
            } else {
                end = parseInt(prevState.end.substring(0, prevState.end.length - 1));
            }
            diff = end - start;

            if (direction === '+') {
                start = start + diff;
                end = end + diff;
            } else {
                start = start - diff;
                end = end - diff;
            }

            return { ...prevState, start: start + denominator, end: end + denominator }
        })
    }

    componentDidMount() {
        influx.plugin.pollRange(this.state.device?.db, this.state.start, this.state.end).then((data: any) => {
            const d = {
                "l1-amperage": data[0].amperage, "l1-voltage": data[0].voltage,
                "l2-amperage": data[1].amperage, "l2-voltage": data[1].voltage,
                "l3-amperage": data[2].amperage, "l3-voltage": data[2].voltage,
            }

            this.setState(prevState => ({ ...prevState, ...{ data: d } }))
        });
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        // Typical usage (don't forget to compare props):
        if (this.props.device !== prevProps.device || this.state.start !== prevState.start || this.state.end !== prevState.end) {
            influx.plugin.pollRange(this.props.device?.db, this.state.start, this.state.end).then((data: any) => {
                const d = {
                    "l1-amperage": data[0].amperage, "l1-voltage": data[0].voltage,
                    "l2-amperage": data[1].amperage, "l2-voltage": data[1].voltage,
                    "l3-amperage": data[2].amperage, "l3-voltage": data[2].voltage,
                }

                this.setState(prevState => ({ ...prevState, ...{ data: d } }))
            });
        }
    }


    render() {
        const parent = document.getElementById("single-page") as HTMLDivElement;
        // let height = '100px';
        // let width = '100px';

        if (parent) {
            // height = parent.offsetHeight / 0.5 + 'px'
            // width = parent.offsetWidth / 0.5 + 'px'
        }

        // width = '30px';

        return (<>
            <div id="loader"></div>
            <div className="chart-container">
                <Line width={"80%"} options={options} data={configData(this.state.data)} />
            </div>
            <div className="menu">
                {this.state.buttons.map((b) => <Button key={b.title} button={b} />)}
            </div>
        </>);
    }
}
