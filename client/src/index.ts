import * as influx from 'influx';
import * as HTML from './html'
import * as Graph from './graph'

//INTERFACES
export interface neighbourInfo {
    influx: influx.InfluxDB,
    address: addressInfo,
    elem: HTMLOptionElement,
}
interface addressInfo {
    ip: string, local: boolean, name: string, modbusIP: string
}
export interface neighbourAPI {
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
const devMenu = document.getElementById("device-menu") as HTMLSelectElement
let dbData: dbResponse;
let modbus = 'Not connected';
let modbusIP = '';
let database = 'Not connected';
let databaseIP = '';

devMenu.onclick = () => {
    const textBox = document.getElementById("input-name") as HTMLInputElement
    if (textBox) textBox.value = getSelectedDevice().address.name;
}

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
    setCurrentPage(buttons[buttonID].html, buttonID)
    setButtonAsSelected(buttons, buttonID)
}

const chartButtonHandler = (ev: MouseEvent) => {
    const buttonID: string = (<HTMLButtonElement>ev.target).id;
    setCurrentPage(buttons[buttonID].html, buttonID)
    setButtonAsSelected(buttons, buttonID)
    updateChart();
}

const getSelectedDevice = (): neighbourInfo => neighbours.find((n) => n.address.ip === devMenu.value)!;

let averagingPeriod = "30s";
let viewingPeriod = "5h";

const configButtonHandler = (ev: MouseEvent) => {
    const buttonID: string = (<HTMLButtonElement>ev.target).id;

    if (currentPage != buttonID) {

        setCurrentPage(buttons[buttonID].html, buttonID)
        const saveButton = document.getElementById("button-save") as HTMLButtonElement;
        const clearButton = document.getElementById("button-clear") as HTMLButtonElement;
        const textBox = document.getElementById("input-name") as HTMLInputElement
        textBox.value = getSelectedDevice().address.name;

        clearButton.onclick = () => {
            const curDevice = getSelectedDevice();
            if (confirm(`Clear the device name for ${curDevice.address.name}?`)) {
                // Save empty name to server, causing server to fallback to default
                saveDeviceName(curDevice, "");
                // Get new name from server
                curDevice.address.name = getDeviceName(curDevice);
                textBox!.value = curDevice.address.name;
                updateDevList(curDevice.address.ip, curDevice.address.name)
            }
        }

        saveButton.onclick = () => {
            const curDevice = getSelectedDevice();
            // Save new name to server
            saveDeviceName(curDevice, textBox.value);
            // Get new name from server
            curDevice.address.name = getDeviceName(curDevice);
            updateDevList(curDevice.address.ip, curDevice.address.name)
        }

        const avPeriodMenu = document.getElementById("averaging-period") as HTMLSelectElement
        avPeriodMenu.value = averagingPeriod;
        avPeriodMenu.onclick = () => {
            averagingPeriod = avPeriodMenu.value;
        }

        const viewPeriodMenu = document.getElementById("viewing-period") as HTMLSelectElement
        viewPeriodMenu.value = viewingPeriod;
        viewPeriodMenu.onclick = () => {
            viewingPeriod = viewPeriodMenu.value;
        }
    } else {
        databaseIP = getSelectedDevice().address.ip;
        modbusIP = getSelectedDevice().address.modbusIP;
        setCurrentPage(HTML.pageDebug(database, modbus, databaseIP, modbusIP), 'page-config')
    }

}

