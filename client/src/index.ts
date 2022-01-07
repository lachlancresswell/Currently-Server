import * as influx from 'influx';
import * as HTML from './html'

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

// GLOBALS
const neighbours: neighbourInfo[] = [];
let devButtons: HTMLOptionElement[] = [];
let curDevice = 0;
const devMenu = document.getElementById("device-menu") as HTMLDivElement
let dbData: {
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
let buttons = {
    "button-basic": document.getElementById("button-basic") as HTMLAnchorElement,
    "button-l1": document.getElementById("button-l1") as HTMLAnchorElement,
    "button-l2": document.getElementById("button-l2") as HTMLAnchorElement,
    "button-l3": document.getElementById("button-l3") as HTMLAnchorElement,
    "button-adv": document.getElementById("button-adv") as HTMLAnchorElement,
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


(async () => {
    try {
        while (1) {
            if (neighbours && neighbours[curDevice]) {
                const db = neighbours[curDevice]

                db.influx.query(`
            select "L1 Voltage", "L1 Current", "L2 Voltage", "L2 Current", "L3 Voltage", "L3 Current", "Grid Frequency", "Power Factor", "Total Apparent Power" from modbus
            order by time desc
            limit 10
          `).then((res: any) => {
                    if (res && res.length) {
                        console.log(res[res.length - 1]);
                        dbData = {
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

                        updateDisplay();
                    }
                })
            }

            await sleep(1000)
        }

    } catch (e) {
        // Deal with the fact the chain failed
    }
})();

const updateDisplay = () => {
    if (dbData && dbData != undefined) {
        for (const [key, value] of Object.entries(dbData)) {
            if (document.getElementById(key) != null) (document.getElementById(key) as HTMLDivElement).innerText = value
        };
    }
}

const buttonHandler = (button: string, contents: any) => {
    const details = document.getElementById("single-page") as HTMLDivElement;
    details.style.visibility = "hidden";
    details.innerHTML = contents;
    updateDisplay();
    details.style.visibility = "visible";

    for (const [key, value] of Object.entries(buttons)) {
        if (key === button) value.classList.add('button-selected')
        else value.classList.remove('button-selected')
    }
}

buttonHandler("button-basic", HTML.pageBasic())
buttons["button-basic"].onclick = () => buttonHandler("button-basic", HTML.pageBasic())
buttons["button-l1"].onclick = () => buttonHandler("button-l1", HTML.pagePhase(1))
buttons["button-l2"].onclick = () => buttonHandler("button-l2", HTML.pagePhase(2))
buttons["button-l3"].onclick = () => buttonHandler("button-l3", HTML.pagePhase(3))
buttons["button-adv"].onclick = () => buttonHandler("button-adv", HTML.pageAdv())
