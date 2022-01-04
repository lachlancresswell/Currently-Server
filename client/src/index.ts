import * as influx from 'influx';

// GLOBALS
const dbs: { influx: influx.InfluxDB, address: string, local: boolean }[] = [];
let devButtons: HTMLOptionElement[] = [];
let curDevice = 0;
const devMenu = document.getElementById("device-menu") as HTMLDivElement

// CONSTS

const basicHTML = () => '<div id="basic-details"> <div class="details-phase" id="details-l1">' +
    '                <div class="details-voltage">' +
    '                    <div id="l1-voltage" class="details-value">' +
    '                        247' +
    '                    </div>' +
    '                    <div class="details-denominator">' +
    '                        V' +
    '                    </div>' +
    '                </div>' +
    '                <div class="details-amperage">' +
    '                    <div id="l1-amperage-round" class="details-value">' +
    '                        0.0' +
    '                    </div>' +
    '                    <div class="details-denominator">' +
    '                        A' +
    '                    </div>' +
    '                </div>' +
    '            </div>' +
    '            <div class="details-phase" id="details-l2">' +
    '                <div class="details-voltage">' +
    '                    <div id="l2-voltage" class="details-value">' +
    '                        247' +
    '                    </div>' +
    '                    <div class="details-denominator">' +
    '                        V' +
    '                    </div>' +
    '                </div>' +
    '                <div class="details-amperage">' +
    '                    <div id="l2-amperage-round" class="details-value">' +
    '                        0.0' +
    '                    </div>' +
    '                    <div class="details-denominator">' +
    '                        A' +
    '                    </div>' +
    '                </div>' +
    '            </div>' +
    '            <div class="details-phase" id="details-l3">' +
    '                <div class="details-voltage">' +
    '                    <div id="l3-voltage" class=" details-value">' +
    '                        247' +
    '                    </div>' +
    '                    <div class="details-denominator">' +
    '                        V' +
    '                    </div>' +
    '                </div>' +
    '                <div class="details-amperage">' +
    '                    <div id="l3-amperage-round" class="details-value">' +
    '                        0.0' +
    '                    </div>' +
    '                    <div class="details-denominator">' +
    '                        A' +
    '                    </div>' +
    '                </div>' +
    '            </div></div>';

const updatePhase = (phase: number) =>
    `<div id="details">
                    <div class="phase-info" id="details-l${phase}">
                        <div id="details-l1-voltage">
                            <div id="l${phase}-voltage" class="details-value details-more-70">
                                247
                            </div>
                            <div class="details-denominator details-more-30">
                                V
                            </div>
                        </div>
                        <div id="details-l1-amperage">
                            <div id="l${phase}-amperage" class="details-value details-more-70">
                                0.0
                            </div>
                            <div class="details-denominator details-more-30">
                                A
                            </div>
                        </div>
                    </div>
                    <div id="details-minor">
                        <div class="pf" id="pf">
                            <div id="power-factor" class="details-value details-more-70">
                                0.0
                            </div>
                            <div class="details-denominator details-more-30">
                                PF
                            </div>
                        </div>
                        <div class="kva" id="kva">
                            <div id="apparent-power" class="details-value details-more-70">
                                0.0
                            </div>
                            <div class="details-denominator details-more-30">
                                kVA
                            </div>
                        </div>
                    </div>
                </div>`;


const updateAdv = () =>
    `<div id="container"><div id="subcontainer-1">
                    <div id="adv-col-1">
                        <div id="l1-voltage" class="value-container l1">
                            246
                        </div>
                        <div id="l2-voltage" class="value-container l2">
                            245
                        </div>
                        <div id="l3-voltage" class="value-container l3">
                            246
                        </div>
                        <div id="power-factor" class="value-container pf">
                            0.0
                        </div>
                        <div id="apparent-power" class="value-container kva">
                            0.0
                        </div>
                    </div>
                    <div id="adv-col-2">
                        <div class="denomination-container l1">
                            V
                        </div>
                        <div class="denomination-container l2">
                            V
                        </div>
                        <div class="denomination-container l3">
                            V
                        </div>
                        <div class="denomination-container pf">
                            pf
                        </div>
                        <div class="denomination-container kva">
                            kVA
                        </div>
                    </div>
                </div>
                <div id="subcontainer-2">
                    <div id="adv-col-3">
                        <div id="l1-amperage" class="value-container l1">
                            0.0
                        </div>
                        <div id="l2-amperage" class="value-container l2">
                            0.0
                        </div>
                        <div id="l3-amperage" class="value-container l3">
                            0.0
                        </div>
                        <div class="value-container blank">
                            EMP
                        </div>
                        <div id="grid-freq" class="value-container freq">
                            50
                        </div>
                    </div>
                    <div id="adv-col-4">
                        <div class="denomination-container l1">
                            A
                        </div>
                        <div class="denomination-container l2">
                            A
                        </div>
                        <div class="denomination-container l3">
                            A
                        </div>
                        <div class="denomination-container blank">
                            TY
                        </div>
                        <div class="denomination-container freq">
                            Hz
                        </div>
                    </div>
                </div></div>`;

// FUNCTIONS
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getDatabases = () => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", window.location.href + "neighbours", false); // false for synchronous request
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText)
}

// const devButton = (id: string, name: string, selected: boolean) => `<a class="button ${selected ? 'button-selected' : ''}" id="${id}">${name}</a>`
const devElement = (id: string, name: string, selected: boolean, onclick: any): HTMLOptionElement => {
    const elem = document.createElement("option");
    // elem.classList.add("button")
    // if (selected) elem.classList.add("button-selected")
    elem.id = id;
    elem.value = id;
    elem.innerText = name;
    // elem.onclick = onclick;
    return elem;
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
getDatabases().addresses.forEach((address: { ip: string, local: boolean }) => {
    dbs.push({
        influx: new influx.InfluxDB({
            host: window.location.hostname,
            database: 'influx',
            path: `/${(address.ip).replace(':', '/')}/influx`,
            port: parseInt(window.location.port),
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
        }), address: address.ip, local: address.local
    })
});

if (dbs.length > 1) {
    dbs.forEach((db: { influx: influx.InfluxDB, address: string, local: boolean }, i: number) => {
        const id = i + ':' + db.address
        const e = devElement(id, db.local ? "Local" : db.address.split('.')[3], (i === curDevice), deviceButtonHandler)
        devMenu.appendChild(e)
        devButtons.push(e)
        console.log({ id })
    });
} else {
    devMenu.style.visibility = "hidden";
}

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

(async () => {
    try {
        while (1) {
            if (dbs && dbs[curDevice]) {
                const db = dbs[curDevice]

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

let buttons = {
    "button-basic": document.getElementById("button-basic") as HTMLAnchorElement,
    "button-l1": document.getElementById("button-l1") as HTMLAnchorElement,
    "button-l2": document.getElementById("button-l2") as HTMLAnchorElement,
    "button-l3": document.getElementById("button-l3") as HTMLAnchorElement,
    "button-adv": document.getElementById("button-adv") as HTMLAnchorElement,
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

buttonHandler("button-basic", basicHTML())
buttons["button-basic"].onclick = () => buttonHandler("button-basic", basicHTML())
buttons["button-l1"].onclick = () => buttonHandler("button-l1", updatePhase(1))
buttons["button-l2"].onclick = () => buttonHandler("button-l2", updatePhase(2))
buttons["button-l3"].onclick = () => buttonHandler("button-l3", updatePhase(3))
buttons["button-adv"].onclick = () => buttonHandler("button-adv", updateAdv())
