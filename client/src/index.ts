import * as influx from 'influx';
import * as HTML from './html'
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
    SubTitle
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
    SubTitle
);

//INTERFACES
interface neighbourInfo {
    influx: influx.InfluxDB,
    address: addressInfo
}
interface addressInfo {
    ip: string, local: boolean
}
interface neighbourAPI {
    addresses: addressInfo[]
}
interface dbResponse {
    "time": any,
    "l1-voltage": string,
    "l1-amperage": string,
    "l2-voltage": string,
    "l2-amperage": string,
    "l3-voltage": string,
    "l3-amperage": string,
    "grid-freq": string,
    "power-factor": string,
    "apparent-power": string,
    "l1-amperage-round": string,
    "l2-amperage-round": string,
    "l3-amperage-round": string,
}

interface dbResponse2 {
    "time": any,
    "l1-voltage": string[],
    "l1-amperage": string[],
    "l2-voltage": string[],
    "l2-amperage": string[],
    "l3-voltage": string[],
    "l3-amperage": string[],
    "grid-freq": string[],
    "power-factor": string[],
    "apparent-power": string[],
    "l1-amperage-round": string[],
    "l2-amperage-round": string[],
    "l3-amperage-round": string[],
}

interface buttonCollection {
    "button-basic": HTMLAnchorElement,
    "button-l1": HTMLAnchorElement,
    "button-l2": HTMLAnchorElement,
    "button-l3": HTMLAnchorElement,
    "button-adv": HTMLAnchorElement,
    "button-chart": HTMLAnchorElement,
}

// GLOBALS
const neighbours: neighbourInfo[] = [];
let devButtons: HTMLOptionElement[] = [];
let curDevice = 0;
const devMenu = document.getElementById("device-menu") as HTMLDivElement
let dbData: dbResponse;


const buttonIDs = [
    "button-basic",
    "button-l1",
    "button-l2",
    "button-l3",
    "button-adv",
]

let buttons: buttonCollection = {
    "button-basic": document.getElementById("button-basic") as HTMLAnchorElement,
    "button-l1": document.getElementById("button-l1") as HTMLAnchorElement,
    "button-l2": document.getElementById("button-l2") as HTMLAnchorElement,
    "button-l3": document.getElementById("button-l3") as HTMLAnchorElement,
    "button-adv": document.getElementById("button-adv") as HTMLAnchorElement,
    "button-chart": document.getElementById("button-chart") as HTMLAnchorElement,
}

const buttonHTML: { [key: string]: string } = {
    "button-basic": HTML.pageBasic(),
    "button-l1": HTML.pagePhase(1),
    "button-l2": HTML.pagePhase(2),
    "button-l3": HTML.pagePhase(3),
    "button-adv": HTML.pageAdv(),
    "button-chart": HTML.pageChart(),
}

// FUNCTIONS
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Pulls list of discover neighbouring servers from the server
 * @returns Neighbouring server addresses whether they are local (match the current server address) or not
 */
const getNeighbourAddresses = (): neighbourAPI => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", window.location.href + "neighbours", false); // false for synchronous request
    xmlHttp.send(null);
    return (JSON.parse(xmlHttp.responseText) as neighbourAPI)
}

const deviceButtonHandler = (event: MouseEvent) => {
    const target = event.target as HTMLAnchorElement;
    const id = target.id;
    curDevice = parseInt(id.split(":")[0])
    devButtons.forEach((button: HTMLOptionElement) => {
        if (button.id === id) {
            button.classList.add('button-selected')
        } else {
            button.classList.remove('button-selected');
        }
    })
}

/**
 * Pulls data from Influx database
 * @returns Resolves with database response or rejects with error message
 */
