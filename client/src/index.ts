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
    '<div id="container"><div id="subcontainer-1">' +
    '                <div id="adv-col-1">' +
    '                    <div id="l1-voltage" class="value-container l1">' +
    '                        246' +
    '                    </div>' +
    '                    <div id="l2-voltage" class="value-container l2">' +
    '                        245' +
    '                    </div>' +
    '                    <div id="l3-voltage" class="value-container l3">' +
    '                        246' +
    '                    </div>' +
    '                    <div id="power-factor" class="value-container pf">' +
    '                        0.0' +
    '                    </div>' +
    '                    <div id="apparent-power" class="value-container kva">' +
    '                        0.0' +
    '                    </div>' +
    '                </div>' +
    '                <div id="adv-col-2">' +
    '                    <div class="denomination-container l1">' +
    '                        V' +
    '                    </div>' +
    '                    <div class="denomination-container l2">' +
    '                        V' +
    '                    </div>' +
    '                    <div class="denomination-container l3">' +
    '                        V' +
    '                    </div>' +
    '                    <div class="denomination-container pf">' +
    '                        pf' +
    '                    </div>' +
    '                    <div class="denomination-container kva">' +
    '                        kVA' +
    '                    </div>' +
    '                </div>' +
    '            </div>' +
    '            <div id="subcontainer-2">' +
    '                <div id="adv-col-3">' +
    '                    <div id="l1-amperage" class="value-container l1">' +
    '                        0.0' +
    '                    </div>' +
    '                    <div id="l2-amperage" class="value-container l2">' +
    '                        0.0' +
    '                    </div>' +
    '                    <div id="l3-amperage" class="value-container l3">' +
    '                        0.0' +
    '                    </div>' +
    '                    <div class="value-container blank">' +
    '                        EMP' +
    '                    </div>' +
    '                    <div id="grid-freq" class="value-container freq">' +
    '                        50' +
    '                    </div>' +
    '                </div>' +
    '                <div id="adv-col-4">' +
    '                    <div class="denomination-container l1">' +
    '                        A' +
    '                    </div>' +
    '                    <div class="denomination-container l2">' +
    '                        A' +
    '                    </div>' +
    '                    <div class="denomination-container l3">' +
    '                        A' +
    '                    </div>' +
    '                    <div class="denomination-container blank">' +
    '                        TY' +
    '                    </div>' +
    '                    <div class="denomination-container freq">' +
    '                        Hz' +
    '                    </div>' +
    '                </div>' +
    '            </div></div>';




const buttonBasic = document.getElementById("button-basic") as HTMLAnchorElement;
const buttonL1 = document.getElementById("button-l1") as HTMLAnchorElement;
const buttonL2 = document.getElementById("button-l2") as HTMLAnchorElement;
const buttonL3 = document.getElementById("button-l3") as HTMLAnchorElement;
const buttonAdv = document.getElementById("button-adv") as HTMLAnchorElement;

const view = document.getElementById("view") as HTMLDivElement;
const details = document.getElementById("single-page") as HTMLDivElement;

details.innerHTML = basicHTML();
buttonBasic.classList.add('button-selected')
buttonL1.classList.remove('button-selected')
buttonL2.classList.remove('button-selected')
buttonL3.classList.remove('button-selected')
buttonAdv.classList.remove('button-selected')

buttonBasic.onclick = () => {
    details.style.visibility = "hidden";
    details.innerHTML = basicHTML();
    updateDisplay();
    details.style.visibility = "visible";
    buttonBasic.classList.add('button-selected')
    buttonL1.classList.remove('button-selected')
    buttonL2.classList.remove('button-selected')
    buttonL3.classList.remove('button-selected')
    buttonAdv.classList.remove('button-selected')
}

buttonL1.onclick = () => {
    details.style.visibility = "hidden";
    details.innerHTML = updatePhase(1);
    updateDisplay();
    details.style.visibility = "visible";
    buttonBasic.classList.remove('button-selected')
    buttonL1.classList.add('button-selected')
    buttonL2.classList.remove('button-selected')
    buttonL3.classList.remove('button-selected')
    buttonAdv.classList.remove('button-selected')
}

buttonL2.onclick = () => {
    details.style.visibility = "hidden";
    details.innerHTML = updatePhase(2);
    updateDisplay();
    details.style.visibility = "visible";
    buttonBasic.classList.remove('button-selected')
    buttonL1.classList.remove('button-selected')
    buttonL2.classList.add('button-selected')
    buttonL3.classList.remove('button-selected')
    buttonAdv.classList.remove('button-selected')
}

