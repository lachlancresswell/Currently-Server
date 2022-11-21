import * as Influx from '../Plugins/influx';


// describe('instantiation', () => {
//     test('start', async () => {
//         const inf = new Influx.plugin();
//         inf.addDB('13.51.41.21');
//         const rtn = await Influx.plugin.queryDB(inf.dbs[0], `
//         from(bucket: "mybucket")
//   |> range(start: -10s)
//   |> filter(fn: (r) => r["_measurement"] == "modbus")
//   |> last()
//   `)
//         console.log(rtn)
//         debugger;
//         expect(1).toBe(2);
//     })
// })

describe('date processing', () => {
    test('should create null values in date series when difference between two dates is larger than 120 seconds', () => {
        const now = new Date().getTime();
        const arr = [{
            x: new Date(),
            y: 1.0
        }, {
            x: new Date(now + 600 * 1000), //10 mins
            y: 2.0,
        }, {
            x: new Date(now + 660 * 1000), //11 mins
            y: 3.0,
        }, {
            x: new Date(now + 720 * 1000), //12 mins
            y: 4.0,
        }, {
            x: new Date(now + 780 * 1000), //13 mins
            y: 5.0,
        }, {
            x: new Date(now + 960 * 1000), //16 mins
            y: 6.0,
        }, {
            x: new Date(now + 1020 * 1000), //17 mins
            y: 7.0,
        }];

        const phase: Influx.Phase = {
            amperage: [...arr],
            voltage: [...arr]
        }

        const startLen = phase.amperage.length;
        Influx.nullPadding(phase, arr[0].x, arr[arr.length - 1].x);

        expect(phase.amperage.length).toBe(startLen + 2 + 2)
        expect(phase.amperage.filter((val) => !val.y)).toHaveLength(4)
        expect(phase.voltage.filter((val) => !val.y)).toHaveLength(4)
        expect(phase.amperage[2].y).toBeFalsy()
        expect(phase.amperage[7].y).toBeFalsy()
        expect(phase.amperage[0].y).toBeFalsy()
        expect(phase.amperage[0].x.getTime()).toBeLessThan(arr[0].x.getTime())
    });
})