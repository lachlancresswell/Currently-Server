import * as influx from 'influx';
// import * as os from 'os';

const Influx = new influx.InfluxDB({
    host: '192.168.8.151',
    database: 'influx',
    path: '/influx',
    port: 8080,
    protocol: 'https',
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
            select "L1 Voltage", "L1 Current", "L2 Voltage", "L2 Current", "L3 Voltage", "L3 Current", "Grid Frequency", "Power Factor", "Total Apparent Power" from modbus
            order by time desc
            limit 10
          `).then((res: any) => {
                console.log(res[res.length - 1]['L1 Voltage']);
                console.log(res[res.length - 1]['L1 Current']);
                console.log(res[res.length - 1]["L1 Voltage"]);
                console.log(res[res.length - 1]["L1 Current"]);
                console.log(res[res.length - 1]["L2 Voltage"]);
                console.log(res[res.length - 1]["L2 Current"]);
                console.log(res[res.length - 1]["L3 Voltage"]);
                console.log(res[res.length - 1]["L3 Current"]);
                console.log(res[res.length - 1]["Grid Frequency"]);
                console.log(res[res.length - 1]["Power Factor"]);
                console.log(res[res.length - 1]["Total Apparent Power"]);
                const l1Voltage = (Math.round(res[res.length - 1]["L1 Voltage"])).toString();
                const l1Current = (Math.ceil(res[res.length - 1]["L1 Current"] * 10) / 10).toFixed(1);
                const l2Voltage = (Math.round(res[res.length - 1]["L2 Voltage"])).toString();
                const l2Current = (Math.ceil(res[res.length - 1]["L2 Current"] * 10) / 10).toFixed(1);
                const l3Voltage = (Math.round(res[res.length - 1]["L3 Voltage"])).toString();
                const l3Current = (Math.ceil(res[res.length - 1]["L3 Current"] * 10) / 10).toFixed(1);
                const gridFreq = (Math.round(res[res.length - 1]["Grid Frequency"] * 10) / 10).toFixed(1);
                const powerFactor = (Math.round(res[res.length - 1]["Power Factor"])).toString();
                const apparentPower = (Math.round(res[res.length - 1]["Total Apparent Power"])).toString();
                const l1CurrentRound = (Math.round(res[res.length - 1]["L1 Current"])).toString();
                const l2CurrentRound = (Math.round(res[res.length - 1]["L2 Current"])).toString();
                const l3CurrentRound = (Math.round(res[res.length - 1]["L3 Current"])).toString();

                if (document.getElementById("l1-voltage") != null) (document.getElementById("l1-voltage") as HTMLDivElement).innerText = l1Voltage;
                if (document.getElementById("l1-amperage") != null) (document.getElementById("l1-amperage") as HTMLDivElement).innerText = l1Current;
                if (document.getElementById("l2-voltage") != null) (document.getElementById("l2-voltage") as HTMLDivElement).innerText = l2Voltage;
                if (document.getElementById("l2-amperage") != null) (document.getElementById("l2-amperage") as HTMLDivElement).innerText = l2Current;
                if (document.getElementById("l3-voltage") != null) (document.getElementById("l3-voltage") as HTMLDivElement).innerText = l3Voltage;
                if (document.getElementById("l3-amperage") != null) (document.getElementById("l3-amperage") as HTMLDivElement).innerText = l3Current;
                if (document.getElementById("grid-freq") != null) (document.getElementById("grid-freq") as HTMLDivElement).innerText = gridFreq;
                if (document.getElementById("power-factor") != null) (document.getElementById("power-factor") as HTMLDivElement).innerText = powerFactor;
                if (document.getElementById("apparent-power") != null) (document.getElementById("apparent-power") as HTMLDivElement).innerText = apparentPower;
                if (document.getElementById("l1-amperage-round") != null) (document.getElementById("l1-amperage-round") as HTMLDivElement).innerText = l1CurrentRound;
                if (document.getElementById("l2-amperage-round") != null) (document.getElementById("l2-amperage-round") as HTMLDivElement).innerText = l2CurrentRound;
                if (document.getElementById("l3-amperage-round") != null) (document.getElementById("l3-amperage-round") as HTMLDivElement).innerText = l3CurrentRound;
            })

            await sleep(1000)
        }

    } catch (e) {
        // Deal with the fact the chain failed
    }
})();
