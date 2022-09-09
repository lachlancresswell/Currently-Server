import * as Plugin from '../plugin'
import * as Types from '../types'
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

export interface influxRtn {
    _field: string,
    _measurement: string,
    _start: string,
    _stop: string,
    _time: string,
    _value: number,
    host: string,
    name: string,
    result: string,
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
        this.dbs.push(db.getQueryApi(this.org))
    };

    static queryDB = (db: QueryApi, fluxQuery: string) => db.collectRows(fluxQuery)

    /**
 * Pulls data from Influx database
 * @returns Resolves with database response or rejects with error message
 */
    static pollServer = async (db: QueryApi) => {
        const data: influxRtn[] = await db.collectRows(`
        from(bucket: "mybucket")
          |> range(start: 2022-06-14)
          |> filter(fn: (r) => r["_measurement"] == "modbus")
          |> filter(fn: (r) => r["_field"] == "L1 Voltage" or r["_field"] == "L2 Voltage" or r["_field"] == "L3 Voltage" or r["_field"] == "L1 Current" or r["_field"] == "L2 Current" or r["_field"] == "L3 Current" or r["_field"] == "Power Factor" or r["_field"] == "Total Apparent Power" or r["_field"] == "Grid Frequency")
          |> last()`)

        if (data && data.length) {
            const phaseData: Types.DistroData = {
                time: new Date(data[0]._time),
                pf: parseInt(data.find((d) => d._field === 'Power Factor')!._value.toFixed(0)),
                kva: parseInt(data.find((d) => d._field === 'Total Apparent Power')!._value.toFixed(0)),
                hz: parseInt(data.find((d) => d._field === 'Grid Frequency')!._value.toFixed(0)),
                phases: [{
                    voltage: parseInt(data.find((d) => d._field === 'L1 Voltage')!._value.toFixed(0)),
                    amperage: parseInt(data.find((d) => d._field === 'L1 Current')!._value.toFixed(0)),
                    phase: 1,
                }, {
                    voltage: parseInt(data.find((d) => d._field === 'L2 Voltage')!._value.toFixed(0)),
                    amperage: parseInt(data.find((d) => d._field === 'L2 Current')!._value.toFixed(0)),
                    phase: 2,
                }, {
                    voltage: parseInt(data.find((d) => d._field === 'L3 Voltage')!._value.toFixed(0)),
                    amperage: parseInt(data.find((d) => d._field === 'L3 Current')!._value.toFixed(0)),
                    phase: 3,
                }]
            }
            return phaseData
        } else return undefined;

    };

    static pollRange = async (db: QueryApi, start: string, end: string = 'now()', avg = '30s') => {
        const query = `
        from(bucket: "mybucket")
          |> range(start: ${start}, stop: ${end})
        |> filter(fn: (r) => r["_measurement"] == "modbus")
        |> filter(fn: (r) => r["_field"] == "L3 Voltage" or r["_field"] == "L2 Voltage" or r["_field"] == "L1 Voltage" or r["_field"] == "L1 Current" or r["_field"] == "L2 Current" or r["_field"] == "L3 Current")
          |> timedMovingAverage(every: ${avg}, period: ${avg})
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
