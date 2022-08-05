import * as Plugin from '../plugin'

interface addressInfo {
    ip: string, local: boolean, name: string, modbusIP: string, secure: boolean, influxIP: string,
}

export class plugin extends Plugin.Instance {
    neighbours: addressInfo[];

    constructor() {
        super('MDNS')
        this.neighbours = [];
    }

    /**
     * Pulls list of discover neighbouring servers from the server
     * @returns Neighbouring server addresses whether they are local (match the current server address) or not
     */
    getNeighbourAddresses = (secure = false): Promise<{ addresses: addressInfo[], time: string }> => new Promise((resolve, reject) => {
        const _this = this;
        var xmlHttp = new XMLHttpRequest();
        const target = window.location.protocol + '//' + window.location.host + "/neighbours"
        this.log.info('GET - ' + target)
        xmlHttp.open("GET", target, true); // false for synchronous request
        xmlHttp.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                const rtn = JSON.parse(xmlHttp.responseText) as { addresses: addressInfo[] };
                resolve({ addresses: rtn.addresses.filter((a) => a.secure === secure), time: xmlHttp.getResponseHeader('Date')! })
            } else {
                _this.log.warn('Failed to GET - ' + target)
                reject({
                    target: target,
                    status: this.status,
                    statusText: xmlHttp.statusText
                });
            }
        };
        xmlHttp.send(null);
    })

    discoveryLoop = async (): Promise<{ newNeighbours?: addressInfo[], time: Date }> => {
        let serverAddresses: addressInfo[];
        let time: Date;
        try {
            const rtn = await this.getNeighbourAddresses(window.location.protocol.indexOf("https") > -1);
            serverAddresses = rtn.addresses;
            time = new Date(rtn.time);
        } catch (e) {
            throw (e);
        }

        const newNeighboursAddresses = serverAddresses.filter((incoming) => !(this.neighbours.find(existing => (existing.ip === incoming.ip) && existing.name === incoming.name)!));
        const missingNeighbourAddresses = this.neighbours.filter((existing) => !(serverAddresses.find(incoming => (existing.ip === incoming.ip) && existing.name === incoming.name)!));
        const newNeighbours: addressInfo[] = [];

        if (missingNeighbourAddresses.length) {
            // Remove missing addresses
            this.neighbours = this.neighbours.filter((n) => !missingNeighbourAddresses.find((e) => e.ip === n.ip))
        }

        if (newNeighboursAddresses.length) {
            // Build new address objects
            newNeighboursAddresses.forEach(async (address: addressInfo) => {
                newNeighbours.push(address)
            });

            this.neighbours = this.neighbours.concat(newNeighbours)
            this.neighbours = this.neighbours.sort((a: addressInfo, b: addressInfo) => b.local ? 1 : 0);

            return { newNeighbours, time };
        }
        return { time };
    }
}
