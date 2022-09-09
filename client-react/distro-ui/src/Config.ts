import * as Types from './types'


export const getConfig = (deviceUrl: string): Promise<{ [key: string]: Types.OneStageMinMax | Types.OneStageOptions | Types.OneStageValue }> => new Promise((resolve, reject) => {
    var xmlHttp = new XMLHttpRequest();
    const target = window.location.protocol + '//' + window.location.host + '/' + deviceUrl + "/config";
    xmlHttp.open("GET", target, true);
    xmlHttp.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            resolve(JSON.parse(xmlHttp.responseText));
        } else {
            reject(Error(`${this.status} ${xmlHttp.statusText} @ ${target}`));
        }
    };
    xmlHttp.send(null);
});

export const submitConfig = (deviceUrl: string, obj: {}): Promise<boolean | Error> => new Promise((resolve, reject) => {

    const target = window.location.protocol + '//' + window.location.host + '/' + deviceUrl + "/config";

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", target, true);
    xmlHttp.setRequestHeader('Content-type', 'application/json');
    xmlHttp.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            resolve(true);
        } else {
            reject(Error(`${this.status} ${xmlHttp.statusText} @ ${target}`));
        }
    };

    xmlHttp.send(JSON.stringify(obj));
});