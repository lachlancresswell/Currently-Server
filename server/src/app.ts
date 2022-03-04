import express from 'express';
import path from 'path';
import cors from 'cors';
import httpProxy from 'http-proxy';
import fs from 'fs';
import http from 'http';
import https from 'https';
import * as NIC from './nic';
import { Mdns } from "./mdns";

// Constants
const HTTP_PORT: number = parseInt(process.env.HTTP_PORT as string) || 80;
const HTTPS_PORT: number = parseInt(process.env.HTTPS_PORT as string) || 443;
const INFLUX_PORT = parseInt(process.env.INFLUX_PORT as string) || 8086;
const HTTP_MDNS_SERVICE_NAME = 'http-my-service'
const HTTPS_MDNS_SERVICE_NAME = 'https-my-service'
const MDNS_RECORD_TYPE = 'SRV';
const MDNS_DOMAIN = '.local';
const SERVICE_NAME = 'DCA';
const DEFAULT_DEVICE_NAME = "my-device" + HTTP_PORT
const CONFIG_PATH = process.env.CONFIG_FILE || './default.json';

const privateKey = fs.readFileSync('../cert/server-selfsigned.key', 'utf8');
const certificate = fs.readFileSync('../cert/server-selfsigned.crt', 'utf8');
const ssl = { key: privateKey, cert: certificate };

const saveConfig = () => fs.writeFile(CONFIG_PATH, JSON.stringify(config), () => { });

const nicAddresses = NIC.getAddresses()!;

let config: { Device: { name: string } };
try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
} catch (e: any) {
    config = { Device: { name: DEFAULT_DEVICE_NAME } }
    saveConfig()
}
interface addressObj {
    ip: string,
    name: string,
    local: boolean,
    modbusIP: string,
}
let neighbours: { addresses: addressObj[] } = { addresses: [] };

const formatIPandPort = (response: { answers: any[] }) => (response.answers[2].data as string) + ':' + response.answers[1].data.port;

var MDNS = new Mdns({
    HTTP_PORT,
    HTTPS_PORT,
    HTTP_MDNS_SERVICE_NAME,
    HTTPS_MDNS_SERVICE_NAME,
    MDNS_RECORD_TYPE,
    MDNS_DOMAIN,
    SERVICE_NAME
});

MDNS.attachResponseHandler((response: any) => {
    if ((response.answers[0].name === HTTP_MDNS_SERVICE_NAME || response.answers[0].name === HTTPS_MDNS_SERVICE_NAME)) {

        const incomingIP = formatIPandPort(response)
        let name = response.answers[2].name;
        const modbusIP = response.answers[response.answers.length - 1].data;
        const domainLoc = name.indexOf('.local');
        if (domainLoc) name = name.substring(0, domainLoc)
        // Find if response is a loopback e.g the local device
        let local = nicAddresses.some((address: { name: string, ip: string, mask: string | null }) => (address.ip === response.answers[2].data && (response.answers[0].data.port === HTTP_PORT || response.answers[1].data.port.toString === HTTPS_PORT)));

        console.log('Response from - ' + incomingIP)

        // Check if incoming address is new or not
        if ((!neighbours.addresses.filter((address: addressObj) => (address.ip === incomingIP && address.local === local)).length)) {

            neighbours.addresses.push({ ip: incomingIP, name, local, modbusIP: (modbusIP === '0.0.0.0') ? '' : modbusIP })
            const uri = incomingIP.replace(':', '/');

            /**
             * External influx proxy
             */
            app.all(`/${uri}/*`, function (req: any, res: any) {
                const target = "http://" + (req.url.substring(req.url.indexOf("/") + 1).replace("/", ':'));
                console.log('Proxying to external influx - ' + target.substring(0, 30) + '...')
                apiProxy.web(req, res, {
                    //ssl,
                    target,
                    secure: false // Prevents errors with self-signed certß
                }, (e: Error) => console.log(e));
            });
        }

        neighbours.addresses.sort((a, b) => a.local ? 1 : 0);
    }
})


MDNS.attachQueryHandler(() => MDNS.sendUpdate(nicAddresses.map(a => a.ip), DEFAULT_DEVICE_NAME, process.env.MODBUS_GATEWAY_IP))

/**
 * Perform mdns query every ms milliseconds
 * @param ms How often to check in ms
 */
const discoveryLoop = (ms: number) => {
    neighbours = { addresses: [] };

    MDNS.sendQuery()
    setTimeout(() => {
        discoveryLoop(ms);
    }, ms)
}

var apiProxy = httpProxy.createProxyServer();

// App
const app = express();
app.use(cors({
    'allowedHeaders': ['Content-Type'],
    'origin': '*',
    'preflightContinue': true
}));

app.use(express.static('../client/dist/'));

/**
 * Proxy /influx requests to influx server via HTTPS
 */
app.all("/influx/*", function (req: express.Request, res: any) {
    const target = 'https://' + 'localhost' + ':' + INFLUX_PORT + req.url.substring(req.url.indexOf("x") + 1);
    console.log('Proxying to influx - ' + target.substring(0, 30))
    apiProxy.web(req, res, {
        ssl,
        target,
        secure: false // Prevents errors with self-signed certß
    }, (e: Error) => {
        console.log(e)
    });
});

/**
 * Neighbouring server API endpoint
 */
app.get('/neighbours', (req: any, res: any) => {
    res.send(JSON.stringify(neighbours))
})

app.post('/device-name/*', (req: express.Request, res: any) => {
    config.Device.name = req.get("device-name")!;
    if (!config.Device.name) config.Device.name = DEFAULT_DEVICE_NAME;
    res.send(JSON.stringify(config.Device.name));
    MDNS.sendUpdate(nicAddresses.map(a => a.ip), DEFAULT_DEVICE_NAME, process.env.MODBUS_GATEWAY_IP);
    neighbours.addresses.find((n) => n.local)!.name = config.Device.name;
    saveConfig();
})

app.get('/device-name/*', (req: any, res: any) => {
    res.send(JSON.stringify(config.Device.name))
})

/**
 * Client
 */
app.get('/', (req: any, res: any) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});


discoveryLoop(30000);

const httpServer = http.createServer(app);
const httpsServer = https.createServer(ssl, app);

httpServer.listen(HTTP_PORT, () => {
    console.log('HTTP Server running on port ' + HTTP_PORT);
});

httpsServer.listen(HTTPS_PORT, () => {
    console.log('HTTPS Server running on port ' + HTTPS_PORT);
});
