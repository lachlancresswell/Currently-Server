import * as influx from 'influx';
import * as HTML from './html'
import * as Graph from './graph'

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

interface buttonItem {
    elem: HTMLElement,
    html: string,
    cb: any,
}

interface buttonCollection { [key: string]: buttonItem }

// GLOBALS
let neighbours: neighbourInfo[] = [];
let devButtons: HTMLOptionElement[] = [];
let curDevice = 0;
const devMenu = document.getElementById("device-menu") as HTMLDivElement
let dbData: dbResponse;

/**
 * Events to run on button press
 * @param ev Button event handler
 */
const buttonHandler = (ev: MouseEvent) => {
    let buttonID: string = (<HTMLButtonElement>ev.target).id;
    if (buttonID === 'backButton') {
        buttonID = 'button-basic'
        document.getElementById("menu")!.style.display = "flex";
        document.getElementById("upstairs")!.style.display = "flex";
    }
    setCurrentPage(buttons[buttonID].html)
    setButtonAsSelected(buttons, buttonID)
}

const chartButtonHandler = (ev: MouseEvent) => {
    const buttonID: string = (<HTMLButtonElement>ev.target).id;
    setCurrentPage(buttons[buttonID].html)
    setButtonAsSelected(buttons, buttonID)
    updateChart();
}

const configButtonHandler = (ev: MouseEvent) => {
    const buttonID: string = (<HTMLButtonElement>ev.target).id;
    setCurrentPage(buttons[buttonID].html)

}

let buttons: buttonCollection = {
    "button-basic": {
        elem: document.getElementById("button-basic") as HTMLAnchorElement,
        html: HTML.pageBasic(),
        cb: buttonHandler,
    },
    "button-l1": {
        elem: document.getElementById("button-l1") as HTMLAnchorElement,
        html: HTML.pagePhase(1),
        cb: buttonHandler,
    },
    "button-l2": {
        elem: document.getElementById("button-l2") as HTMLAnchorElement,
        html: HTML.pagePhase(2),
        cb: buttonHandler,
    },
    "button-l3": {
        elem: document.getElementById("button-l3") as HTMLAnchorElement,
        html: HTML.pagePhase(3),
        cb: buttonHandler,
    },
    "button-adv": {
        elem: document.getElementById("button-adv") as HTMLAnchorElement,
        html: HTML.pageAdv(),
        cb: buttonHandler,
    },
    "button-chart": {
        elem: document.getElementById("button-chart") as HTMLAnchorElement,
        html: HTML.pageChart(),
        cb: chartButtonHandler,
    },
    "button-config": {
        elem: document.getElementById("button-config") as HTMLSpanElement,
        html: HTML.pageConfig(),
        cb: configButtonHandler,
    },
}

Object.keys(buttons).forEach((key) => {
    buttons[key].elem.onclick = buttons[key].cb;
})

// FUNCTIONS
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Pulls list of discover neighbouring servers from the server
 * @returns Neighbouring server addresses whether they are local (match the current server address) or not
 */
const getNeighbourAddresses = (): neighbourAPI => {
    var xmlHttp = new XMLHttpRequest();
    console.log('GET - ' + window.location.href + "neighbours")
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
    neighbours[curDevice].influx.query(`
    select * from modbus
    WHERE time > now() - 8h
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
 * Sets UI for a selected button
 * @param buttons Array of HTMLButtonElements
 * @param buttonID ID of button to set as selected
 */
const setButtonAsSelected = (buttons: buttonCollection, buttonID: string) => {
    for (const [key, value] of Object.entries(buttons)) {
        if (key === buttonID) value.elem.classList.add('button-selected')
        else value.elem.classList.remove('button-selected')
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

const updateChart = () => {
    document.getElementById("menu")!.style.display = "none";
    document.getElementById("upstairs")!.style.display = "none";

    const ctx = (document.getElementById('myChart') as HTMLCanvasElement).getContext('2d');

    const chart = Graph.newChart(ctx, Graph.config() as any);
    const backButton = document.getElementById('backButton') as HTMLAnchorElement;
    backButton.onclick = buttonHandler


    pollServer2().then((res) => {
        const keys = [
            'l1-voltage',
            'l1-amperage',
            'l2-voltage',
            'l2-amperage',
            'l3-voltage',
            'l3-amperage',
        ]

        interface responseKeys {
            'l1-voltage': { x: Date, y: string }[],
            'l1-amperage': { x: Date, y: string }[],
            'l2-voltage': { x: Date, y: string }[],
            'l2-amperage': { x: Date, y: string }[],
            'l3-voltage': { x: Date, y: string }[],
            'l3-amperage': { x: Date, y: string }[],
        };

        let data = <responseKeys>{}

        keys.forEach((k: string) => {
            data[k as keyof (typeof data)] = [];
            res[k as keyof dbResponse2].forEach((v: string, i: number) => {
                data[k as keyof (typeof data)].push({ y: v, x: res["time"][i] })
            });
        })
        chart.data = Graph.config(data).data as any
        chart.update();
    });
}

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
    //neighbours = neighbours.sort()
});

neighbours = neighbours.sort((a: neighbourInfo, b: neighbourInfo) => {
    return b.address.local ? 1 : 0;
})

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
setCurrentPage(buttons["button-config"].html)