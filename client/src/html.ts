/**
 * Basic HTML page
 * @returns Page HTML contents
 */
export const pageBasic = () => '<div id="basic-details"> <div class="details-phase" id="details-l1">' +
    '                <div class="details-voltage">' +
    '                    <div id="l1-voltage" class="details-value">' +
    '                        -' +
    '                    </div>' +
    '                    <div class="details-denominator">' +
    '                        V' +
    '                    </div>' +
    '                </div>' +
    '                <div class="details-amperage">' +
    '                    <div id="l1-amperage-round" class="details-value">' +
    '                        -' +
    '                    </div>' +
    '                    <div class="details-denominator">' +
    '                        A' +
    '                    </div>' +
    '                </div>' +
    '            </div>' +
    '            <div class="details-phase" id="details-l2">' +
    '                <div class="details-voltage">' +
    '                    <div id="l2-voltage" class="details-value">' +
    '                        -' +
    '                    </div>' +
    '                    <div class="details-denominator">' +
    '                        V' +
    '                    </div>' +
    '                </div>' +
    '                <div class="details-amperage">' +
    '                    <div id="l2-amperage-round" class="details-value">' +
    '                        -' +
    '                    </div>' +
    '                    <div class="details-denominator">' +
    '                        A' +
    '                    </div>' +
    '                </div>' +
    '            </div>' +
    '            <div class="details-phase" id="details-l3">' +
    '                <div class="details-voltage">' +
    '                    <div id="l3-voltage" class=" details-value">' +
    '                        -' +
    '                    </div>' +
    '                    <div class="details-denominator">' +
    '                        V' +
    '                    </div>' +
    '                </div>' +
    '                <div class="details-amperage">' +
    '                    <div id="l3-amperage-round" class="details-value">' +
    '                        -' +
    '                    </div>' +
    '                    <div class="details-denominator">' +
    '                        A' +
    '                    </div>' +
    '                </div>' +
    '            </div></div>';

/**
 * Phase HTML page
 * @param phase Phase number used for IDs
 * @returns Page HTML contents
 */
export const pagePhase = (phase: number) =>
    `<div id="details">
                    <div class="phase-info" id="details-l${phase}">
                        <div id="details-l1-voltage">
                            <div id="l${phase}-voltage" class="details-value details-more-70">
                                -
                            </div>
                            <div class="details-denominator details-more-30">
                                V
                            </div>
                        </div>
                        <div id="details-l1-amperage">
                            <div id="l${phase}-amperage" class="details-value details-more-70">
                                -
                            </div>
                            <div class="details-denominator details-more-30">
                                A
                            </div>
                        </div>
                    </div>
                    <div id="details-minor">
                        <div class="pf" id="pf">
                            <div id="power-factor" class="details-value details-more-70">
                                -
                            </div>
                            <div class="details-denominator details-more-30">
                                PF
                            </div>
                        </div>
                        <div class="kva" id="kva">
                            <div id="apparent-power" class="details-value details-more-70">
                                -
                            </div>
                            <div class="details-denominator details-more-30">
                                kVA
                            </div>
                        </div>
                    </div>
                </div>`;


/**
 * Advanced HTML page
 * @returns Page HTML contents
 */
export const pageAdv = () =>
    `<div id="container"><div id="subcontainer-1">
                    <div id="adv-col-1">
                        <div id="l1-voltage" class="value-container l1">
                            -
                        </div>
                        <div id="l2-voltage" class="value-container l2">
                            -
                        </div>
                        <div id="l3-voltage" class="value-container l3">
                            -
                        </div>
                        <div id="power-factor" class="value-container pf">
                            -
                        </div>
                        <div id="apparent-power" class="value-container kva">
                            -
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
                            -
                        </div>
                        <div id="l2-amperage" class="value-container l2">
                            -
                        </div>
                        <div id="l3-amperage" class="value-container l3">
                            -
                        </div>
                        <div class="value-container blank">
                            EMP
                        </div>
                        <div id="grid-freq" class="value-container freq">
                            -
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

export const pageChart = () => `<div id="loader"></div>
<div id="notification"></div>
<canvas id="myChart" width="100%"  height="65%"></canvas><div id="htmlLegend"></div>`;

export const pageConfig = () => `
<div id="config-menu">
        <div id="config-header">Device Name</div>
        <input id="input-name" maxlength="12"></input>
        <div id="config-buttons">
            <button id="button-save">
                SAVE</button>
            <button id="button-clear">
                CLEAR</button>
        </div>
        <div id="config-header">Averaging Period</div>
            <select id="averaging-period">
                <option id="averging-none" value="none">None</option>
                <option id="averging-10s" value="10s">10s</option>
                <option id="averging-30s" value="30s">30s</option>
                <option id="averging-1m" value="1m">1m</option>
                <option id="averging-2m" value="2m">2m</option>
                <option id="averging-5m" value="5m">5m</option>
            </select>
        <div id="config-header">View Period</div>
        <select id="viewing-period">
            <option id="viewing-1m" value="1m">1m</option>
            <option id="viewing-5m" value="5m">5m</option>
            <option id="viewing-10m" value="10m">10m</option>
            <option id="viewing-30m" value="30m">30m</option>
            <option id="viewing-1h" value="1h">1h</option>
            <option id="viewing-5h" value="5h">5h</option>
            <option id="viewing-10h" value="10h">10h</option>
            <option id="viewing-24h" value="24h">24h</option>
        </select>
</div>`;


export const pageDebug = (database: string, modbus: string, databaseIP: string, modbusIP: string, time: string, dbTime: string, browserTime: string) => `
<div id="config-menu">
    <div class="debug-details">
        <div>Database: ${database}</div>
        <div>Server IP: ${databaseIP}</div>
        <div>Modbus IP: ${modbusIP}</div>
        <div>Modbus: ${modbus}</div>
        <div>Server Time: ${time}</div>
        <div>DB Time: ${dbTime}</div>
        <div>Browser Time: ${browserTime}</div>
    </div>
</div>`;

/**
 * Creates an option element for the device browser/dropdown
 * @param id HTML id
 * @param name HTML name
 * @param selected Whether the option starts as selected or not
 * @param onclick Callback for clicking of element in list
 * @returns HTML option element
 */
export const devElement = (id: string, name: string, selected: boolean, onclick: any): HTMLOptionElement => {
    const elem = document.createElement("option");
    elem.id = id;
    elem.value = id;
    elem.innerText = name;
    elem.onclick = onclick;
    return elem;
}