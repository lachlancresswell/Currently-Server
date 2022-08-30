
import * as Influx from './Plugins/influx'
import * as Types from './types';

export default class Neighbour {
    influx: Influx.plugin;
    ip: string;
    local: boolean;
    name: string;
    secure: boolean;
    db: any;
    id: number;
    influxIP: string;

    constructor(info: Types.NeighbourData) {
        this.ip = info.ip;
        this.local = info.local;
        this.name = info.name;
        this.secure = info.secure;
        this.id = (info.id !== undefined && info.id > -1) ? info.id : Math.floor(Math.random() * 10);
        this.influxIP = info.influxIP;

        this.influx = new Influx.plugin();
        const target = 'http://' + window.location.host + '/' + this.urlFromIp() + '/influx/';
        this.influx.addDB(target);
        this.db = this.influx.dbs[0];
    }

    urlFromIp = () => this.ip.replace(':', '/');
}