const pollServer = () => new Promise<dbResponse>(async (resolve: any, reject: any) => {
    neighbours[curDevice].influx.query(`
    select "L1 Voltage", "L1 Current", "L2 Voltage", "L2 Current", "L3 Voltage", "L3 Current", "Grid Frequency", "Power Factor", "Total Apparent Power" from modbus
    order by time desc
    limit 2
    `).then(async (res: any) => {
        if (res && res.length) {
            console.log(res[res.length - 1]);
            dbData = {
                "time": res[res.length - 1]["time"],
                "l1-voltage": (Math.round(res[res.length - 1]["L1 Voltage"])).toString(),
                "l1-amperage": (Math.ceil(res[res.length - 1]["L1 Current"] * 10) / 10).toFixed(1),
                "l2-voltage": (Math.round(res[res.length - 1]["L2 Voltage"])).toString(),
                "l2-amperage": (Math.ceil(res[res.length - 1]["L2 Current"] * 10) / 10).toFixed(1),
                "l3-voltage": (Math.round(res[res.length - 1]["L3 Voltage"])).toString(),
                "l3-amperage": (Math.ceil(res[res.length - 1]["L3 Current"] * 10) / 10).toFixed(1),
                "grid-freq": (Math.round(res[res.length - 1]["Grid Frequency"] * 10) / 10).toFixed(1),
                "power-factor": (Math.round(res[res.length - 1]["Power Factor"])).toString(),
                "apparent-power": (Math.round(res[res.length - 1]["Total Apparent Power"])).toString(),
                "l1-amperage-round": (Math.round(res[res.length - 1]["L1 Current"])).toString(),
                "l2-amperage-round": (Math.round(res[res.length - 1]["L2 Current"])).toString(),
                "l3-amperage-round": (Math.round(res[res.length - 1]["L3 Current"])).toString(),
            }
            return resolve(dbData)
        } else {
            return reject('Influx response length < 1')
        }
    })
})

const pollServer2 = () => new Promise<dbResponse2>(async (resolve: any, reject: any) => {
    neighbours[0].influx.query(`
    select * from modbus
    WHERE time > now() - 12h
    order by time asc
    `).then(async (res: any) => {
        if (res && res.length) {
            console.log(res[res.length - 1]);
            resolve({
                "time": res.map((value: any) => new Date(value["time"])),
                "l1-voltage": res.map((value: any) => value["L1 Voltage"]),
                "l1-amperage": res.map((value: any) => value["L1 Current"]),
                "l2-voltage": res.map((value: any) => value["L2 Voltage"]),
                "l2-amperage": res.map((value: any) => value["L2 Current"]),
                "l3-voltage": res.map((value: any) => value["L3 Voltage"]),
                "l3-amperage": res.map((value: any) => value["L3 Current"]),
                "grid-freq": res.map((value: any) => value["Grid Frequency"]),
                "power-factor": res.map((value: any) => value["Power Factor"]),
                "apparent-power": res.map((value: any) => value["Total Apparent Power"]),
                "l1-amperage-round": res.map((value: any) => value["L1 Current"]),
                "l2-amperage-round": res.map((value: any) => value["L2 Current"]),
                "l3-amperage-round": res.map((value: any) => value["L3 Current"])
            })
        } else {
            return reject('Influx response length < 1')
        }
    })
})

/**
 * Creates a promise loop
 */
const mainLoop = () => {
    pollServer().then(async (data: dbResponse) => {
        dbData = data;
        updateReadout(data);

        await sleep(1000)

        return mainLoop()
    }, async (rej: any) => mainLoop());
}

/**
 * Updates UI with database values
 * @param data Influx database data
 */
const updateReadout = (data: dbResponse) => {
    if (data && data != undefined) {
        for (const [key, value] of Object.entries(data)) {
            if (document.getElementById(key) != null) (document.getElementById(key) as HTMLDivElement).innerText = value
        };
    }
}

/**
 * Events to run on button press
 * @param ev Button event handler
 */
const buttonHandler = (ev: MouseEvent) => {
    const buttonID: string = (<HTMLButtonElement>ev.target).id;
    setCurrentPage(buttonHTML[buttonID])
    setButtonAsSelected(buttons, buttonID)
}

