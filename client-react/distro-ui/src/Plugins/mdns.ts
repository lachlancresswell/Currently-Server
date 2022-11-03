import * as Plugin from '../plugin'
import * as Types from '../types'

export class plugin extends Plugin.Instance {
    neighbours: Types.addressInfo[];

    constructor() {
        super('MDNS')
        this.neighbours = [];
    }

    /**
     * Pulls list of discover neighbouring servers from the server
     * @returns Neighbouring server addresses whether they are local (match the current server address) or not
     */
    getNeighbourAddresses = (secure = false): Promise<{ addresses: Types.addressInfo[], time: string }> => new Promise((resolve, reject) => {
        const _this = this;
        var xmlHttp = new XMLHttpRequest();
        const target = window.location.protocol + '//' + window.location.host + "/neighbours"
        this.log.info('GET - ' + target)
        xmlHttp.open("GET", target, true); // false for synchronous request
        xmlHttp.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                const rtn = JSON.parse(xmlHttp.responseText) as { addresses: Types.addressInfo[] };
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

    discoveryLoop = async (): Promise<{ newNeighbours?: Types.addressInfo[], time: Date }> => {
        let serverAddresses: Types.addressInfo[];
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
        const newNeighbours: Types.addressInfo[] = [];

        if (missingNeighbourAddresses.length) {
            // Remove missing addresses
            this.neighbours = this.neighbours.filter((n) => !missingNeighbourAddresses.find((e) => e.ip === n.ip))
        }

        if (newNeighboursAddresses.length) {
            // Build new address objects
            newNeighboursAddresses.forEach(async (address) => {
                newNeighbours.push(address)
            });

            this.neighbours = this.neighbours.concat(newNeighbours)
            this.neighbours = this.neighbours.sort((a, b) => b.local ? 1 : 0);

            return { newNeighbours, time };
        }
        return { time };
    }
}
