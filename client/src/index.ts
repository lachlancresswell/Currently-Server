import * as influx from 'influx';

const Influx = new influx.InfluxDB({
    host: window.location.hostname,
    database: 'influx',
    path: '/influx',
    port: 443,
    protocol: 'https',
    schema: [
        {
            measurement: 'modbus',
            fields: {
                current: influx.FieldType.FLOAT,
            },
            tags: ['host']
        }
    ]
});

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



const view = document.getElementById("view") as HTMLDivElement;
const details = document.getElementById("single-page") as HTMLDivElement;


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let res: {
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

            Influx.query(`
            select "L1 Voltage", "L1 Current", "L2 Voltage", "L2 Current", "L3 Voltage", "L3 Current", "Grid Frequency", "Power Factor", "Total Apparent Power" from modbus
            order by time desc
            limit 10
          `).then((res: any) => {
                console.log(res[res.length - 1]['L1 Voltage']);
                res = {
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
            })

            await sleep(1000)
        }

    } catch (e) {
        // Deal with the fact the chain failed
    }
})();

const updateDisplay = () => {
    if (res && res != undefined) {

        for (const [key, value] of Object.entries(res)) {
            console.log({ key, value })
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
