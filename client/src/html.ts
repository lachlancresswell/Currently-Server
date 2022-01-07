/**
 * Basic HTML page
 * @returns Page HTML contents
 */
export const pageBasic = () => '<div id="basic-details"> <div class="details-phase" id="details-l1">' +
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


/**
 * Advanced HTML page
 * @returns Page HTML contents
 */
export const pageAdv = () =>
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

export const pageChart = () => `<canvas id="myChart" width="100%" height="70%"></canvas>`;

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