import * as influx from 'influx';
// import * as os from 'os';

const Influx = new influx.InfluxDB({
    host: '192.168.8.151',
    database: 'influx',
    schema: [
        {
            measurement: 'modbus',
            fields: {
                current: influx.FieldType.FLOAT,
            },
            tags: ['host']
        }
    ]
});

console.log(Influx)

interface modbus {
    l1Voltage: number,
    l1Current: number,
    l2Voltage: number,
    l2Current: number,
    l3Voltage: number,
    l3Current: number,
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    try {
        while (1) {

            Influx.query(`
            select "L1 Voltage", "L1 Current", "L2 Voltage", "L2 Current", "L3 Voltage", "L3 Current" from modbus
            order by time desc
            limit 10
          `).then((res: any) => {
                console.log(res[res.length - 1]['L1 Voltage']);
                console.log(res[res.length - 1]['L1 Current']);
                const l1Voltage = (Math.round(res[res.length - 1]["L1 Voltage"])).toString();
                const l1Current = (Math.ceil(res[res.length - 1]["L1 Current"] * 10) / 10).toFixed(1);
                const l2Voltage = (Math.round(res[res.length - 1]["L2 Voltage"])).toString();
                const l2Current = (Math.ceil(res[res.length - 1]["L2 Current"] * 10) / 10).toFixed(1);
                const l3Voltage = (Math.round(res[res.length - 1]["L3 Voltage"])).toString();
                const l3Current = (Math.ceil(res[res.length - 1]["L3 Current"] * 10) / 10).toFixed(1);

                (document.getElementById("l1-voltage") as HTMLDivElement).innerText = l1Voltage;
                (document.getElementById("l1-amperage") as HTMLDivElement).innerText = l1Current;
                (document.getElementById("l2-voltage") as HTMLDivElement).innerText = l2Voltage;
                (document.getElementById("l2-amperage") as HTMLDivElement).innerText = l2Current;
                (document.getElementById("l3-voltage") as HTMLDivElement).innerText = l3Voltage;
                (document.getElementById("l3-amperage") as HTMLDivElement).innerText = l3Current;
            })

            await sleep(1000)
        }

    } catch (e) {
        // Deal with the fact the chain failed
    }
})();
