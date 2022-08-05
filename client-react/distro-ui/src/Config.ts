


export const getConfig = (deviceUrl: string): Promise<object | Error> => new Promise((resolve, reject) => {
    var xmlHttp = new XMLHttpRequest();
    const target = window.location.protocol + '//' + window.location.host + '/' + deviceUrl + "/config";
    xmlHttp.open("GET", target, true); // false for synchronous request
    xmlHttp.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            resolve(JSON.parse(xmlHttp.responseText));
        } else {
            reject(Error(`${this.status} ${xmlHttp.statusText} @ ${target}`));
        }
    };
    xmlHttp.send(null);
});