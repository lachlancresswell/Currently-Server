import * as Plugin from '../plugin'
import * as Types from '../types'
import { InfluxDB, Point, QueryApi, WriteApi } from '@influxdata/influxdb-client-browser'
import { DeleteAPI } from '@influxdata/influxdb-client-apis';

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
    url?: string;
    writeApi?: WriteApi;
    deleteApi?: DeleteAPI;



    constructor() {
        super()
        this.dbs = [];
        this.token = 'EoENRkYCQuPJaPKtwM2D9sqle14ocDcPufGuncmfhEa4uK8PogPuC87dk8zJ9sPm6yzncZj2xToYxZ2dj37yAg=='
        this.org = 'myorg'
        this.bucket = 'mybucket'
        this.username = 'admin'
        this.password = 'James1993'
    }

    addDB = (url: string) => {
        this.url = url;
        const db = new InfluxDB({ url: url, token: this.token });//, transportOptions: { rejectUnauthorized: false } });
        this.dbs.push(db.getQueryApi(this.org))
        this.writeApi = db.getWriteApi(this.org, this.bucket)
        this.deleteApi = new DeleteAPI(db)
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

    getAnnotations = async () => {
        const start = new Date(-8640000000).toISOString();

        const annotationQuery = `
        from(bucket: "mybucket")
        |> range(start: ${start}, stop: now())
        |> filter(fn: (r) => r["_measurement"] == "annotation-orange" or r["_measurement"] == "annotation-yellow" or r["_measurement"] == "annotation-purple" or r["_measurement"] == "annotation-green")`;

        const annotationData: FluxQuery[] = await this.dbs[0].collectRows(annotationQuery);

        let annotations: { y: string, x: Date, color: string }[] = [];
        annotationData.forEach((row) => {
            annotations.push({ y: row._value as string, x: new Date(row._time), color: row._field })
        });

        return annotations;
    }

    static pollRange = async (db: QueryApi, start: string, end: string = 'now()', avg = '30s') => {
        const query = `
        from(bucket: "mybucket")
          |> range(start: ${start}, stop: ${end})
        |> filter(fn: (r) => r["_measurement"] == "modbus")
        |> filter(fn: (r) => r["_field"] == "L3 Voltage" or r["_field"] == "L2 Voltage" or r["_field"] == "L1 Voltage" or r["_field"] == "L1 Current" or r["_field"] == "L2 Current" or r["_field"] == "L3 Current")
        |> aggregateWindow(every: ${avg}, fn: mean, createEmpty: false)
        |> yield(name: "mean")`;
        const data: FluxQuery[] = await db.collectRows(query);

        const annotationQuery = `
        from(bucket: "mybucket")
        |> range(start: ${start}, stop: ${end})
        |> filter(fn: (r) => r["_measurement"] == "annotation-orange" or r["_measurement"] == "annotation-yellow" or r["_measurement"] == "annotation-purple" or r["_measurement"] == "annotation-green")`;

        const annotationData: FluxQuery[] = await db.collectRows(annotationQuery);

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

        let annotations: { y: string, x: Date, color: string }[] = [];
        annotationData.forEach((row) => {
            annotations.push({ y: row._value as string, x: new Date(row._time), color: row._field })
        });
        return { phases, annotations };
    }

    createAnnotion = async (color: Types.AnnotationColor, timestamp: Date) => {
        if (this.writeApi) {
            const point1 = new Point('annotation-' + color).stringField(color, '').timestamp(timestamp)

            try {
                await this.deleteAnnotation(color);
            } catch (e) {
                console.log(e);
            }

            this.writeApi.writePoint(point1)
            this.writeApi.flush();
        }
    }

    deleteAnnotation = (color: Types.AnnotationColor) => {
        if (this.deleteApi) {
            const start = new Date(-8640000000).toISOString();
            const stop = new Date().toISOString();
            const predicate = `_measurement="annotation-${color}"`;

            return this.deleteApi.postDelete({
                org: this.org,
                bucket: this.bucket,
                body: {
                    start,
                    stop,
                    predicate,
                },
            })
        }
    }
}