buttonL3.onclick = () => {
    details.style.visibility = "hidden";
    details.innerHTML = updatePhase(3);
    updateDisplay();
    details.style.visibility = "visible";
    buttonBasic.classList.remove('button-selected')
    buttonL1.classList.remove('button-selected')
    buttonL2.classList.remove('button-selected')
    buttonL3.classList.add('button-selected')
    buttonAdv.classList.remove('button-selected')
}


buttonAdv.onclick = () => {
    details.style.visibility = "hidden";
    details.innerHTML = updateAdv();
    updateDisplay();
    details.style.visibility = "visible";
    buttonBasic.classList.remove('button-selected')
    buttonL1.classList.remove('button-selected')
    buttonL2.classList.remove('button-selected')
    buttonL3.classList.remove('button-selected')
    buttonAdv.classList.add('button-selected')
}


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let l1Voltage: string;
let l1Current: string;
let l2Voltage: string;
let l2Current: string;
let l3Voltage: string;
let l3Current: string;
let gridFreq: string;
let powerFactor: string;
let apparentPower: string;
let l1CurrentRound: string;
let l2CurrentRound: string;
let l3CurrentRound: string;

(async () => {
    try {
        while (1) {

            Influx.query(`
            select "L1 Voltage", "L1 Current", "L2 Voltage", "L2 Current", "L3 Voltage", "L3 Current", "Grid Frequency", "Power Factor", "Total Apparent Power" from modbus
            order by time desc
            limit 10
          `).then((res: any) => {
                console.log(res[res.length - 1]['L1 Voltage']);
                l1Voltage = (Math.round(res[res.length - 1]["L1 Voltage"])).toString();
                l1Current = (Math.ceil(res[res.length - 1]["L1 Current"] * 10) / 10).toFixed(1);
                l2Voltage = (Math.round(res[res.length - 1]["L2 Voltage"])).toString();
                l2Current = (Math.ceil(res[res.length - 1]["L2 Current"] * 10) / 10).toFixed(1);
                l3Voltage = (Math.round(res[res.length - 1]["L3 Voltage"])).toString();
                l3Current = (Math.ceil(res[res.length - 1]["L3 Current"] * 10) / 10).toFixed(1);
                gridFreq = (Math.round(res[res.length - 1]["Grid Frequency"] * 10) / 10).toFixed(1);
                powerFactor = (Math.round(res[res.length - 1]["Power Factor"])).toString();
                apparentPower = (Math.round(res[res.length - 1]["Total Apparent Power"])).toString();
                l1CurrentRound = (Math.round(res[res.length - 1]["L1 Current"])).toString();
                l2CurrentRound = (Math.round(res[res.length - 1]["L2 Current"])).toString();
                l3CurrentRound = (Math.round(res[res.length - 1]["L3 Current"])).toString();

                updateDisplay();
            })

            await sleep(1000)
        }

    } catch (e) {
        // Deal with the fact the chain failed
    }
})();

const updateDisplay = () => {
    if (document.getElementById("l1-voltage") != null) (document.getElementById("l1-voltage") as HTMLDivElement).innerText = l1Voltage;
    if (document.getElementById("l1-amperage") != null) (document.getElementById("l1-amperage") as HTMLDivElement).innerText = l1Current;
    if (document.getElementById("l2-voltage") != null) (document.getElementById("l2-voltage") as HTMLDivElement).innerText = l2Voltage;
    if (document.getElementById("l2-amperage") != null) (document.getElementById("l2-amperage") as HTMLDivElement).innerText = l2Current;
    if (document.getElementById("l3-voltage") != null) (document.getElementById("l3-voltage") as HTMLDivElement).innerText = l3Voltage;
    if (document.getElementById("l3-amperage") != null) (document.getElementById("l3-amperage") as HTMLDivElement).innerText = l3Current;
    if (document.getElementById("grid-freq") != null) (document.getElementById("grid-freq") as HTMLDivElement).innerText = gridFreq;
    if (document.getElementById("power-factor") != null) (document.getElementById("power-factor") as HTMLDivElement).innerText = powerFactor;
    if (document.getElementById("apparent-power") != null) (document.getElementById("apparent-power") as HTMLDivElement).innerText = apparentPower;
    if (document.getElementById("l1-amperage-round") != null) (document.getElementById("l1-amperage-round") as HTMLDivElement).innerText = l1CurrentRound;
    if (document.getElementById("l2-amperage-round") != null) (document.getElementById("l2-amperage-round") as HTMLDivElement).innerText = l2CurrentRound;
    if (document.getElementById("l3-amperage-round") != null) (document.getElementById("l3-amperage-round") as HTMLDivElement).innerText = l3CurrentRound;
}
