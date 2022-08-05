import * as Plugin from '../plugin'
import { InfluxDB, QueryApi } from '@influxdata/influxdb-client-browser'

interface FluxQuery {
    result: string;
    _start: string;
    _stop: string,
    _time: string,
    _field: string,
    _measurement: string,
    _value: string | number,
    host: string,
    name: string,
    table: number,
    type: string,
}

export class plugin extends Plugin.Instance {
    dbs: QueryApi[];
    /** InfluxDB authorization token */
    token: string;
    /** Organization within InfluxDB  */
    org: string;
    /**InfluxDB bucket used in examples  */
    bucket: string;
    // ONLY onboarding example
    /**InfluxDB user  */
    username: string;
    /**InfluxDB password  */
    password: string;


    constructor() {
        super()
        this.dbs = [];
        this.token = 'Y_mGtsk4oWKDA1Oo8WIl-78FeXvRqmbVkxQfYtqL67E-eB4HLTOE6HXI_TcqdJHSyHrKEKQdyArtRJm4kyBQOA=='
        this.org = 'myorg'
        this.bucket = 'mybucket'
        this.username = 'admin'
        this.password = 'James1993'
    }

    addDB = (url: string) => {
        const db = new InfluxDB({ url: url, token: this.token });//, transportOptions: { rejectUnauthorized: false } });
        //db.getQueryApi(this.org).
        this.dbs.push(db.getQueryApi(this.org))
    };

    static queryDB = (db: QueryApi, fluxQuery: string) => db.collectRows(fluxQuery)

    /**
 * Pulls data from Influx database
 * @returns Resolves with database response or rejects with error message
 */
    static pollServer = (db: QueryApi) =>
        db.collectRows(`
        from(bucket: "mybucket")
          |> range(start: -1m)
          |> filter(fn: (r) => r["_measurement"] == "modbus")
          |> filter(fn: (r) => r["_field"] == "L1 Voltage" or r["_field"] == "L2 Voltage" or r["_field"] == "L3 Voltage" or r["_field"] == "L1 Current" or r["_field"] == "L2 Current" or r["_field"] == "L3 Current" or r["_field"] == "Power Factor" or r["_field"] == "Total Apparent Power")
          |> last()`);

    static pollRange = async (db: QueryApi, start: string, end: string = 'now()') => {
        if (end.includes('now')) end = 'now()';
        else end = '-' + end;
        const query =
            `from(bucket: "mybucket")
        |> range(start: -${start}, stop: ${end})
        |> filter(fn: (r) => r["_measurement"] == "modbus")
        |> filter(fn: (r) => r["_field"] == "L3 Voltage" or r["_field"] == "L2 Voltage" or r["_field"] == "L1 Voltage" or r["_field"] == "L1 Current" or r["_field"] == "L2 Current" or r["_field"] == "L3 Current")
        |> yield(name: "mean")`;
        const data: FluxQuery[] = await db.collectRows(query);

        interface Phase {
            voltage: { y: number | string, x: Date }[]
            amperage: { y: number | string, x: Date }[]
        }

        let phases: Phase[] = [{
            voltage: [],
            amperage: [],
        }, {
            voltage: [],
            amperage: [],
        }, {
            voltage: [],
            amperage: [],
        }];
        data.forEach((row) => {
            switch (row._field) {
                case 'L1 Current':
                    phases[0].amperage.push({ y: row._value, x: new Date(row._time) })
                    break;
                case 'L1 Voltage':
                    phases[0].voltage.push({ y: row._value, x: new Date(row._time) })
                    break;
                case 'L2 Current':
                    phases[1].amperage.push({ y: row._value, x: new Date(row._time) })
                    break;
                case 'L2 Voltage':
                    phases[1].voltage.push({ y: row._value, x: new Date(row._time) })
                    break;
                case 'L3 Current':
                    phases[2].amperage.push({ y: row._value, x: new Date(row._time) })
                    break;
                case 'L3 Voltage':
                    phases[2].voltage.push({ y: row._value, x: new Date(row._time) })
                    break;
            }
        });
        return phases;
    }
}