const updateDevList = (ip: string, newName: string) => {
    const e = neighbours.find((n) => n.elem.id === ip)
    e!.elem.innerText = newName;
    return e;
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

/**
 * Finds the name of a device
 * @returns Name of device
 */
const getDeviceName = (device: neighbourInfo): string => {
    const path = window.location.href + `${(device.address.ip).replace(':', '/')}/device-name`;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", path, false); // false for synchronous request
    xmlHttp.send(null);
    return (JSON.parse(xmlHttp.responseText))
}

/**
 * Saves a name to the server  
 * @param name Name of device to save
 */
const saveDeviceName = (device: neighbourInfo, name: string) => {
    const path = window.location.href + `${(device.address.ip).replace(':', '/')}/device-name`;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", path, false); // false for synchronous request
    xmlHttp.setRequestHeader("device-name", name);
    xmlHttp.send(null);
}

const deviceButtonHandler = (event: MouseEvent) => {
    const target = event.target as HTMLAnchorElement;
    const id = target.id;
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
    getSelectedDevice().influx.query(`
    select "L1 Voltage", "L1 Current", "L2 Voltage", "L2 Current", "L3 Voltage", "L3 Current", "Grid Frequency", "Power Factor", "Total Apparent Power" from modbus
    order by time desc
    limit 1
    `).then(async (res: any) => {
        if (res && res.length) {
            database = 'OK';
            console.log(res[res.length - 1]);

            const time = new Date(res[res.length - 1]['time']);

            // if (((new Date) as any - (time as any)) > 5000) return reject('Old data') // time in ms

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
    const q = `
    select "L1 Voltage" AS "mean", "L1 Current" AS "mean_1", "L2 Voltage" AS "mean_2", "L2 Current" AS "mean_3", "L3 Voltage" AS "mean_4", "L3 Current" AS "mean_5", time from modbus
    WHERE time > now() - ${viewingPeriod}
    order by time asc
    `
    const q2 = `
    select MEAN("L1 Voltage"), MEAN("L1 Current"), MEAN("L2 Voltage"), MEAN("L2 Current"), MEAN("L3 Voltage"), MEAN("L3 Current"), time from modbus
    WHERE time > now() - ${viewingPeriod} GROUP BY time(${averagingPeriod})
    order by time asc
    `

    try {
        getSelectedDevice().influx.query((averagingPeriod === "none") ? q : q2).then(async (res: any) => {
            if (res && res.length) {
                database = 'OK';
                console.log(res[res.length - 1]);
                resolve({
                    "time": res.reduce((result: any[], value: any) => {
                        // Only push if there is a voltage
                        if (value["mean"] != null) result.push(new Date(value["time"]))
                        return result;
                    }, []),
                    "l1-voltage": res.reduce((result: any[], value: any) => {
                        if (value["mean"] != null) result.push(value["mean"])
                        return result;
                    }, []),
                    "l1-amperage": res.reduce((result: any[], value: any) => {
                        if (value["mean_1"] != null) result.push(value["mean_1"])
                        return result;
                    }, []),
                    "l2-voltage": res.reduce((result: any[], value: any) => {
                        if (value["mean_2"] != null) result.push(value["mean_2"])
                        return result;
                    }, []),
                    "l2-amperage": res.reduce((result: any[], value: any) => {
                        if (value["mean_3"] != null) result.push(value["mean_3"])
                        return result;
                    }, []),
                    "l3-voltage": res.reduce((result: any[], value: any) => {
                        if (value["mean_4"] != null) result.push(value["mean_4"])
                        return result;
                    }, []),
                    "l3-amperage": res.reduce((result: any[], value: any) => {
                        if (value["mean_5"] != null) result.push(value["mean_5"])
                        return result;
                    }, []),
                })
            } else {
                return reject('Influx response length < 1')
            }
        })
    } catch (err: any) {
        return reject(err)
    }
})

/**
 * Creates a promise loop
 */
const mainLoop = async () => {
    await sleep(1000)
    pollServer().then(async (data: dbResponse) => {
        dbData = data;
        updateReadout(data);
        modbus = 'OK';

        return await mainLoop()
    }, async (rej: any) => {
        if (rej.indexOf('Old data') > -1) {
            modbus = 'No connection';
        }
        return await mainLoop()
    });
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

let currentPage = '';

/**
 * Updates screen with provided HTML    
 * @param html HTML to place on current screen
 */
const setCurrentPage = (html: string, name?: string) => {
    const details = document.getElementById("single-page") as HTMLDivElement;
    details.style.visibility = "hidden";
    details.innerHTML = html;
    updateReadout(dbData);
    details.style.visibility = "visible";

    currentPage = name || '';
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
            'l1-voltage': { x: Date, y: number }[],
            'l1-amperage': { x: Date, y: number }[],
            'l2-voltage': { x: Date, y: number }[],
            'l2-amperage': { x: Date, y: number }[],
            'l3-voltage': { x: Date, y: number }[],
            'l3-amperage': { x: Date, y: number }[],
        };

        let data = <responseKeys>{}

        keys.forEach((k: string) => {
            data[k as keyof (typeof data)] = [];
            res[k as keyof dbResponse2].forEach((v: string, i: number) => {
                data[k as keyof (typeof data)].push({ y: parseFloat(v), x: res["time"][i].getTime() })
            });
        })
        chart.data = Graph.config(data).data as any
        Graph.config(data).data as any;
        chart.update();
    }, (err: any) => {
        const notification = document.getElementById('notification') as HTMLDivElement;
        notification.textContent = `No data found in range - ${viewingPeriod}`;
        notification.style.display = 'block';
        chart.update();
    });
}

// START
const discoveryLoop = async () => {
    const serverAddresses = getNeighbourAddresses().addresses;

    const selectedDeviceIP = neighbours.find((n) => n.address.ip === devMenu.value)?.address.ip;

    const existingNeighbourAddresses = serverAddresses.filter((incoming) => (neighbours.find(existing => (existing.address.ip === incoming.ip) && existing.address.name === incoming.name)!));
    const newNeighboursAddresses = serverAddresses.filter((incoming) => !(neighbours.find(existing => (existing.address.ip === incoming.ip) && existing.address.name === incoming.name)!));
    const missingNeighbourAddresses = neighbours.filter((existing) => !(serverAddresses.find(incoming => (existing.address.ip === incoming.ip) && existing.address.name === incoming.name)!));
    const newNeighbours: neighbourInfo[] = [];

    if (missingNeighbourAddresses.length) {
        // Remove missing addresses
        neighbours = neighbours.filter((n) => !missingNeighbourAddresses.find((e) => {
            if (e.address.ip === n.address.ip) {
                n.elem.remove();
                return true;
            }
            return false;
        }))
    }

    if (newNeighboursAddresses.length) {
        // Build new address objects
        newNeighboursAddresses.forEach(async (address: addressInfo) => {

            const elem = HTML.devElement(address.ip, address.name, false, deviceButtonHandler)
            newNeighbours.push({
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
                }), address, elem
            })
        });

        neighbours = neighbours.concat(newNeighbours)

        neighbours = neighbours.sort((a: neighbourInfo, b: neighbourInfo) => b.address.local ? 1 : 0);
        neighbours.forEach((n) => devMenu.appendChild(n.elem));

        const newSelectedDevice = neighbours.find((n) => n.address.ip === selectedDeviceIP)
        if (newSelectedDevice) {
            devMenu.value = newSelectedDevice.address.ip;
        }

    }

    await sleep(5000)
    discoveryLoop()
}

discoveryLoop();
mainLoop()
setCurrentPage(buttons["button-basic"].html)