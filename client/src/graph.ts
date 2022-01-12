import 'chartjs-adapter-moment';
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
    ChartItem,
    ChartConfiguration
} from 'chart.js';
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

export const getOrCreateLegendList = (chart: Chart, id: string) => {
    const legendContainer = document.getElementById(id);
    let parent = legendContainer!.querySelector('div');
    let children: any[] = []

    if (!parent) {
        parent = document.createElement('div');
        parent.style.display = 'flex';
        parent.style.flexDirection = 'row';
        parent.style.margin = "0";
        parent.style.padding = "0";
        parent.style.height = "100%";
        parent.id = "legendParent"
        parent.style.justifyContent = 'space-evenly';

        legendContainer!.appendChild(parent);

        const parentContainer = document.getElementById(parent.id);
        const backButton = document.createElement('a');
        backButton.href = '#';
        backButton.className = 'previous round'
        backButton.innerHTML = '&#8249;'
        backButton.id = 'backButton';
        parentContainer?.appendChild(backButton)

        for (let i = 0; i < 3; i += 1) {
            let child = document.createElement('ul');
            child.style.display = 'flex';
            child.style.flexDirection = 'column';

            child.style.margin = "0";
            child.style.padding = "0";
            children.push(child)
            parentContainer!.appendChild(child);
        }
    } else {
        parent.childNodes.forEach((c: any) => {
            children.push(c)
        })

        children.shift()
    }

    return children;
};

export const htmlLegendPlugin = {
    id: 'htmlLegend',
    afterUpdate(chart: Chart, args: any, options: any) {
        const ul = getOrCreateLegendList(chart, options.containerID);

        // Remove old legend items
        ul.forEach((child: any) => {
            while (child.firstChild) {
                child.firstChild.remove();
            }
        })

        // Reuse the built-in legendItems generator
        const items = chart!.options!.plugins!.legend!.labels!.generateLabels!(chart!);

        items.forEach((item: any, i: number) => {
            const li = document.createElement('li');
            li.style.alignItems = 'center';
            li.style.cursor = 'pointer';
            li.style.display = 'flex';
            li.style.flexDirection = 'row';
            li.style.marginLeft = '10px';
            li.style.height = '100%';

            li.onclick = () => {
                const { type } = chart.config;
                if (type === 'pie' || type === 'doughnut') {
                    // Pie and doughnut charts only have a single dataset and visibility is per item
                    chart.toggleDataVisibility(item.index);
                } else {
                    chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
                }
                chart.update();
            };

            // Color box
            const boxSpan = document.createElement('span');
            boxSpan.style.background = item.fillStyle!.toString();
            boxSpan.style.borderColor = item.strokeStyle!.toString();
            boxSpan.style.borderWidth = item.lineWidth + 'px';
            boxSpan.style.display = 'inline-block';
            boxSpan.style.height = '10px';
            boxSpan.style.marginRight = '10px';
            boxSpan.style.width = '10px';

            // Text
            const textContainer = document.createElement('p');
            textContainer.className = 'legendText'
            textContainer.style.color = item.fontColor!.toString();
            textContainer.style.margin = "0";
            textContainer.style.padding = '0';
            textContainer.style.textDecoration = item.hidden ? 'line-through' : '';

            const text = document.createTextNode(item.text);
            textContainer.appendChild(text);

            li.appendChild(boxSpan);
            li.appendChild(textContainer);
            ul[Math.floor((i) / 2)].appendChild(li);
        });
    }
};

// export const sampleData = () => {
export let l1v: { x: Date, y: string }[] = [];
export let l1c: { x: Date, y: string }[] = [];
export let l2v: { x: Date, y: string }[] = [];
export let l2c: { x: Date, y: string }[] = [];
export let l3v: { x: Date, y: string }[] = [];
export let l3c: { x: Date, y: string }[] = [];
for (let i = 0; i < 100; i += 1) {
    l1v.push({ y: (Math.floor(Math.random() * 11) + 230).toString(), x: new Date(new Date().getTime() + i * 60000) })
    l1c.push({ y: (Math.floor(Math.random() * 11) + 0).toString(), x: new Date(new Date().getTime() + i * 60000) })
    l2v.push({ y: (Math.floor(Math.random() * 11) + 230).toString(), x: new Date(new Date().getTime() + i * 60000) })
    l2c.push({ y: (Math.floor(Math.random() * 11) + 0).toString(), x: new Date(new Date().getTime() + i * 60000) })
    l3v.push({ y: (Math.floor(Math.random() * 11) + 230).toString(), x: new Date(new Date().getTime() + i * 60000) })
    l3c.push({ y: (Math.floor(Math.random() * 11) + 0).toString(), x: new Date(new Date().getTime() + i * 60000) })
}

// return { l1v, l1c, l2v, l2c, l3v, l3c }
// }

export const newChart = (ctx: any, config: ChartConfiguration) => new Chart(ctx!, config);

export const sampleData = {
    'l1-voltage': l1v,
    'l1-amperage': l1c,
    'l2-voltage': l2v,
    'l2-amperage': l2c,
    'l3-voltage': l3v,
    'l3-amperage': l3c,
};

export const config = (data?: {
    'l1-voltage': { x: Date, y: string }[],
    'l1-amperage': { x: Date, y: string }[],
    'l2-voltage': { x: Date, y: string }[],
    'l2-amperage': { x: Date, y: string }[],
    'l3-voltage': { x: Date, y: string }[],
    'l3-amperage': { x: Date, y: string }[],
}) => {
    return {
        type: 'line',
        data: {
            datasets: [
                {
                    label: "L1 Voltage",
                    data: data ? data['l1-voltage'] : {},
                    borderColor: 'rgba(255, 0, 0, 1.0)',
                    backgroundColor: 'rgba(255, 0, 0, 1.0)',
                    yAxisID: 'y',
                    pointRadius: 0,
                    pointStyle: 'rectRot',
                    pointBorderColor: 'rgb(255, 0, 0)'
                },
                {
                    label: "L1 Current",
                    data: data ? data['l1-amperage'] : {},
                    borderColor: 'rgba(255, 0, 0, 1.0)',
                    backgroundColor: 'rgba(255, 0, 0, 1.0)',
                    yAxisID: 'y1',
                    pointRadius: 0,
                    pointStyle: 'rectRot',
                    pointBorderColor: 'rgb(0, 255, 0)'
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
        },
        plugins: [htmlLegendPlugin],
        options: {
            responsive: true,
            plugins: {
                htmlLegend: {
                    // ID of the container to put the legend in
                    containerID: 'htmlLegend',
                },
                legend: {
                    position: 'top',
                    labels: {
                        color: 'var(--text-colour)',
                        usePointStyle: true,
                    },
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
                    time: {
                        // Luxon format string
                        tooltipFormat: 'DD T'
                    },
                    title: {
                        display: false,
                    }
                },
                y: {
                    min: 200,
                    max: 250,
                    type: 'linear',
                    display: true,
                    position: 'left',
                },
                y1: {
                    min: 0,
                    max: 30.0,
                    type: 'linear',
                    display: true,
                    position: 'right',

                    // grid line settings
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
            }
        }
    }
}