import React from 'react';
import 'chartjs-adapter-moment';
import '../Styles/Page.css';
import * as Types from '../types'
import TuneIcon from '@mui/icons-material/Tune';

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

export default function PageChart({ device, data }: { device?: Neighbour, data: any }) {
    return (<>
        <div id="loader"></div>
        <div style={{ width: "90%", height: "65%" }} className="chart-container">
            <Line options={options} data={configData(data)} />
        </div>
        <div className="pageRow2">
            <span className="pageChartMenu">
                <span className='roundedBox'>+</span>
                <span className='roundedBox l1'>V</span>
                <span className='roundedBox l1'>A</span>
                <span className='roundedBox l2'>V</span>
                <span className='roundedBox l2'>A</span>
                <span className='roundedBox l3'>V</span>
                <span className='roundedBox l3'>A</span>
                <span className='roundedBox'>-</span>
                <span className='roundedBox'><TuneIcon /></span>
            </span>
        </div>
    </>);
}