/**
 * Sets UI for a selected button
 * @param buttons Array of HTMLButtonElements
 * @param buttonID ID of button to set as selected
 */
const setButtonAsSelected = (buttons: buttonCollection, buttonID: string) => {
    for (const [key, value] of Object.entries(buttons)) {
        if (key === buttonID) value.classList.add('button-selected')
        else value.classList.remove('button-selected')
    }
}

/**
 * Updates screen with provided HTML    
 * @param html HTML to place on current screen
 */
const setCurrentPage = (html: string) => {
    const details = document.getElementById("single-page") as HTMLDivElement;
    details.style.visibility = "hidden";
    details.innerHTML = html;
    updateReadout(dbData);
    details.style.visibility = "visible";
}

const chartButtonHandler = (ev: MouseEvent) => {
    const buttonID: string = (<HTMLButtonElement>ev.target).id;
    setCurrentPage(buttonHTML[buttonID])
    setButtonAsSelected(buttons, buttonID)
    updateChart();
}

const updateChart = () => {
    pollServer2().then((res) => {
        console.log(res)

        const ctx = (document.getElementById('myChart') as HTMLCanvasElement).getContext('2d');

        const dataset = "l1-voltage"
        const dataset2 = "l1-amperage"

        let d: { x: Date, y: string }[] = [];
        res[dataset].forEach((v: string, i: number) => {
            d.push({ y: v, x: res["time"][i] })
        });

        let d2: { x: Date, y: string }[] = [];
        res[dataset2].forEach((v: string, i: number) => {
            d2.push({ y: v, x: res["time"][i] })
        });

        const data = {
            labels: res["time"],
            datasets: [
                {
                    label: dataset,
                    data: d,
                    borderColor: 'rgba(255, 159, 64, 0.5)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    yAxisID: 'y',
                    pointRadius: 0,
                },
                {
                    label: dataset2,
                    data: d2,
                    borderColor: 'rgba(159, 255, 64, 0.5)',
                    backgroundColor: 'rgba(159, 255, 64, 0.2)',
                    yAxisID: 'y1',
                    pointRadius: 0,
                },
            ]
        };

        const myChart = new Chart(ctx!, {
            type: 'line',
            data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
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
                        min: 225,
                        max: 250,
                        type: 'linear',
                        display: true,
                        position: 'left',
                    },
                    y1: {
                        min: 0,
                        max: 10.0,
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
        });
    });
}

// Attach button handlers
buttons["button-basic"].onclick = buttonHandler;
buttons["button-l1"].onclick = buttonHandler;
buttons["button-l2"].onclick = buttonHandler;
buttons["button-l3"].onclick = buttonHandler;
buttons["button-adv"].onclick = buttonHandler;
buttons["button-chart"].onclick = chartButtonHandler;

// START
getNeighbourAddresses().addresses.forEach((address: addressInfo) => {
    neighbours.push({
        influx: new influx.InfluxDB({
            host: window.location.hostname,
            database: 'influx',
            path: `/${(address.ip).replace(':', '/')}/influx`,
            port: parseInt(window.location.port) || (window.location.protocol.indexOf("https") >= 0 ? 443 : 80),
            protocol: window.location.protocol.indexOf("https") >= 0 ? "https" : "http",
            schema: [
                {
                    measurement: 'modbus',
                    fields: {
                        current: influx.FieldType.FLOAT,
                    },
                    tags: ['host']
                }
            ]
        }), address
    })
});

// Create device dropdown
if (neighbours.length > 1) {
    neighbours.forEach((db: neighbourInfo, i: number) => {
        const id = i + ':' + db.address.ip
        const e = HTML.devElement(id, db.address.local ? "Local" : db.address.ip, (i === curDevice), deviceButtonHandler)
        devMenu.appendChild(e)
        devButtons.push(e)
    });
} else {
    devMenu.style.visibility = "hidden";
}
mainLoop()
setCurrentPage(buttonHTML["button-chart"])
updateChart()