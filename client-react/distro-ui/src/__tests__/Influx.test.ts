const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;


import * as Influx from '../Plugins/influx';

describe('instantiation', () => {
    test('start', async () => {
        const inf = new Influx.plugin();
        inf.addDB('13.51.41.21');
        const rtn = await Influx.plugin.queryDB(inf.dbs[0], `
        from(bucket: "mybucket")
  |> range(start: -10s)
  |> filter(fn: (r) => r["_measurement"] == "modbus")
  |> last()
  `)
        console.log(rtn)
        debugger;
        expect(1).toBe(2);
    })
})